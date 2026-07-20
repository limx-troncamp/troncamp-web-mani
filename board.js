// troncamp LeaderBoard 表格渲染。沿用 TronCamp-Board 原版视觉结构与类名
// (.c-rank/.c-team/.c-gate/.c-t3/.t3wrap/.t3num/.t3sub/.t3bar/.gate-*/.top*),
// 仅替换为 troncamp 榜单逻辑:
//   · 匿名:c-team 列显示 token 尾号(字段名 team,值为 token 尾 6 位、非队名),永不显示队名。
//   · 主榜次序由后端给定:JSON 已排好,前端按 JSON 原顺序渲染,不前端重排。
//     后端次序 = 有 T4 成绩者在前(T4 SR 降序),其后无 T4 者按答题进度
//     (passed-T3 > passed-T2 > passed-T1 > none,同档以该档 SR 降序)。
//   · 分数列(.c-t3):有 T4 显 T4 得分(graded×100,三层各 1/3 相加);无 T4 留空(进度见左侧 T1–T3 门列)。
// 契约:leaderboard.json { generated_at, deadline, final_unlocked, dev:[...], final:[...] }
//   每行 { team, t1/t2/t3:{pass,success_rate},
//          progress:{track:"T3"|"T2"|"T1"|null, success_rate}|null,  ← 仅后端排序用,前端不渲染(rowHtml 不消费)
//          t4:{graded,submitted_at}|null }   ← 主榜分=分级分 graded(见 organizer boardpub/publish.py)
//   team = token 尾 6 位(匿名号,非队名;c-team 列永不显示队名);旧字段名 token_suffix 仅作兼容回退。
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;
  var BOARD = 'dev';  // 实际值在 DOMContentLoaded 时从 <body data-board> 读取

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // ISO UTC(...Z)→ 北京时间(UTC+8)可读串 "YYYY-MM-DD HH:MM:SS"。解析失败则原样返回。
  function fmtTime(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return String(iso == null ? '' : iso);
    var d = new Date(t + 8 * 3600 * 1000);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) +
      ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
  }

  // T1/T2/T3 达标门:达标=绿勾,未达标=空圈(hover 看成功率),未提交=点。
  function gate(g) {
    if (!g) return '<span class="gate gate-none" title="未提交">·</span>';
    // T1-T3:门图标 + 灰色 SR 小字(该题成功率×100)
    var sr = (g.success_rate != null)
      ? '<span class="gate-sr">' + Math.round(g.success_rate * 100) + '</span>' : '';
    if (g.pass) return '<span class="gate gate-ok" title="已达标">✓</span>' + sr;
    return '<span class="gate gate-miss" title="未达标">○</span>' + sr;
  }

  // 分数列(沿用原版 .c-t3/.t3wrap/.t3num/.t3bar):
  //   有 T4 → T4 得分 = graded×100(三层各 1/3 相加、叠满 100)+ 色带 + 提交时间;
  //   无 T4 → 留空(T4 得分须先顺序过 T1/T2/T3,进度见左侧门列;此列绝不出现像分数的数字)。
  function scoreCell(r) {
    var t4 = r.t4;
    if (t4 && t4.graded != null) {
      var g = Math.max(0, Math.min(1, t4.graded));
      var w = Math.max(2, g * 100);
      // 青金渐变锚定到 0–100 轨道(background-size 放大到满轨):分数越高 → 填充越延伸到金端,
      // 越靠近 100 颜色越深;低分只露青端。
      var bg = Math.round(100 / Math.max(g, 0.02));
      var sub = t4.submitted_at ? '<span class="t3sub">' + esc(fmtTime(t4.submitted_at)) + '</span>' : '';
      return '<td class="c-t3"><div class="t3wrap">' +
        '<span class="t3num">' + (t4.graded * 100).toFixed(1) + '</span>' + sub +
        '<span class="t3bar"><i style="width:' + w + '%;background-size:' + bg + '% 100%"></i></span></div></td>';
    }
    return '<td class="c-t3"></td>';
  }

  function rowHtml(r, i) {
    var rank = i + 1;  // 后端已排序;名次按 JSON 原顺序
    var cls = rank <= 3 ? ' top top' + rank : '';
    return '<tr class="brow' + cls + '">' +
      '<td class="c-rank">' + rank + '</td>' +
      '<td class="c-team"><span class="tprefix">…</span>' + esc(r.team || r.token_suffix || '------') + '</td>' +
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
      if (ms <= 0) {
        el.textContent = '提交已截止 · 排队评测继续，成绩持续更新';
        el.classList.add('over');
        return;
      }
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
    if (updated) updated.textContent = data.generated_at
      ? ('更新于 ' + fmtTime(data.generated_at) + ' (北京时间)')
      : '更新于 —';
    var over = renderCountdown(data.deadline);

    var locked = document.getElementById('locked');
    var table = document.getElementById('board-table');
    var empty = document.getElementById('empty');

    // final 在 final_unlocked 前显示「赛末公布」
    var rows;
    if (BOARD === 'final') {
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
