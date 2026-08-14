import type { Context } from '@deepseek-ai/cordis'
import { registerTools } from './teams.js'
import { registerPolicy } from './policy.js'
import { Config } from './config.js'

export const name = 'dsh-team-runner'
export const inject = ['tools', 'subagents']

export { Config }
export type { Config as DshAgentTeamsConfig } from './config.js'

export function apply(ctx: Context, config: Config): void {
  registerTools(ctx, config)
  registerPolicy(ctx, config.maxConcurrentDelegations)
  ctx.logger?.(name).info(
    'dsh-team-runner loaded: provider=%s teams=%d maxConcurrent=%d',
    config.provider,
    config.teams.length,
    config.maxConcurrentDelegations,
  )
}