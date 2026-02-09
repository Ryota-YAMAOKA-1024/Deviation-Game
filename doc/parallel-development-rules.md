# 並行開発ルール（Codex app運用）

## 目的

- 複数ブランチ・複数スレッドで同時実装しても、衝突と手戻りを最小化する。

## 基本原則

- 1スレッド = 1ブランチ = 1機能ブロック。
- ブランチは `codex/` プレフィックスを必須とする。
- `main` は常にデプロイ可能状態を維持する。
- 仕様変更は実装より先に `doc/requirements.md` を更新する。

## ブランチ命名

- 形式: `codex/phase1-<番号>-<機能名>`
- 例:
  - `codex/phase1-8-distance-mode`
  - `codex/phase1-10-drawing-screen`
  - `codex/phase1-12-waiting-screen`
  - `codex/phase1-13-answer-screen`

## 実装責務の分離

- UIは Usecase のみを呼び出す。
- Usecase は業務ロジックと画面遷移判定を担当する。
- Repository は Firebase I/O のみを担当する。
- UI から Firebase SDK 直接呼び出しは禁止。

## 変更ルール

- `AppResult` / `errorCode` ルールを必ず守る。
- 共有ファイルの同時編集を避ける:
  - `src/lib/firebase/client.js`
  - `src/lib/result.js`
  - `doc/requirements.md`
  - `doc/progress.md`
- 共有ファイル変更が必要なら、専用ブランチで先に取り込む。

## 作業フロー

1. `main` から機能ブランチを作成
2. 対象範囲だけ実装（不要な横展開をしない）
3. ドキュメント同期（必要時）
4. `npm run build` 実行
5. 該当導線のスモークテスト実施
6. PR作成・レビュー後に `main` へマージ
7. マージ後にブランチ削除

## PR受け入れ条件

- ビルド成功（`npm run build`）
- 対象導線の遷移確認済み
- `AppResult` 形式統一済み
- `errorCode`/`message` がUIで扱える
- 仕様変更時は `doc/requirements.md` と `doc/progress.md` を同期済み

## 最低スモークテスト

- `DistanceMode -> DrawingScreen -> WaitingScreen -> ResultScreen` が切れない
- `ChallengeConfirm` 未登録導線（QuickSignUp遷移 -> 復帰）が切れない
- `submitAnswer` 後に `participants.{userId}.hasAnswered = true` が反映される
