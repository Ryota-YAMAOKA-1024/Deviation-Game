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

## 進捗更新ルール
- Phase1.x が完了したら `doc/progress.md` の該当項目にチェック（`[x]`）を付ける

## 変更反映ルール
- `doc/requirements.md` か `doc/progress.md` のどちらかを修正したら、対応する内容をもう一方にも反映する

## Security & Configuration Tips
現状は秘密情報や設定ファイルなし。Firebase/Gemini などの設定を導入する場合:
- `.env.example` で必要な変数を明示
- 本物のキーはコミットしない
