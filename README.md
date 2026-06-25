# troncamp-web

**hanging_mug 鲁棒泛化 VLA 黑客松** 官网(单页静态站,GitHub Pages)。

双臂机器人把杯子挂上架(左臂抓杯 → 放中间 → 右臂取杯 → 挂上挂杆);
统一用 3 路图像 π0.5(LoRA)做策略,竞争轴是**对域随机化的鲁棒泛化**——从弱随机化通关到全域 OOD。

## 页面

单页 + 一个锁定的 Final 榜:

| 文件 | 内容 |
|---|---|
| `index.html` | 单页,顶部 sticky nav 锚点跳转:题面(filmstrip)/ 赛制 T1–T4 / 评测档 / 流程(含流程图)/ 榜单(Dev) |
| `final.html` | Final 榜:赛末公布(解锁前显示「赛末公布」) |

## 资源

- `style.css` — 朴素商务风(白底、表格为主、可离线/打印);区块进场用纯 CSS `animation-timeline: view()` 轻量淡入,尊重 `prefers-reduced-motion`。
- `board.js` / `config.js` — 排行榜渲染(读 `data/leaderboard.json`,60s 刷新)。
- `data/leaderboard.json` — **占位示例**,主办方发布真实榜单覆盖。
- `assets/hanging_mug_seed0_kf*.png` — 任务关键帧示意图(6 帧 filmstrip)。
- `assets/flow.svg` — 提交与评测流程图(本地 clone → 训练 → 自评 → 提交 → 评测 → 上榜)。

## 部署

纯静态,无构建步骤。GitHub Pages 直接由根目录 `index.html` 提供;`.nojekyll` 关闭 Jekyll 处理以正常服务 `assets/`、`data/`。

排行榜数据契约:`leaderboard.json` = `{ generated_at, deadline, final_unlocked, dev:[...], final:[...] }`,
每行 `{ token_suffix, t1/t2/t3:{pass, success_rate}, t4:{success_rate, submitted_at}|null }`。
