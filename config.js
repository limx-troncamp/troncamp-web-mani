// 榜单数据源配置。
// 默认读同站静态文件(由 boardpub/push_board.sh 推到 Pages 仓库 data/ 下);
// 联调时可改为后端直连,如 "http://<backend-host>:8080/api/leaderboard.json"
// (注意:https 页面直连 http 后端会被浏览器混合内容策略拦截,生产读路径走静态文件)。
window.BOARD_CONFIG = {
  BOARD_DATA_URL: "./data/leaderboard.json",
  REFRESH_SECONDS: 60,
  // 评测队列(匿名只读):board_sync 每 2min 从后端导出 data/queue.json;弹窗打开时按此间隔轮询。
  QUEUE_DATA_URL: "./data/queue.json",
  QUEUE_REFRESH_SECONDS: 30,
};
