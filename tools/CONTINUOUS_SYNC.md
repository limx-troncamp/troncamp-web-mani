# 持续同步上线(continuous board sync)

后端真实榜单 → 自动合并占位示例 → push web 仓 → GitHub Pages 更新。

## 部件(已就位)
| 文件 | 作用 |
|---|---|
| `tools/board_sync.py` | 合并器:后端 `leaderboard.json` + `data/examples.json` → 正确榜序的 `data/leaderboard.json`(真实条目优先,同名示例丢弃) |
| `tools/board_sync_push.sh` | cron 推送:fetch→合并→仅有变化时 commit+push(token 从 600 文件读,绝不入 repo/命令行) |
| `tools/enable_continuous_sync.sh` | 一键装 cron(幂等)+ 立即试跑一次 |

## 上线 3 步(在评测机)
1. **后端常驻**(organizer 仓):`cp deploy/secrets.env.example deploy/secrets.env` 填好
   (`SEED_PRIVATE_SECRET=$(openssl rand -hex 32)`、`ADMIN_TOKEN`、`UPLOAD_DIR`/`WORKDIR` 指向 NAS),
   `bash deploy/start_daemons.sh` → worker 处理提交并发布 `$BOARD_PUBLISH_DIR/leaderboard.json`。
2. **deploy token**:GitHub 细粒度 PAT(仅 `troncamp-web-mani` 的 *contents: write*)→
   `umask 077; printf %s '<PAT>' > /root/.web_deploy_token`。
3. **启用 cron**:`BOARD_PUBLISH_DIR=<后端发布目录> bash /root/troncamp-web/tools/enable_continuous_sync.sh`。

之后每 5 分钟:后端有新榜 → 自动合并 6 条占位示例 → push → Pages 更新;无变化则跳过(不空 commit)。

## 现状(prep 已完成)
- web 仓已 checkout 到评测机 `/root/troncamp-web`。
- 合并器已在评测机 dry-run 验证:e2e 真实榜(`tp-e2e`)+ 6 示例 → 7 条正确榜序。
- **唯一待补**:① 后端 `secrets.env`(SEED secret / ADMIN token,你的部署决定)② web deploy token。补上即可上线。
