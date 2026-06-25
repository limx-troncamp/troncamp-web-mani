// troncamp · hanging_mug 排行榜渲染(匿名 token 榜)。
// 主榜次序由后端给定:JSON 已排好,前端按 JSON 原顺序渲染,不再前端重排。
//   后端次序 = 有 T4 成绩者在前(T4 SR 降序),其后是无 T4 者按答题进度
//   (passed-T3 > passed-T2 > passed-T1 > none,同档以该档 SR 降序)。
// 主榜列:有 T4 显分数;无 T4 显答题进度(最高达标档 + SR)。
// T1-T3 仍显达标门(绿勾/未达标圈/未提交点)。匿名:只显示 token 尾号,永不显示队名。
// 契约:leaderboard.json { generated_at, deadline, final_unlocked, dev:[...], final:[...] }
//   每行 { token_suffix, t1/t2/t3:{pass,success_rate},
//          progress:{track:"T3"|"T2"|"T1"|null, success_rate}|null,
//          t4:{success_rate,submitted_at}|null }
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;
  var BOARD = 'dev';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // 达标门:达标=绿勾,未达标=空圈(hover 看 SR),未提交=点。
  function gate(g) {
    if (!g) return '<span class="gate gate-none" title="未提交">·</span>';
    if (g.pass) return '<span class="gate gate-ok" title="已达标">✓</span>';
    var sr = (g.success_rate != null) ? ' ' + Math.round(g.success_rate * 100) + '%' : '';
    return '<span class="gate gate-miss" title="未达标' + sr + '">○</span>';
  }

  // 主榜列:有 T4 → 成功率(×100 一位小数)+ 进度条;
  // 无 T4 → 答题进度(最高达标档 + 该档 SR),按后端给定次序排在 T4 队伍之后。
  function scoreCell(r) {
    var t4 = r.t4;
    if (t4 && t4.success_rate != null) {
      var pct = t4.success_rate * 100;
      var w = Math.max(2, Math.min(100, pct));
      var sub = t4.submitted_at ? '<span class="scoresub">' + esc(t4.submitted_at) + '</span>' : '';
      return '<td class="c-score"><div class="scorewrap">' +
        '<span class="scorenum">' + pct.toFixed(1) + '</span>' + sub +
        '<span class="scorebar"><i style="width:' + w + '%"></i></span></div></td>';
    }
    // 无 T4:显示答题进度。progress.track = 最高达标档;无任何达标显「报名中」。
    var p = r.progress;
    if (p && p.track) {
      var sr = (p.success_rate != null) ? ' · SR ' + p.success_rate.toFixed(2) : '';
      return '<td class="c-score"><span class="progress" title="尚未进入 T4 主榜">' +
        esc(p.track) + ' 达标' + sr + '</span></td>';
    }
    return '<td class="c-score"><span class="dimcell">报名中</span></td>';
  }

  function rowHtml(r, i) {
    var rank = i + 1;
    var cls = rank <= 3 ? ' top' + rank : '';
    return '<tr class="brow' + cls + '">' +
      '<td class="c-rank">' + rank + '</td>' +
      '<td class="c-token"><span class="tprefix">…</span>' + esc(r.token_suffix || '------') + '</td>' +
      '<td class="c-gate">' + gate(r.t1) + '</td>' +
      '<td class="c-gate">' + gate(r.t2) + '</td>' +
      '<td class="c-gate">' + gate(r.t3) + '</td>' +
      scoreCell(r) +
      '</tr>';
  }

  var countdownTimer = null;

  function renderCountdown(deadline) {
    var el = document.getElementById('countdown');
    if (!el) return false;
    if (!deadline) { el.textContent = ''; return false; }
    var end = new Date(deadline).getTime();
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) { el.textContent = '已截止 · 榜单已冻结'; return; }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el.textContent = '距截止 ' + d + ' 天 ' + pad(Math.floor(s % 86400 / 3600)) +
        ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    }
    if (countdownTimer) clearInterval(countdownTimer);
    tick();
    countdownTimer = setInterval(tick, 1000);
    return end - Date.now() <= 0;
  }

  function render(data) {
    var updated = document.getElementById('updated');
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');
    var over = renderCountdown(data.deadline);

    var locked = document.getElementById('locked');
    var table = document.getElementById('board-table');
    var empty = document.getElementById('empty');

    var rows;
    if (BOARD === 'final') {
      // final 在 final_unlocked 前显示「赛末公布」
      if (data.final_unlocked && (data.final || []).length) {
        rows = data.final;
      } else {
        if (locked) locked.hidden = false;
        if (table) table.hidden = true;
        if (empty) empty.hidden = true;
        return;
      }
    } else {
      rows = data.dev || [];
    }
    if (locked) locked.hidden = true;

    // 后端已排好序;按 JSON 原顺序渲染,不前端重排。
    rows = rows || [];
    if (!rows.length) {
      if (table) table.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    table.hidden = false;
    if (empty) empty.hidden = true;
    table.querySelector('tbody').innerHTML = rows.map(rowHtml).join('');
  }

  function load() {
    fetch(URL + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () { /* 静态站:加载失败保持现状,下轮重试 */ });
  }

  window.addEventListener('DOMContentLoaded', function () {
    BOARD = document.body.dataset.board || 'dev';
    load();
    setInterval(load, REFRESH);
  });
})();
