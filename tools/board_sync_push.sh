#!/usr/bin/env bash
# B-4 持续同步:后端发布的 leaderboard.json + 占位示例 → web 仓 data/leaderboard.json → push → Pages 自动更新。
#
# 在评测机上挂 cron(每 5 分钟一次):
#   */5 * * * * BOARD_PUBLISH_DIR=/root/troncamp-organizer/pages WEB_REPO_DIR=/root/troncamp-web \
#               WEB_DEPLOY_TOKEN_FILE=/root/.web_deploy_token bash /root/troncamp-web/tools/board_sync_push.sh >> /root/board_sync.log 2>&1
#
# 需要(均不入 repo):
#   BOARD_PUBLISH_DIR     后端 worker 写榜的目录(= secrets.env 的 BOARD_PUBLISH_DIR)
#   WEB_REPO_DIR          web 仓在评测机的本地 checkout(含 tools/board_sync.py + data/examples.json)
#   WEB_DEPLOY_TOKEN_FILE GitHub deploy token 文件(600;细粒度 PAT,仅 troncamp-web-mani 的 contents:write)
set -euo pipefail
: "${BOARD_PUBLISH_DIR:?需设 BOARD_PUBLISH_DIR(后端发布 leaderboard.json 的目录)}"
: "${WEB_REPO_DIR:?需设 WEB_REPO_DIR(web 仓本地 checkout)}"
TOK_FILE="${WEB_DEPLOY_TOKEN_FILE:-/root/.web_deploy_token}"
REPO_SLUG="${WEB_REPO_SLUG:-limx-troncamp/troncamp-web-mani}"

BACKEND_JSON="$BOARD_PUBLISH_DIR/leaderboard.json"
[ -f "$BACKEND_JSON" ] || { echo "[sync] 后端榜 $BACKEND_JSON 不存在,跳过(后端还没发布过榜)"; exit 0; }
[ -f "$TOK_FILE" ]      || { echo "[sync] 缺 deploy token 文件 $TOK_FILE(600);请放入仅 contents:write 的细粒度 PAT"; exit 1; }

cd "$WEB_REPO_DIR"
REMOTE="https://x-access-token:$(cat "$TOK_FILE")@github.com/${REPO_SLUG}.git"

# 1) 把 checkout 同步到远端 HEAD(避免本地/cron 多源推送分叉)
git fetch -q "$REMOTE" main
git reset -q --hard FETCH_HEAD

# 2) 合并后端真实榜 + 占位示例 → data/leaderboard.json
python3 tools/board_sync.py "$BACKEND_JSON" data/examples.json data/leaderboard.json

# 3) 无变化就不提交(省得每 5 分钟空 commit)
if git diff --quiet -- data/leaderboard.json; then
  echo "[sync] 榜单无变化,跳过"
  exit 0
fi

# 4) 提交 + push(token 仅经 remote URL,不落 .git/config:用一次性 REMOTE 变量)
git -c user.name=troncamp-bot -c user.email=bot@troncamp.local add data/leaderboard.json
git -c user.name=troncamp-bot -c user.email=bot@troncamp.local commit -q -m "chore(board): 同步真实榜单"
git push -q "$REMOTE" HEAD:main
echo "[sync] 已同步并 push 真实榜单"
