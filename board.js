// troncamp LeaderBoard 表格渲染。沿用 TronCamp-Board 原版视觉结构与类名
// (.c-rank/.c-team/.c-gate/.c-t3/.t3wrap/.t3num/.t3sub/.t3bar/.gate-*/.top*),
// 仅替换为 troncamp 榜单逻辑:
//   · 匿名:c-team 列显示 token 尾号(token_suffix),永不显示队名。
//   · 主榜次序由后端给定:JSON 已排好,前端按 JSON 原顺序渲染,不前端重排。
//     后端次序 = 有 T4 成绩者在前(T4 SR 降序),其后无 T4 者按答题进度
//     (passed-T3 > passed-T2 > passed-T1 > none,同档以该档 SR 降序)。
//   · 分数列(.c-t3):有 T4 显 T4 得分(graded×100,三层各 1/3 相加);无 T4 显答题进度。
// 契约:leaderboard.json { generated_at, deadline, final_unlocked, dev:[...], final:[...] }
//   每行 { token_suffix, t1/t2/t3:{pass,success_rate},
//          progress:{track:"T3"|"T2"|"T1"|null, success_rate}|null,
//          t4:{graded,submitted_at}|null }   ← 主榜分=分级分 graded(见 organizer boardpub/publish.py)
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

  // T1/T2/T3 达标门:达标=绿勾,未达标=空圈(hover 看成功率),未提交=点。
  function gate(g) {
    if (!g) return '<span class="gate gate-none" title="未提交">·</span>';
    if (g.pass) return '<span class="gate gate-ok" title="已达标">✓</span>';
    var sr = (g.success_rate != null) ? ' ' + Math.round(g.success_rate * 100) + '%' : '';
    return '<span class="gate gate-miss" title="未达标' + sr + '">○</span>';
  }

  // 分数列(沿用原版 .c-t3/.t3wrap/.t3num/.t3bar):
  //   有 T4 → T4 得分 = graded×100(三层各 1/3 相加、叠满 100)+ 色带 + 提交时间;
  //   无 T4 → 当前档 SR×100 的干净数字(dim,标示未进主榜)+ 色带;无任何达标 → 报名中。
  function scoreCell(r) {
    var t4 = r.t4;
    if (t4 && t4.graded != null) {
      var w = Math.max(2, Math.min(100, t4.graded * 100));
      var sub = t4.submitted_at ? '<span class="t3sub">' + esc(t4.submitted_at) + '</span>' : '';
      return '<td class="c-t3"><div class="t3wrap">' +
        '<span class="t3num">' + (t4.graded * 100).toFixed(1) + '</span>' + sub +
        '<span class="t3bar"><i style="width:' + w + '%"></i></span></div></td>';
    }
    var p = r.progress;
    if (p && p.track) {
      var psr = (p.success_rate != null) ? p.success_rate : 0;
      var pw = Math.max(2, Math.min(100, psr * 100));
      var pnum = (p.success_rate != null) ? Math.round(psr * 100) : '—';
      return '<td class="c-t3"><div class="t3wrap" title="' + esc(p.track) + ' 进度 · 未进 T4 主榜">' +
        '<span class="t3num" style="opacity:.55">' + pnum + '</span>' +
        '<span class="t3bar"><i style="width:' + pw + '%"></i></span></div></td>';
    }
    return '<td class="c-t3"><span class="dimcell">报名中</span></td>';
  }

  function rowHtml(r, i) {
    var rank = i + 1;  // 后端已排序;名次按 JSON 原顺序
    var cls = rank <= 3 ? ' top top' + rank : '';
    return '<tr class="brow' + cls + '">' +
      '<td class="c-rank">' + rank + '</td>' +
      '<td class="c-team"><span class="tprefix">…</span>' + esc(r.token_suffix || r.team || '------') + '</td>' +
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
        el.textContent = '已截止 · 榜单已冻结为最终成绩';
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
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');
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
