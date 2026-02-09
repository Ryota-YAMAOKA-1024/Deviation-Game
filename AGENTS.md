# Repository Guidelines

## コミュニケーション
このリポジトリでは日本語でやり取りします。議論や提案は日本語で短く明確に書き、必要な場合のみ英語の用語を併記します。

## Project Structure & Module Organization
現状はドキュメント中心の構成です。`doc/` 配下に企画・設計がまとまっています。
- `doc/requirements.md`: プロジェクト概要、MVP方針、機能要件・非機能要件
- `doc/progress.md`: Phase1.x の進捗管理
- `doc/screen-flow.md`: 画面遷移、ルーティング、データモデル
- `doc/tech-stack.md`: 技術スタック、AI API、データフロー
ソースコードを追加する場合は `src/`、テストは `tests/`、画像などのアセットは `assets/` に分離し、このガイドを更新してください。

## Build, Test, and Development Commands
まだ実行可能なコマンドは定義されていません（`package.json` なし）。導入時は以下の形式で追記します。
- `npm run dev`: ローカル開発サーバー起動（例: Vite）
- `npm run build`: 本番ビルド
- `npm test`: テスト実行

## Coding Style & Naming Conventions
コード規約は未定です。React + Vite + Tailwind を想定しているため、導入時に以下を定義してください。
- インデント: JS/TS は 2 スペース
- ファイル名: `kebab-case`、識別子: `camelCase` / `PascalCase`
- フォーマッタ/リンター: Prettier + ESLint（導入時にコマンドを明記）

## Testing Guidelines
テスト環境は未整備です。追加時の指針:
- フレームワークは Vitest または Jest を想定
- テスト配置は `tests/` もしくは `*.test.ts` の隣接配置
- カバレッジ基準と実行コマンドを明記

## Commit & Pull Request Guidelines
現時点で Git 履歴がないため規約は未確定です。暫定ルール:
- コミットは簡潔な現在形（例: “Add requirements draft”）
- PR には概要、目的、関連ドキュメント（`doc/`）の参照を含める
- UI 変更が入った場合のみスクリーンショットを添付

## PR / CI / Branch Protection 標準手順
- `main` への直接 push は行わず、必ず PR 経由でマージする。
- PR は CI 完了（全 required checks 成功）を確認してからマージする。
- required checks は `web-build` と `functions-build` を設定する。
- どちらかの check が失敗した場合は、ログ確認 -> 修正コミット -> 同PRで再実行する。
- Branch protection は `main` に対して以下を有効化する:
  - PR 必須（`Require a pull request before merging`）
  - status checks 必須（`Require status checks to pass before merging`）
  - （推奨）branch最新化必須、会話解決必須、bypass禁止

## 進捗更新ルール
- Phase1.x が完了したら `doc/progress.md` の該当項目にチェック（`[x]`）を付ける

## 変更反映ルール
- `doc/requirements.md` か `doc/progress.md` のどちらかを修正したら、対応する内容をもう一方にも反映する

## Security & Configuration Tips
現状は秘密情報や設定ファイルなし。Firebase/Gemini などの設定を導入する場合:
- `.env.example` で必要な変数を明示
- 本物のキーはコミットしない

## Worktree-Based Parallel Execution（汎用）
- 並行開発を行う場合は、ブランチ単位で `git worktree` を作成し、作業ディレクトリを分離する。
- 「スレッド分離」と「Git作業ツリー分離」は別概念である。スレッドだけ分けても、同じディレクトリなら状態は共有される。
- 1スレッド=1ブランチ=1worktree を原則にする。
- これにより、未コミット変更やブランチ切替の干渉を防ぎ、どのプロジェクトでも安全に並行実装できる。
