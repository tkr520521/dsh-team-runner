import type { Context } from '@deepseek-ai/cordis'
import type { PreToolDecision } from '@deepseek-ai/dsh-tools'
import { activeDelegationCount } from './teams.js'

/**
 * Pre-dispatch policy gate for this plugin's delegation tools. Denies
 * `team_run` / `team_delegate` while the live delegation count is at the
 * configured cap, so parallel calls fail loud instead of over-subscribing the
 * subagent provider. All other tools pass straight through `next()`.
 */
export function registerPolicy(ctx: Context, maxConcurrentDelegations: number): void {
  ctx.on('tools/pre-execute', async (exec, next): Promise<PreToolDecision> => {
    if (exec.name !== 'team_run' && exec.name !== 'team_delegate') return next()
    if (activeDelegationCount() >= maxConcurrentDelegations) {
      return {
        kind: 'deny',
        reason: `concurrent delegation limit (${maxConcurrentDelegations}) reached; wait for a running subagent to finish`,
      }
    }
    return next()
  })
}