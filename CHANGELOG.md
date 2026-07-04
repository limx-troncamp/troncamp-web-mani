# Changelog

TronCamp 赛题官网(单页静态站)的版本级变更。

## [1.0.6] — 参赛者可读性精简·去黑话 + 提交地址填充 (2026-07-04)

- 去黑话精简(index/doc):§03 评测机制表 4 行→2 行白话、T4 判据删内部坐标(±4cm)/防作弊细节、
  §04 安全表极简;doc §01 删安装深层原理(保留第 6 步 __KIT_ROOT__ 硬约束)、§05/§07 去
  temporal_agg/harness/shadow/fail-loud 等术语;术语统一 SR→成功率、turnkey→直接照跑、rollout→跑一遍。
  命令/任务名/config 名/HTTP 拒绝表/提交流程零改动。
- doc §07:submit 命令 `--server` 由占位符填入评测服务器地址 `http://118.196.31.68:8080`。

## [1.0.5] — 安装文档透明分步 + 代码操作收敛 (2026-07-04)

- `doc.html`:
  - §01 安装重写为**全透明分步**(0–8 步,每步一条可复制命令 + 说明):conda 环境(可 `TRONCAMP_ENV` 覆盖)
    → `setuptools<81` → RoboTwin 本体 `script/_install.sh` → `setup/requirements.txt` → curobo 0.8.0
    editable → **`__KIT_ROOT__` 占位还原(关键步)** → ffmpeg 兜底 → `env_check.py` 自检;含离线
    `--find-links` 说明。取代原「一键 `bash setup/install.sh`」块(选手包已删该脚本)。
  - 新增 **§07 提交**(`#submit`):`submit.py` 的 T1–T4 完整示例、token 用法(`--token-file`/env,不裸传)、
    顺序解锁与每日限额、后端拒绝的中文提示(400/401/403/404/409/413/429);§05 评测补 `watch_rollout.py`
    单 seed 数值核查命令。导航 / 页脚加「提交」入口。
- `index.html`:
  - §04 流程删除 `submit.py` 四条命令,改为一句摘要 + 链接指向文档 §提交(单一出处,去重)。

## [1.0.4] — 榜单新增匿名评测队列弹窗 (2026-07-04)

- `index.html` / `queue.js`(新) / `style.css` / `config.js`:榜单区新增「查看评测队列」按钮 →
  原生 `<dialog>` 弹窗,读 `data/queue.json`(后端 board_sync 每 2min 导出)展示评测队列:token 尾6 +
  赛道 + 状态徽章(排队中 / 评测中 / 已完成 / 失败)+ 相对时间 + failed 脱敏原因;打开时 30s 轮询、关闭即停。
- 安全:status 白名单化(防 class 属性注入)、team 前端截尾6、reason 仅 failed 展示、全文本经转义;
  原生 `<dialog>`(showModal + backdrop + ESC + 点遮罩关闭)。
- 数据源:后端新增 `boardpub/queue_pub.py` 导出脱敏匿名 `queue.json`,随 board_sync 推送(cron 5→2min)。

## [1.0.3] — 参赛者体检轮·文档与榜单前端校正 (2026-07-04)

- `index.html`：
  - §04 视频计分口径纠正：演示视频属**完赛材料评审（占总评 30%）**，非线上赛计分（线上 70% 由 T4 自动评测单独产出）。
  - §04 邮件「专属提交码」就地定义 = 提交 token 尾 6 位。
- `doc.html`：
  - §01 精简：删除误导的手动 ACT 子依赖安装块（`mujoco==2.3.7`/`dm_control`/`cd detr && pip install -e .`），`setup/install.sh` 已一步装好。
  - §04 新增「参考耗时」表（采集/处理/训练/单题全流程，主办方实测参考）。
- `board.js`：首选后端实际字段 `team`（=token 尾 6 位匿名号），契约注释对齐；`progress` 标注仅后端排序用、前端不渲染；分数列「无 T4 留空」注释与实现对齐。

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
