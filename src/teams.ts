import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SubagentResult, SubagentRun } from '@deepseek-ai/dsh-subagent'
import type { Config, Team, TeamAgent } from './config.js'

/** Live count of subagent runs started by this plugin (shared with policy.ts). */
let activeDelegations = 0

/** Read the current in-flight delegation count (used by the pre-execute gate). */
export function activeDelegationCount(): number {
  return activeDelegations
}

/** Concatenate the text blocks of a child's final output. */
function blocksToText(blocks: readonly ContentBlock[]): string {
  let text = ''
  for (const block of blocks) {
    if (block.type === 'text') text += block.text
  }
  return text
}

function requireParent(exec: { agent?: Agent }): Agent {
  if (!exec.agent) {
    throw new Error('team tools require a calling agent (exec.agent was undefined)')
  }
  return exec.agent
}

function findRolePrompt(config: Config, role: string): TeamAgent | undefined {
  for (const team of config.teams) {
    const match = team.agents.find((agent) => agent.role === role)
    if (match) return match
  }
  return undefined
}

/**
 * Start one one-shot subagent through the configured `ctx.subagents` provider
 * under a hard concurrency cap. The parent is always the calling agent so the
 * child inherits lineage, depth, and cancellation.
 */
async function runSubagent(
  ctx: Context,
  config: Config,
  parent: Agent,
  label: string,
  promptText: string,
  signal: AbortSignal,
): Promise<SubagentResult> {
  if (signal.aborted) {
    const error = new Error('delegation aborted before start')
    error.name = 'AbortError'
    throw error
  }
  if (activeDelegations >= config.maxConcurrentDelegations) {
    throw new Error(
      `concurrent delegation limit (${config.maxConcurrentDelegations}) reached; wait for a running subagent to finish`,
    )
  }
  activeDelegations += 1
  try {
    const run: SubagentRun = await ctx.subagents.start(config.provider, {
      label,
      prompt: [{ type: 'text', text: promptText }] as ContentBlock[],
      parent,
      signal,
    })
    try {
      const result = await run.result
      if (result.stopReason !== 'completed') {
        const partial = blocksToText(result.output)
        throw new Error(
          `subagent "${label}" ended with stop reason "${result.stopReason}"` +
            (partial ? ` (partial output: ${partial})` : ''),
        )
      }
      return result
    } finally {
      // Best-effort disposal: cancel remaining work and release resources.
      await run.dispose().catch(() => {})
    }
  } finally {
    activeDelegations -= 1
  }
}

interface TeamStep {
  role: string
  output: string
}

interface TeamRunValue {
  team: string
  steps: TeamStep[]
  final: string
}

/** Sequentially run every role of a team, feeding each output into the next prompt. */
async function runTeam(
  ctx: Context,
  config: Config,
  parent: Agent,
  teamName: string,
  task: string,
  signal: AbortSignal,
): Promise<TeamRunValue> {
  const team: Team | undefined = config.teams.find((candidate) => candidate.name === teamName)
  if (!team) {
    throw new Error(`unknown team "${teamName}"; use team_list to see configured teams`)
  }
  let context = task
  const steps: TeamStep[] = []
  for (const agent of team.agents) {
    const promptText = `${agent.prompt}\n\nTask:\n${context}`
    const result = await runSubagent(ctx, config, parent, `${team.name}/${agent.role}`, promptText, signal)
    const output = blocksToText(result.output)
    steps.push({ role: agent.role, output })
    context = output
  }
  return { team: team.name, steps, final: context }
}

function renderTeamRun(value: unknown): string {
  const v = value as TeamRunValue
  const lines = v.steps.map((step, index) => `[${index + 1}] ${step.role}:\n${step.output}`)
  return `Team "${v.team}" finished.\n\n${lines.join('\n\n')}\n\nFinal result:\n${v.final}`
}

export function registerTools(ctx: Context, config: Config): void {
  ctx.tools.register(defineTool({
    name: 'team_list',
    description: 'List the configured multi-agent teams and their ordered roles.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          teams: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string', required: true },
                roles: { type: 'array', required: true, items: { type: 'string' } },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: JSON.stringify(value, null, 2),
      }],
    },
    async execute(_args, _exec) {
      return {
        teams: config.teams.map((team) => ({
          name: team.name,
          roles: team.agents.map((agent) => agent.role),
        })),
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'team_run',
    description:
      'Run a configured team end-to-end: each role is delegated to a subagent in order, ' +
      'and every step\'s output becomes the task of the next role. Returns per-step results and the final output.',
    parameters: {
      team: { type: 'string', required: true, description: 'Team name from team_list.' },
      task: { type: 'string', required: true, description: 'The task to hand to the first role.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          team: { type: 'string', required: true },
          steps: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                role: { type: 'string', required: true },
                output: { type: 'string', required: true },
              },
            },
          },
          final: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: renderTeamRun(value) }],
    },
    async execute(args, exec) {
      const parent = requireParent(exec)
      return runTeam(ctx, config, parent, args.team, args.task, exec.signal)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'team_delegate',
    description:
      'Delegate one task to a single configured role (from any team). ' +
      'If the role matches a configured agent, its instruction prefix is applied; otherwise the raw task is delegated.',
    parameters: {
      role: { type: 'string', required: true, description: 'Role label, e.g. planner or reviewer.' },
      task: { type: 'string', required: true, description: 'Task for the delegated subagent.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          role: { type: 'string', required: true },
          output: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `[${(value as { role: string }).role}]\n${(value as { output: string }).output}`,
      }],
    },
    async execute(args, exec) {
      const parent = requireParent(exec)
      const agent = findRolePrompt(config, args.role)
      const promptText = agent ? `${agent.prompt}\n\nTask:\n${args.task}` : args.task
      const result = await runSubagent(ctx, config, parent, args.role, promptText, exec.signal)
      return { role: args.role, output: blocksToText(result.output) }
    },
  }))
}