# GitHub Branch Protection / CI運用

## 方針

- `main` への直接 push は禁止する。
- 変更は必ず Pull Request 経由で `main` に取り込む。
- PR時に CI を実行し、required status checks を通過したものだけマージする。

## Branch protection（`main`）設定項目

GitHub Repository Settings > Branches > Add rule で `main` を対象に以下を有効化する。

1. `Require a pull request before merging` を有効化
2. `Require status checks to pass before merging` を有効化
3. Required checks に以下を設定
   - `web-build`
   - `functions-build`
4. （推奨）`Require branches to be up to date before merging` を有効化
5. （推奨）`Require conversation resolution before merging` を有効化
6. （推奨）`Do not allow bypassing the above settings` を有効化

## PR時CI

- `.github/workflows/ci.yml` で、`pull_request`（base: `main`）時に CI を実行する。
- 最低限、以下をチェックする。
  - Web app: `npm ci` + `npm run build`
  - Functions: `cd functions && npm ci && npm run build`

## 運用ルール

1. 作業は `codex/phase1-*` ブランチで行う。
2. `main` へ直接pushしない。
3. PRを作成し、CI成功を確認してからマージする。
4. マージ後に `doc/progress.md` の該当項目を更新する。
