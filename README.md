# dsh-agent-teams

> 澶?Agent 缂栨帓鎻掍欢锛氭妸 DeepSeek Harness 鐨勫瓙浠ｇ悊鑳藉姏缁勮鎴愩€屽洟闃熸祦姘寸嚎銆嶃€?> Multi-agent orchestration for DeepSeek Harness: turn the `subagents` seam into reusable, policy-gated agent teams.

[![license](https://img.shields.io/badge/license-MIT-blue)](#license) ![api](https://img.shields.io/badge/API-rc.6-8A2BE2) ![tools](https://img.shields.io/badge/tools-3-2ea44f)

## 杩欐槸浠€涔?/ What is this

`dsh-agent-teams` 鏄竴涓伒寰?Harness銆屼竴鍒囩殕鎻掍欢銆嶇悊蹇电殑缂栨帓鎻掍欢銆傚畠涓嶉噸鏂板彂鏄?Agent 寰幆锛?鑰屾槸缁勫悎宸叉湁鐨勬彃浠跺寲鑳藉姏鐐癸細

- **宸ュ叿锛坱ools锛?*锛氭敞鍐?`team_list` / `team_run` / `team_delegate` 涓変釜妯″瀷鍙宸ュ叿銆?- **瀛愪唬鐞嗭紙subagents锛?*锛氶€氳繃 `ctx.subagents.start()` 鍦?`spawn` / `fork` / `acp` 绛?provider 涓婃淳鐢熷瓙浠ｇ悊銆?- **绛栫暐锛坧olicy锛?*锛氱敤 `tools/pre-execute` 鐎戝竷浜嬩欢鍋氬苟鍙戦棬绂侊紝瓒呰繃涓婇檺鐨勫洟闃熻皟鐢ㄧ洿鎺ユ嫆缁濓紙fail loud锛夈€?
閰嶇疆涓€涓洟闃燂紙濡?planner 鈫?writer 鈫?reviewer锛夛紝妯″瀷灏辫兘鐢ㄤ竴娆?`team_run` 瑙﹀彂瀹屾暣娴佹按绾匡細
姣忎釜瑙掕壊鐨勮緭鍑鸿嚜鍔ㄦ垚涓轰笅涓€涓鑹茬殑浠诲姟涓婁笅鏂囥€?
## 鐗规€?/ Features

- **team_run** 鈥?椤哄簭鎵ц鏁翠釜鍥㈤槦锛涙瘡姝ユ妸涓婁竴姝ヨ緭鍑烘嫾杩涗笅涓€姝?prompt锛岃繑鍥炲垎姝ョ粨鏋滀笌鏈€缁堣緭鍑恒€?- **team_list** 鈥?鍒楀嚭宸查厤缃殑鍥㈤槦涓庤鑹诧紝妯″瀷鍙厛鏌ヨ鍐嶈皟搴︺€?- **team_delegate** 鈥?鎶婂崟涓换鍔″鎵樼粰浠绘剰宸查厤缃鑹诧紙鎵句笉鍒拌鑹叉椂鎸夊師濮嬩换鍔＄洿娲撅級銆?- **骞跺彂闂ㄧ** 鈥?`maxConcurrentDelegations` 纭笂闄?+ `tools/pre-execute` 棰勬墽琛屾嫆缁濓紝闃叉骞惰璋冪敤鎵撶垎瀛愪唬鐞?provider銆?- **闆跺惊鐜唬鐮?* 鈥?瀛愪唬鐞嗙殑鍒涘缓銆佸彇娑堛€佹竻鐞嗗叏閮ㄨ蛋 Harness 瀹樻柟 `ctx.subagents` seam锛岄殢鎻掗殢鍗搞€?
## 瀹夎 / Install

```bash
# 浠庢湰鍦扮洰褰曞畨瑁咃紙浼氳嚜鍔ㄩ摼鎺ュ苟鍐欏叆 profile 鐨?bundles锛?dsh plugin --profile <name> add /path/to/dsh-agent-teams

# 鎴栦粠 npm/GitHub 瀹夎
dsh plugin --profile <name> add dsh-agent-teams
```

闇€瑕?profile 宸插寘鍚瓙浠ｇ悊鏈嶅姟涓庤嚦灏戜竴涓?provider锛?
```text
@deepseek-ai/dsh-subagent
@deepseek-ai/dsh-subagent-spawn-in-process   # 鎻愪緵 provider: spawn
@deepseek-ai/dsh-subagent-fork-in-process   # 鎻愪緵 provider: fork
```

## 閰嶇疆 / Configuration

缂栬緫 profile 鐨?`cordis.patch.yml`锛堟垨鎻掍欢鑷甫鐨勮ˉ涓佸眰锛夛細

```yaml
- insert:
    - id: dsh-agent-teams
      name: dsh-agent-teams
      config:
        provider: spawn            # 浣跨敤鐨勫瓙浠ｇ悊 provider
        maxConcurrentDelegations: 3
        teams:
          - name: writing
            agents:
              - role: planner
                prompt: 'Plan the task: outline goals, steps, and acceptance criteria.'
              - role: writer
                prompt: 'Write the full deliverable following the plan.'
              - role: reviewer
                prompt: 'Review the deliverable for correctness and quality; report issues.'
```

| 瀛楁 | 绫诲瀷 | 榛樿 | 璇存槑 |
|---|---|---|---|
| `provider` | string | `spawn` | `ctx.subagents` 涓婃敞鍐岀殑 provider 鍚?|
| `maxConcurrentDelegations` | number | `3` | 鏈彃浠跺苟鍙戞淳鐢熺殑纭笂闄?|
| `teams` | array | `[]` | 鍥㈤槦鍒楄〃锛歚name` + 鏈夊簭 `agents[{role, prompt}]` |

## 鐢ㄦ硶 / Usage

缁欐ā鍨嬩竴鍙ヨ嚜鐒惰瑷€鍗冲彲锛?
```text
Use team_run with team "writing" on: 涓轰竴闂村挅鍟″簵鍐欎竴鍙ュ箍鍛婅銆?```

鎻掍欢浼氫緷娆℃淳鐢?planner / writer / reviewer 涓変釜瀛愪唬鐞嗭紝鏈€鍚庢妸鏁存潯娴佹按绾跨粨鏋滆繑鍥炵粰妯″瀷銆?
## 鏋舵瀯 / How it works

```mermaid
flowchart LR
    M[妯″瀷] -->|team_run| T[team_run 宸ュ叿]
    T --> P[pre-execute 绛栫暐闂ㄧ]
    P -->|allow| S[ctx.subagents.start]
    S -->|planner| A1
    S -->|writer| A2
    S -->|reviewer| A3
    A1 -->|杈撳嚭浣滀负杈撳叆| A2
    A2 -->|杈撳嚭浣滀负杈撳叆| A3
    A3 --> R[鍒嗘缁撴灉 + 鏈€缁堣緭鍑篯
```

- 宸ュ叿瀹炵幇鍙緷璧?`ctx.tools`銆乣ctx.subagents` 涓や釜鏈嶅姟锛坄inject: ['tools', 'subagents']`锛夈€?- 姣忎釜瀛愪唬鐞嗘惡甯﹁皟鐢ㄦ柟 `exec.agent` 浣滀负 parent锛岀户鎵胯缂樸€佹繁搴︿笌鍙栨秷淇″彿锛坄exec.signal`锛夈€?- `run.dispose()` 鍦ㄧ粨鏋滄敹闆嗗悗鏃犳潯浠舵墽琛岋紝淇濊瘉瀛愪唬鐞嗕晶鍓╀綑宸ヤ綔琚彇娑堝苟閲婃斁璧勬簮銆?
## 寮€鍙?/ Development

```bash
npm install
npm run build   # tsc -> lib/
npm test       # node --test (built-in runner)
```

鏈湴楠岃瘉锛堜娇鐢ㄥ鍒跺嚭鐨?profile锛夛細

```bash
cp -r ~/.dsh/profiles/headless ~/.dsh/profiles/teams-test
dsh plugin --profile teams-test add /path/to/dsh-agent-teams
dsh --profile teams-test --dump-config     # 纭琛ヤ竵涓庨厤缃敓鏁?dsh --profile teams-test "鐢?team_run 璺?writing 鍥㈤槦锛氬啓涓€鍙ュ挅鍟″簵骞垮憡璇?
```

## License

MIT