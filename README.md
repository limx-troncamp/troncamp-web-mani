# troncamp-web

**TronCamp ACT 四任务套餐黑客松** 官网(单页静态站,GitHub Pages)。

Tron2 双臂机器人 + RoboTwin 仿真,单卡训 ACT(Action Chunking Transformer,~80M)完成四个难度递增的操作任务:
T1 `adjust_bottle` / T2 `grab_roller` / T3 `stack_bowls_two` / T4 `stack_bowls_three`。
赛制是**四任务难度递增**(难度只来自任务本身):四题全部自采(下发调好专家),T1 给 turnkey 训练 config 照跑、T2 起自己写 config;只有 T4 计分。
T1–T4 **顺序解锁,只有 T4 计分**(末态 graded /100,三碗各 1/3),主榜按 T4 得分降序;线上榜占总评 70%。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 单页,顶部 sticky nav 锚点:题面 / 赛制 T1–T4(难度递增)/ 评测 / 流程(含流程图)/ 榜单 |
| `doc.html` | 参赛文档:ACT 代码使用(数据采集 / 训练 / 自评 / 提交),参照 RoboTwin 官方 usage |

## 资源

- `style.css` — 深色控制台风;区块淡入用纯 CSS,尊重 `prefers-reduced-motion`。
- `board.js` / `config.js` — 排行榜渲染(读 `data/leaderboard.json`,60s 刷新)。
- `data/leaderboard.json` — **占位示例**,主办方后端发布真实榜单覆盖。
- `data/examples.json` — 6 条占位示例(持续同步时与后端真实榜合并)。
- `tools/board_sync.py` — 合并器(后端真实榜 + 占位示例 → 正确榜序)。
- `tools/board_sync_push.sh` — 持续同步 cron 推送脚本(评测机定时合并 + push)。
- `assets/flow.svg` — 提交与评测流程图(本地 clone → 采集 → 训练 → 自评 → 提交 → 进程内评测 → 上榜)。

## 部署

纯静态,无构建。GitHub Pages 由根目录 `index.html` 提供;`.nojekyll` 关闭 Jekyll 处理以正常服务 `assets/`、`data/`。

排行榜数据契约:`leaderboard.json` = `{ generated_at, deadline, final_unlocked, dev:[...], final:[...] }`,
每行 `{ token_suffix|team, t1/t2/t3:{pass, success_rate}, progress:{track, success_rate}|null, t4:{graded, submitted_at}|null }`。

**主榜次序由后端给定**,前端按 **JSON 原顺序**渲染(不前端重排):
有 T4 成绩者在前(`t4.graded` 降序),其后无 T4 者按答题进度(passed-T3 > passed-T2 > passed-T1 > none,同档以该档 SR 降序);
`progress.track` = 最高达标档。**T4 得分必须先顺序过 T1/T2/T3;无 T4 成绩者主榜列留空**(不渲染像分数的数字)。
门列三态:**✓ 达标 / ○ 未达标(hover 看 SR)/ · 未提交**。

## 许可 / License

本站代码采用 **Apache License 2.0**(见 [`LICENSE`](LICENSE));第三方内容(运行时加载的
Google Fonts、示范视频来源等)见 [`NOTICE`](NOTICE)。参与见 [`CONTRIBUTING.md`](CONTRIBUTING.md),
安全问题见 [`SECURITY.md`](SECURITY.md)。

The website code is licensed under the **Apache License 2.0** (see [`LICENSE`](LICENSE));
third-party content (runtime Google Fonts, demo-video provenance) is documented in
[`NOTICE`](NOTICE). See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md).
