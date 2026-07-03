# Changelog

TronCamp 赛题官网(单页静态站)的版本级变更。

## [1.0.2] — 评测口径同步 + 采集可视化可选贴士 (2026-07-04)

- **评测口径同步**（与后端 `secrets.env` 同步改动，为 100 参赛者评测容量按主办方决定调整）：
  - `index.html` / `doc.html`：「取均值(EVAL_REPEATS 默认 5)」「`--repeats 5`」→ **评测单次 rollout（EVAL_REPEATS=1）**；
  - `index.html`：正式提交「每日 3 次」→ **「每日 1 次」**（后端 `DAILY_LIMIT` 3→1）。
- `doc.html §02`：新增**可选调试贴士**——采集时把 `task_config` 的 `render_freq` 改 >0 可弹 SAPIEN 仿真窗口
  （仅种子搜索阶段显示 / 需带显示器的图形环境 / 评测不支持可视化）。

## [1.0.1] — 参赛文档校正 (2026-07-03)

- `doc.html` 修正与选手包实物不符的说明:
  - §02 采集示例改用真实随包下发的 turnkey config(`adjust_bottle adjust_bottle_200ep`),原 `grab_roller_200ep` 不存在;新增说明:T2–T4 的采集 / 训练 config 不随包下发,须拷 `adjust_bottle_200ep.yml` 改名成 `<task>_200ep.yml` 后自建,评测用 `<task>_clean.yml` 勿改;§04/§06 表格保留 T2–T4 约定 config 名,并加注说明其为选手自建。
  - 页头 note 更正执行目录:采集 / 本地自评与提交在选手包根目录,数据处理 / 训练 / `eval.sh` 在 `external/robotwin_local/policy/ACT` 下(§03/§04/§05 示例改用 `( cd … && bash … )` 子 shell 写法,对齐 kit README);顺带修正该 note 里 §配置 的错误交叉引用(§05 → §06)。
  - §05 跨设定评测示例改用真实存在的 `adjust_bottle_clean`(原 `adjust_bottle_dr` 不存在)。
  - §05 达标阈值口径去掉旧的「弱随机」表述,改为「easy/clean 官方评测环境」;提交示例补上 `--token`(缺 token 会 hard-fail)。
  - §04 训练默认表述由「6000 步」改为「num_epochs=6000」(对齐 `train.sh`)。

## [1.0.0] — 首个公开版本 (2026 年 7 月 launch)

- 单页赛题官网:题面 / 四任务难度递增赛制(T1–T4)/ 评测 / 提交与评测流程图 / 榜单。
- 每个任务两段逐帧对齐的示范视频(头部视角 + 正面视角双机位)。
- 榜单前端按后端给定顺序渲染,60s 刷新;`data/*.json` 为占位示例,真实榜单由后端发布。
- 加入 §10.1 仓库基础文件:`LICENSE`(Apache-2.0)/ `NOTICE` / `CONTRIBUTING.md` /
  `SECURITY.md` / Issue·PR 模板。
