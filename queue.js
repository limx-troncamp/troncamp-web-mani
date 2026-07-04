// troncamp 评测队列 <dialog>(匿名只读)。读 data/queue.json:token 尾6 + 赛道 + 状态 +
// 相对时间 + failed 脱敏 reason。仅弹窗打开时轮询(默认 30s),关闭即停。
// 契约(见 organizer boardpub/queue_pub.py):
//   { generated_at, counts:{queued,running,done_recent,failed_recent},
//     items:[{team:"尾6", track:"T1", status:"queued|running|done|failed",
//             created_at:"...Z"(ISO UTC), reason:null|"脱敏类别"}] }
// 安全:前端不信任 json——status 走白名单(不拼原始值进 class 属性)、team 再截尾6、
// reason 仅 failed 展示、所有文本经 esc() 转义。
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.QUEUE_DATA_URL || './data/queue.json';
  var REFRESH = (cfg.QUEUE_REFRESH_SECONDS || 30) * 1000;
  var timer = null;
  var reqSeq = 0;  // 只渲染最新一次请求的响应(防慢响应覆盖新响应/关闭后写回)

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  // ISO UTC(...Z)→ 北京时间(UTC+8)可读串 "YYYY-MM-DD HH:MM:SS"。解析失败则原样返回(交 textContent 呈现,安全)。
  function fmtTime(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return String(iso == null ? '' : iso);
    var d = new Date(t + 8 * 3600 * 1000);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) +
      ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
  }

  // 状态白名单:LABEL 的键即合法 status,class 只用白名单值(杜绝属性注入)。
  var LABEL = { queued: '排队中', running: '评测中', done: '已完成', failed: '失败' };

  // created_at 后端已是 ISO+Z(UTC);Date.parse 直接解析,不依赖浏览器本地时区。
  function rel(ts) {
    if (!ts) return '';
    var t = Date.parse(ts);
    if (isNaN(t)) return esc(ts);
    var s = Math.floor((Date.now() - t) / 1000);
    if (s < 0) s = 0;
    if (s < 60) return s + ' 秒前';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    return Math.floor(s / 86400) + ' 天前';
  }

  function rowHtml(it) {
    var st = (it && it.status) || '';
    var known = Object.prototype.hasOwnProperty.call(LABEL, st);
    var cls = known ? 'q-' + st : 'q-unknown';           // class 只用白名单值
    var label = known ? LABEL[st] : (esc(st) || '—');    // 文本:未知状态转义兜底
    var team = String((it && it.team) || '').slice(-6);  // 纵深防御:前端也只出尾6
    var badge = '<span class="qbadge ' + cls + '">' + label + '</span>';
    // reason 仅 failed 展示(非 failed 即便后端残留备注也不外显)
    var reason = (st === 'failed' && it && it.reason)
      ? '<span class="qreason">' + esc(it.reason) + '</span>' : '';
    return '<tr>' +
      '<td class="q-team"><span class="tprefix">…</span>' + esc(team) + '</td>' +
      '<td class="q-track">' + esc((it && it.track) || '') + '</td>' +
      '<td>' + badge + '</td>' +
      '<td class="q-time">' + rel(it && it.created_at) + '</td>' +
      '<td>' + reason + '</td>' +
      '</tr>';
  }

  function setEmpty(msg) {
    var body = document.getElementById('q-body');
    var empty = document.getElementById('q-empty');
    if (body) body.innerHTML = '';
    if (empty) { empty.hidden = false; empty.textContent = msg; }
  }

  function render(data) {
    var c = (data && data.counts) || {};
    var cEl = document.getElementById('q-counts');
    if (cEl) {
      cEl.textContent = '排队 ' + (c.queued || 0) + ' · 评测中 ' + (c.running || 0) +
        ' · 近24h 完成 ' + (c.done_recent || 0) + ' / 失败 ' + (c.failed_recent || 0);
    }
    var uEl = document.getElementById('q-updated');
    if (uEl) uEl.textContent = (data && data.generated_at) ? ('更新于 ' + fmtTime(data.generated_at) + ' (北京时间)') : '';

    var items = (data && data.items) || [];
    if (!items.length) { setEmpty('当前队列为空'); return; }
    var empty = document.getElementById('q-empty');
    var body = document.getElementById('q-body');
    if (empty) empty.hidden = true;
    if (body) body.innerHTML = items.map(rowHtml).join('');
  }

  function load() {
    var myReq = ++reqSeq;
    fetch(URL + '?t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { if (myReq === reqSeq) render(data); })
      .catch(function () { if (myReq === reqSeq) setEmpty('队列加载失败,请稍后重试'); });
  }

  window.addEventListener('DOMContentLoaded', function () {
    var dlg = document.getElementById('queue-dialog');
    var openB = document.getElementById('queue-open');
    var closeB = document.getElementById('queue-close');
    if (!dlg || !openB) return;

    function stopPolling() { if (timer) { clearInterval(timer); timer = null; } }
    function doClose() {
      if (typeof dlg.close === 'function') dlg.close();       // 触发 close 事件 → stopPolling
      else { dlg.removeAttribute('open'); stopPolling(); }    // 退化路径显式停轮询
    }

    openB.addEventListener('click', function () {
      load();
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      stopPolling();
      timer = setInterval(load, REFRESH);
    });
    if (closeB) closeB.addEventListener('click', doClose);
    dlg.addEventListener('close', stopPolling);                // 原生关闭(按钮/ESC/close())统一停轮询
    dlg.addEventListener('click', function (e) { if (e.target === dlg) doClose(); }); // 点遮罩关闭
  });
})();
