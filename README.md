# troncamp-web

**stack_blocks_three 鲁棒泛化机器人操作黑客松** 官网(单页静态站,GitHub Pages)。

双臂机器人把红 / 绿 / 蓝三个方块移到桌面中央堆叠(蓝叠绿上、绿叠红上);
单卡训 ACT(Action Chunking Transformer,~80M)做策略,竞争轴是**对域随机化的鲁棒泛化**——从弱随机化通关到全域 OOD。

## 页面

单页 + 一个锁定的 Final 榜:

| 文件 | 内容 |
|---|---|
| `index.html` | 单页,顶部 sticky nav 锚点跳转:题面 / 赛制 T1–T4 / 评测档 / 流程(含流程图)/ 榜单(Dev) |
| `final.html` | Final 榜:赛末公布(解锁前显示「赛末公布」) |

## 资源

- `style.css` — 深色控制台风(#07090d + teal #38e1d4 + Chakra Petch);区块进场用纯 CSS `animation-timeline: view()` 轻量淡入,尊重 `prefers-reduced-motion`。
- `board.js` / `config.js` — 排行榜渲染(读 `data/leaderboard.json`,60s 刷新)。
- `data/leaderboard.json` — **占位示例**,主办方发布真实榜单覆盖。
- 任务演示帧 — stack_blocks_three 专家 rollout 渲染后补(题面当前为占位块)。
- `assets/flow.svg` — 提交与评测流程图(本地 clone → 训练 → 自评 → 提交 → in-process 评测 → 上榜)。

## 部署

纯静态,无构建步骤。GitHub Pages 直接由根目录 `index.html` 提供;`.nojekyll` 关闭 Jekyll 处理以正常服务 `assets/`、`data/`。

排行榜数据契约:`leaderboard.json` = `{ generated_at, deadline, final_unlocked, dev:[...], final:[...] }`,
每行 `{ token_suffix, t1/t2/t3:{pass, success_rate}, progress:{track, success_rate}|null, t4:{success_rate, submitted_at}|null }`。

**主榜次序由后端给定**:`dev` / `final` 数组已按规则排好,前端按 **JSON 原顺序**渲染(不前端重排)。
次序 = 有 T4 成绩者在前(`t4.success_rate` 降序),其后是无 T4 者按答题进度
(passed-T3 > passed-T2 > passed-T1 > none,同档以该档 SR 降序);`progress.track` = 最高达标档,
主榜列对无 T4 队伍显示「Tn 达标 · SR 0.xx」而非空白 / 零分。
