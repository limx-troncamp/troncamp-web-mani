#!/usr/bin/env python3
"""持续同步合并器:后端真实 leaderboard.json + 占位示例 → 正确榜序的 data/leaderboard.json。
用法: board_sync.py <backend_leaderboard.json> <examples.json> <out.json>
  · 后端条目用 team/token_suffix 任一标识(board.js 两者都吃);真实条目优先,同名示例丢弃。
  · 榜序:有 T4 成绩者在前(t4.graded 降序),其后无 T4 者按进度 T3>T2>T1>none(同档 SR 降序)。
  · T4 得分前提:必须顺序过 T1/T2/T3——本脚本不造数据,只透传后端/示例,故口径由上游保证。"""
import json, sys

def load(p): return json.load(open(p, encoding="utf-8"))
def tid(e): return e.get("token_suffix") or e.get("team")
def norm(e):
    out = {"token_suffix": tid(e)}
    for k in ("t1","t2","t3","t4","progress"):
        if k in e: out[k] = e[k]
    return out
RANK = {"T3":1,"T2":2,"T1":3,None:4}
def keyf(e):
    t4 = e.get("t4")
    if t4 and t4.get("graded") is not None: return (0, -t4["graded"])
    pr = e.get("progress") or {}
    return (1+RANK.get(pr.get("track"),4), -(pr.get("success_rate") or 0))

backend, examples, out_path = load(sys.argv[1]), load(sys.argv[2]), sys.argv[3]
real = [norm(e) for e in backend.get("dev", [])]
ids = {e["token_suffix"] for e in real}
ex = [norm(e) for e in examples if tid(e) not in ids]   # 真实优先
merged = sorted(real + ex, key=keyf)
result = {
    "_comment": "后端真实榜 + 占位示例自动合并(board_sync)。真实条目优先;示例仅在无同名真实条目时保留。",
    "generated_at": backend.get("generated_at"),
    "deadline": backend.get("deadline"),
    "final_unlocked": backend.get("final_unlocked", False),
    "dev": merged,
    "final": backend.get("final", []),
}
json.dump(result, open(out_path,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"synced: {len(real)} real + {len(ex)} example = {len(merged)} entries -> {out_path}")
