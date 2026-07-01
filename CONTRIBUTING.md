# Contributing / 参与与反馈

*(English below / 中文在前)*

本仓库是 **TronCamp 赛题官网**(单页静态站,发布到 GitHub Pages)。

- **比赛作品**不在此提交 —— 请用选手包的 `submit.py`(见官网提交说明)。本仓库的 Issue / PR
  仅用于**网站本身**(页面内容、样式、榜单渲染、流程图、文案错漏)的反馈与改进。
- 提 Issue 请用 `.github/ISSUE_TEMPLATE/` 模板;**安全问题不要开公开 Issue**,见
  [`SECURITY.md`](SECURITY.md)。
- 提 PR 请填 `.github/PULL_REQUEST_TEMPLATE.md` 清单;纯静态站,无构建步骤,本地直接用
  `python3 -m http.server` 打开 `index.html` 验证即可。
- **不要**提交任何 token / 密钥 / 内部地址;`data/*.json` 是占位示例,真实榜单由后端发布。

---

## English

This repository is the **TronCamp competition website** (single-page static site,
deployed to GitHub Pages).

- **Competition entries** are not submitted here — use the contestant kit's `submit.py`.
  Issues/PRs on this repo are for the **website itself** (content, styling, leaderboard
  rendering, flowchart, copy fixes).
- Use the templates in `.github/ISSUE_TEMPLATE/`. For security issues, do **not** open a
  public issue — see [`SECURITY.md`](SECURITY.md).
- No build step: preview locally with `python3 -m http.server` and open `index.html`.
  Fill in `.github/PULL_REQUEST_TEMPLATE.md` for PRs.
- Never commit tokens/secrets/internal addresses; `data/*.json` is placeholder sample
  data — live results come from the backend.
