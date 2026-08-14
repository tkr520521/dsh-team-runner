# dsh-team-runner

> 婢?Agent 缂傛牗甯撻幓鎺嶆閿涙碍濡?DeepSeek Harness 閻ㄥ嫬鐡欐禒锝囨倞閼宠棄濮忕紒鍕棅閹存劑鈧苯娲熼梼鐔哥ウ濮樺鍤庨妴宥冣偓?> Multi-agent orchestration for DeepSeek Harness: turn the `subagents` seam into reusable, policy-gated agent teams.

[![license](https://img.shields.io/badge/license-MIT-blue)](#license) ![api](https://img.shields.io/badge/API-rc.6-8A2BE2) ![tools](https://img.shields.io/badge/tools-3-2ea44f)

## 鏉╂瑦妲告禒鈧稊?/ What is this

`dsh-team-runner` 閺勵垯绔存稉顏堜紥瀵?Harness閵嗗奔绔撮崚鍥╂畷閹绘帊娆㈤妴宥囨倞韫囩數娈戠紓鏍ㄥ笓閹绘帊娆㈤妴鍌氱暊娑撳秹鍣搁弬鏉垮絺閺?Agent 瀵邦亞骞嗛敍?閼板本妲哥紒鍕値瀹稿弶婀侀惃鍕絻娴犺泛瀵查懗钘夊閻愮櫢绱?
- **瀹搞儱鍙块敍鍧眔ols閿?*閿涙碍鏁為崘?`team_list` / `team_run` / `team_delegate` 娑撳閲滃Ο鈥崇€烽崣顖濐潌瀹搞儱鍙块妴?- **鐎涙劒鍞悶鍡礄subagents閿?*閿涙岸鈧俺绻?`ctx.subagents.start()` 閸?`spawn` / `fork` / `acp` 缁?provider 娑撳﹥娣抽悽鐔风摍娴狅絿鎮婇妴?- **缁涙牜鏆愰敍鍧licy閿?*閿涙氨鏁?`tools/pre-execute` 閻庢垵绔锋禍瀣╂閸嬫艾鑻熼崣鎴︽，缁備緤绱濈搾鍛扮箖娑撳﹪妾洪惃鍕礋闂冪喕鐨熼悽銊ф纯閹恒儲瀚嗙紒婵撶礄fail loud閿涘鈧?
闁板秶鐤嗘稉鈧稉顏勬礋闂冪噦绱欐俊?planner 閳?writer 閳?reviewer閿涘绱濆Ο鈥崇€风亸杈厴閻劋绔村▎?`team_run` 鐟欙箑褰傜€瑰本鏆ｅù浣规寜缁惧尅绱?濮ｅ繋閲滅憴鎺曞閻ㄥ嫯绶崙楦垮殰閸斻劍鍨氭稉杞扮瑓娑撯偓娑擃亣顫楅懝鑼畱娴犺濮熸稉濠佺瑓閺傚洢鈧?
## 閻楄鈧?/ Features

- **team_run** 閳?妞ゅ搫绨幍褑顢戦弫缈犻嚋閸ャ垽妲﹂敍娑欑槨濮濄儲濡告稉濠佺濮濄儴绶崙鐑樺鏉╂稐绗呮稉鈧?prompt閿涘矁绻戦崶鐐插瀻濮濄儳绮ㄩ弸婊€绗岄張鈧紒鍫ｇ翻閸戞亽鈧?- **team_list** 閳?閸掓鍤鏌ュ帳缂冾喚娈戦崶銏ゆЕ娑撳氦顫楅懝璇х礉濡€崇€烽崣顖氬帥閺屻儴顕楅崘宥堢殶鎼达负鈧?- **team_delegate** 閳?閹跺﹤宕熸稉顏冩崲閸斺€愁潤閹垫绮版禒缁樺壈瀹告煡鍘ょ純顔款潡閼硅绱欓幍鍙ョ瑝閸掓媽顫楅懝鍙夋閹稿甯慨瀣╂崲閸旓紕娲垮ú鎾呯礆閵?- **楠炶泛褰傞梻銊ь洣** 閳?`maxConcurrentDelegations` 绾兛绗傞梽?+ `tools/pre-execute` 妫板嫭澧界悰灞惧珕缂佹繐绱濋梼鍙夘剾楠炴儼顢戠拫鍐暏閹垫挾鍨庣€涙劒鍞悶?provider閵?- **闂嗚泛鎯婇悳顖欏敩閻?* 閳?鐎涙劒鍞悶鍡欐畱閸掓稑缂撻妴浣稿絿濞戝牄鈧焦绔婚悶鍡楀弿闁劏铔?Harness 鐎规ɑ鏌?`ctx.subagents` seam閿涘矂娈㈤幓鎺楁閸楁悶鈧?
## 鐎瑰顥?/ Install

```bash
# 娴犲孩婀伴崷鎵窗瑜版洖鐣ㄧ憗鍜冪礄娴兼俺鍤滈崝銊╂懠閹恒儱鑻熼崘娆忓弳 profile 閻?bundles閿?dsh plugin --profile <name> add /path/to/dsh-team-runner

# 閹存牔绮?npm/GitHub 鐎瑰顥?dsh plugin --profile <name> add dsh-team-runner
```

闂団偓鐟?profile 瀹告彃瀵橀崥顐㈢摍娴狅絿鎮婇張宥呭娑撳氦鍤︾亸鎴滅娑?provider閿?
```text
@deepseek-ai/dsh-subagent
@deepseek-ai/dsh-subagent-spawn-in-process   # 閹绘劒绶?provider: spawn
@deepseek-ai/dsh-subagent-fork-in-process   # 閹绘劒绶?provider: fork
```

## 闁板秶鐤?/ Configuration

缂傛牞绶?profile 閻?`cordis.patch.yml`閿涘牊鍨ㄩ幓鎺嶆閼奉亜鐢惃鍕夋稉浣哥湴閿涘绱?
```yaml
- insert:
    - id: dsh-team-runner
      name: dsh-team-runner
      config:
        provider: spawn            # 娴ｈ法鏁ら惃鍕摍娴狅絿鎮?provider
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

| 鐎涙顔?| 缁鐎?| 姒涙顓?| 鐠囧瓨妲?|
|---|---|---|---|
| `provider` | string | `spawn` | `ctx.subagents` 娑撳﹥鏁為崘宀€娈?provider 閸?|
| `maxConcurrentDelegations` | number | `3` | 閺堫剚褰冩禒璺鸿嫙閸欐垶娣抽悽鐔烘畱绾兛绗傞梽?|
| `teams` | array | `[]` | 閸ャ垽妲﹂崚妤勩€冮敍姝歯ame` + 閺堝绨?`agents[{role, prompt}]` |

## 閻劍纭?/ Usage

缂佹瑦膩閸ㄥ绔撮崣銉ㄥ殰閻掓儼顕㈢懛鈧崡鍐插讲閿?
```text
Use team_run with team "writing" on: 娑撹桨绔撮梻鏉戞寘閸熲€崇暗閸愭瑤绔撮崣銉ョ畭閸涘﹨顕㈤妴?```

閹绘帊娆㈡导姘贩濞嗏剝娣抽悽?planner / writer / reviewer 娑撳閲滅€涙劒鍞悶鍡礉閺堚偓閸氬孩濡搁弫瀛樻蒋濞翠焦鎸夌痪璺ㄧ波閺嬫粏绻戦崶鐐电舶濡€崇€烽妴?
## 閺嬭埖鐎?/ How it works

```mermaid
flowchart LR
    M[濡€崇€穄 -->|team_run| T[team_run 瀹搞儱鍙縘
    T --> P[pre-execute 缁涙牜鏆愰梻銊ь洣]
    P -->|allow| S[ctx.subagents.start]
    S -->|planner| A1
    S -->|writer| A2
    S -->|reviewer| A3
    A1 -->|鏉堟挸鍤担婊€璐熸潏鎾冲弳| A2
    A2 -->|鏉堟挸鍤担婊€璐熸潏鎾冲弳| A3
    A3 --> R[閸掑棙顒炵紒鎾寸亯 + 閺堚偓缂佸牐绶崙绡?```

- 瀹搞儱鍙跨€圭偟骞囬崣顏冪贩鐠?`ctx.tools`閵嗕梗ctx.subagents` 娑撱倓閲滈張宥呭閿涘潉inject: ['tools', 'subagents']`閿涘鈧?- 濮ｅ繋閲滅€涙劒鍞悶鍡樻儭鐢箒鐨熼悽銊︽煙 `exec.agent` 娴ｆ粈璐?parent閿涘瞼鎴烽幍鑳攨缂傛ǜ鈧焦绻佹惔锔跨瑢閸欐牗绉锋穱鈥冲娇閿涘潉exec.signal`閿涘鈧?- `run.dispose()` 閸︺劎绮ㄩ弸婊勬暪闂嗗棗鎮楅弮鐘虫蒋娴犺埖澧界悰宀嬬礉娣囨繆鐦夌€涙劒鍞悶鍡曟櫠閸撯晙缍戝銉ょ稊鐞氼偄褰囧☉鍫濊嫙闁插﹥鏂佺挧鍕爱閵?
## 瀵偓閸?/ Development

```bash
npm install
npm run build   # tsc -> lib/
npm test       # node --test (built-in runner)
```

閺堫剙婀存宀冪槈閿涘牅濞囬悽銊ヮ槻閸掕泛鍤惃?profile閿涘绱?
```bash
cp -r ~/.dsh/profiles/headless ~/.dsh/profiles/teams-test
dsh plugin --profile teams-test add /path/to/dsh-team-runner
dsh --profile teams-test --dump-config     # 绾喛顓荤悰銉ょ娑撳酣鍘ょ純顔炬晸閺?dsh --profile teams-test "閻?team_run 鐠?writing 閸ャ垽妲﹂敍姘晸娑撯偓閸欍儱鎸呴崯鈥崇暗楠炲灝鎲＄拠?
```

## License

MIT