#!/usr/bin/env bash
# 一键启用持续同步 cron(随时上线)。前提:
#   ① 后端 daemon 在跑且已发布 leaderboard.json 到 BOARD_PUBLISH_DIR;
#   ② /root/.web_deploy_token 放好细粒度 PAT(仅 troncamp-web-mani contents:write,chmod 600);
#   ③ web 仓 checkout 在 WEB_REPO_DIR(默认 /root/troncamp-web)。
# 用法:  BOARD_PUBLISH_DIR=/root/troncamp-organizer/pages bash tools/enable_continuous_sync.sh
set -euo pipefail
WEB_REPO_DIR="${WEB_REPO_DIR:-/root/troncamp-web}"
BOARD_PUBLISH_DIR="${BOARD_PUBLISH_DIR:?需设 BOARD_PUBLISH_DIR(后端 worker 发布 leaderboard.json 的目录)}"
TOK="${WEB_DEPLOY_TOKEN_FILE:-/root/.web_deploy_token}"
INTERVAL="${SYNC_INTERVAL_MIN:-5}"

[ -f "$TOK" ] || { echo "缺 $TOK(细粒度 PAT,chmod 600)——放好再跑"; exit 1; }
[ -d "$WEB_REPO_DIR/.git" ] || { echo "$WEB_REPO_DIR 不是 git 仓(先 checkout web 仓到此)"; exit 1; }

LINE="*/${INTERVAL} * * * * BOARD_PUBLISH_DIR=$BOARD_PUBLISH_DIR WEB_REPO_DIR=$WEB_REPO_DIR WEB_DEPLOY_TOKEN_FILE=$TOK bash $WEB_REPO_DIR/tools/board_sync_push.sh >> /root/board_sync.log 2>&1"
# 幂等:先剔除旧的 board_sync cron 再加
( crontab -l 2>/dev/null | grep -v 'board_sync_push.sh' || true; echo "$LINE" ) | crontab -
echo "持续同步 cron 已启用(每 ${INTERVAL} 分钟):"
crontab -l | grep board_sync_push.sh
echo "立即跑一次试同步:"
BOARD_PUBLISH_DIR="$BOARD_PUBLISH_DIR" WEB_REPO_DIR="$WEB_REPO_DIR" WEB_DEPLOY_TOKEN_FILE="$TOK" bash "$WEB_REPO_DIR/tools/board_sync_push.sh" || echo "(首跑失败/无榜,cron 仍会持续重试)"
