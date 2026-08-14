import { test } from 'node:test'
import assert from 'node:assert/strict'

const plugin = await import('../lib/index.js')
const { blocksToText, findRolePrompt, renderTeamRun } = await import('../lib/teams.js')

const TEAM_CONFIG = {
  provider: 'spawn',
  maxConcurrentDelegations: 2,
  teams: [
    {
      name: 'writing',
      agents: [
        { role: 'planner', prompt: 'Plan the task.' },
        { role: 'writer', prompt: 'Write the deliverable.' },
        { role: 'reviewer', prompt: 'Review the deliverable.' },
      ],
    },
  ],
}

function makeContext() {
  const defs = []
  const policyListeners = []
  const ctx = {
    tools: { register: (def) => defs.push(def) },
    on: (event, listener) => {
      if (event === 'tools/pre-execute') policyListeners.push(listener)
    },
    logger: () => ({ info: () => {} }),
  }
  return { ctx, defs, policyListeners }
}

test('plugin registers team_list, team_run, team_delegate', () => {
  const { ctx, defs } = makeContext()
  plugin.apply(ctx, TEAM_CONFIG)
  assert.deepEqual(defs.map((d) => d.name).sort(), ['team_delegate', 'team_list', 'team_run'])
  for (const def of defs) {
    assert.ok(def.description.length > 10)
    assert.ok(def.output && def.output.schema)
  }
})

test('team_list lists configured teams and roles', async () => {
  const { ctx, defs } = makeContext()
  plugin.apply(ctx, TEAM_CONFIG)
  const def = defs.find((d) => d.name === 'team_list')
  const value = await def.execute({}, { signal: new AbortController().signal, agent: {} })
  assert.equal(value.teams.length, 1)
  assert.equal(value.teams[0].name, 'writing')
  assert.deepEqual(value.teams[0].roles, ['planner', 'writer', 'reviewer'])
})

test('team_run executes the full pipeline in order with context handoff', async () => {
  const calls = []
  const { ctx, defs } = makeContext()
  ctx.subagents = {
    start: async (provider, request) => {
      calls.push({ provider, label: request.label, prompt: request.prompt[0].text })
      const role = request.label.split('/')[1]
      const output = role === 'planner' ? 'PLAN: outline'
        : role === 'writer' ? 'WRITE: full text based on PLAN: outline'
          : 'REVIEW: pass'
      return {
        id: `run-${calls.length}`,
        result: Promise.resolve({ output: [{ type: 'text', text: output }], stopReason: 'completed' }),
        dispose: async () => {},
      }
    },
  }
  plugin.apply(ctx, TEAM_CONFIG)
  const def = defs.find((d) => d.name === 'team_run')
  const value = await def.execute(
    { team: 'writing', task: 'write a slogan' },
    { signal: new AbortController().signal, agent: {} },
  )

  assert.equal(calls.length, 3)
  assert.equal(calls[0].label, 'writing/planner')
  assert.equal(calls[1].label, 'writing/writer')
  assert.equal(calls[2].label, 'writing/reviewer')
  // context handoff: step 2's task includes step 1's output
  assert.ok(calls[1].prompt.includes('PLAN: outline'))
  assert.ok(calls[2].prompt.includes('WRITE: full text'))
  assert.equal(value.steps.length, 3)
  assert.equal(value.final, 'REVIEW: pass')
})

test('team_run fails loudly on unknown team', async () => {
  const { ctx, defs } = makeContext()
  ctx.subagents = { start: async () => { throw new Error('should not start') } }
  plugin.apply(ctx, TEAM_CONFIG)
  const def = defs.find((d) => d.name === 'team_run')
  await assert.rejects(
    def.execute({ team: 'nope', task: 'x' }, { signal: new AbortController().signal, agent: {} }),
    /unknown team/,
  )
})

test('team_run respects maxConcurrentDelegations', async () => {
  let active = 0
  let peak = 0
  const { ctx, defs } = makeContext()
  ctx.subagents = {
    start: async (_provider, request) => {
      active += 1
      peak = Math.max(peak, active)
      await new Promise((resolve) => setTimeout(resolve, 20))
      active -= 1
      return {
        id: 'run',
        result: Promise.resolve({ output: [{ type: 'text', text: 'done' }], stopReason: 'completed' }),
        dispose: async () => {},
      }
    },
  }
  plugin.apply(ctx, TEAM_CONFIG)
  const def = defs.find((d) => d.name === 'team_run')
  await def.execute({ team: 'writing', task: 'x' }, { signal: new AbortController().signal, agent: {} })
  assert.equal(peak, 1) // sequential, never parallel
})

test('pre-execute policy passes through for non-team tools', async () => {
  const { ctx, policyListeners } = makeContext()
  plugin.apply(ctx, TEAM_CONFIG)
  assert.equal(policyListeners.length, 1)
  const decision = await policyListeners[0]({ name: 'other_tool', agent: {} }, async () => ({ kind: 'allow' }))
  assert.equal(decision.kind, 'allow')
})

test('blocksToText concatenates text blocks only', () => {
  assert.equal(
    blocksToText([
      { type: 'text', text: 'hello ' },
      { type: 'reasoning', text: 'hidden' },
      { type: 'text', text: 'world' },
    ]),
    'hello world',
  )
})

test('findRolePrompt searches across teams', () => {
  const hit = findRolePrompt(TEAM_CONFIG, 'reviewer')
  assert.equal(hit.role, 'reviewer')
  assert.equal(findRolePrompt(TEAM_CONFIG, 'missing'), undefined)
})

test('renderTeamRun formats steps and final result', () => {
  const text = renderTeamRun({ team: 'writing', steps: [{ role: 'planner', output: 'P' }], final: 'F' })
  assert.ok(text.includes('writing'))
  assert.ok(text.includes('planner'))
  assert.ok(text.includes('Final result'))
})