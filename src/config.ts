import z from '@deepseek-ai/schemastery'

/** One role inside a team: a label plus the instruction prefix used for every delegation. */
export interface TeamAgent {
  role: string
  prompt: string
}

/** A named ordered pipeline of roles; each step feeds its output to the next role. */
export interface Team {
  name: string
  agents: TeamAgent[]
}

/** Plugin configuration for dsh-agent-teams. */
export interface Config {
  /** ctx.subagents provider name (spawn / fork / acp / ...). */
  provider: string
  /** Hard cap on concurrent subagent runs started by this plugin. */
  maxConcurrentDelegations: number
  /** Named multi-agent teams available to team_run. */
  teams: Team[]
}

export const Config: z<Config> = z.object({
  provider: z.string().default('spawn').description('ctx.subagents provider name (spawn / fork / acp / ...).'),
  maxConcurrentDelegations: z.number().default(3).min(1).description('Hard cap on concurrent subagent runs started by this plugin.'),
  teams: z.array(z.object({
    name: z.string().required().description('Unique team name referenced by team_run.'),
    agents: z.array(z.object({
      role: z.string().required().description('Role label, e.g. planner / writer / reviewer.'),
      prompt: z.string().required().description('Instruction/persona used as the role prefix for every delegation.'),
    })).required().description('Ordered roles; each step feeds its output to the next role.'),
  })).default([]).description('Named multi-agent teams available to team_run.'),
})