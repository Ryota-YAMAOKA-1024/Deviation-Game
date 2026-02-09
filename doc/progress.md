# 開発進捗（Phase1.x）

進捗ルール: 完了した Phase1.x はチェックを付ける（`[x]`）。
並列開発メモ: まず Phase1.0 で全体の骨組み（ルーティング/データモデル雛形/共通UI/画面テンプレ/Firestore・FunctionsのIF）を作る。
以降は機能ブロック単位で並行実装し、ブロック間は入出力仕様で接続する。
並列開発開始前に、I/O契約・最小スキーマ・画面Done条件を固定する。

- 進捗サマリー（2026-02-07）
  - 画面遷移の骨組みは実装済み（主要ルート遷移とプレースホルダー表示）。
  - QuickSignUp -> ChallengeConfirm 復帰フロー（未登録時リダイレクト）は実装済み。
  - UserHome の名前変更（簡易セッション更新）は実装済み。
  - 共通基盤A（Repository + Usecase）の仕様固定は完了。
  - `firebase emulators:start` の起動確認は完了。
  - 実装済み共通基盤（雛形）:
    - `firebase/client`（初期化 + Emulator切替）
    - `topicsRepo + startDistanceGame`
    - `gamesRepo + completeDrawing`
    - `gamesRepo + submitAnswer`
  - 備考: この実行環境ではネットワーク制限により `npm install firebase` は未実行。依存導入はローカル端末で実施。

- [x] **Parallel-Prep1: 画面I/O契約固定** — `doc/requirements.md` の「並列開発開始前の固定事項（Phase1）」に明文化。
- [x] **Parallel-Prep2: データ契約（最小スキーマ）固定** — `users / teams / games / topics` の必須フィールドを固定。
- [x] **Parallel-Prep3: 共通基盤方針固定（A）** — `UI -> Usecase -> Repository -> Firebase SDK`、Interface（Repo/Usecase）、返却型 `AppResult` と `errorCode` ルールを固定。
- [x] **Parallel-Prep4: 画面ごとのDone条件定義** — 主要8画面の完了条件を明文化。
- [x] **Parallel-Prep5: 統合ルール固定** — 接続原則、受け入れ条件、競合回避ルール、最低スモークテストを固定。
- [x] **Parallel-Prep6: ブランチ戦略固定** — `codex/` 命名規則、開発フロー、PR受け入れ条件を固定。

## 並行トラック運用（3スレッド）

運用方針:
- このファイルの Phase1.x 一覧を「マスタープラン（一本線）」として維持する。
- 実行は下記3トラックで並行し、完了時に対応する Phase1.x をチェックする。

### Track A: DistanceMode 系

- ブランチ: `codex/phase1-8-distance-mode`
- 対象Phase: 1.7, 1.8, 1.8a
- 現在ステータス: `todo`
- ブロッカー: `none`

### Track B: Drawing/Waiting 系

- ブランチ: `codex/phase1-10-drawing-screen`, `codex/phase1-12-waiting-screen`
- 対象Phase: 1.9, 1.10, 1.11, 1.12
- 現在ステータス: `todo`
- ブロッカー: `none`

### Track C: Challenge/Answer/Result 系

- ブランチ: `codex/phase1-12a-challenge-confirm`, `codex/phase1-13-answer-screen`, `codex/phase1-15-result-screen`
- 対象Phase: 1.12a, 1.13, 1.14, 1.15
- 現在ステータス: `todo`
- ブロッカー: `none`

- [ ] **Phase1.0: ローカル開発基盤** — Vite 初期化 + Firebase Emulator 設定（本番Firebaseは触らない）。
- [ ] **Phase1.1: Firestore（UserHome範囲）** — users / teams の最小スキーマと読み取り（エミュレータで実施）。
- [ ] **Phase1.2: Login（`/login`）** — 簡易ログイン画面（ニックネーム登録を含む）と遷移。
- [ ] **Phase1.3: UserHome（`/`）** — チーム一覧と個人Inboxの表示と遷移（Inboxはリスナー）。
- [ ] **Phase1.4: Firestore（CreateTeam範囲）** — teams 作成・メンバー追加の書き込み（エミュレータ）。
- [ ] **Phase1.5: QuickSignUp / CreateTeam** — 簡易登録と新規チーム作成フローと遷移。
- [ ] **Phase1.6: TeamHome（`/team/:teamId`）** — 統計、未完了出題、モード選択のハブと遷移（リアルタイムモード画面への遷移は実装、遷移先画面自体は今回はプレースホルダーで未実装）。
- [ ] **Phase1.7: Firestore（DistanceMode範囲）** — topics 読み取りとランダム選択（エミュレータ）。
- [ ] **Phase1.8: DistanceMode（`/team/:teamId/distance`）** — お題5件提示と1件選択と遷移。
- [ ] **Phase1.8a: Topics 初期投入** — 日常語150件を `topics` に登録（エミュレータ）。
- [ ] **Phase1.9: Storage 設計** — 画像アップロード方式とセキュリティルール（エミュレータ）。
- [ ] **Phase1.10: DrawingScreen（`/game/:gameId/draw`）** — 描画、タイマー、保存/送信と遷移（画面表示時に90秒カウント開始、90秒経過でWaitingScreenへ自動遷移）。
- [ ] **Phase1.11: Firestore（Game進行範囲）** — games 作成/更新（待機〜結果、エミュレータ）。
- [ ] **Phase1.12: WaitingScreen（`/game/:gameId/wait`）** — 回答待機と招待リンク共有と遷移（招待共有用URLコピー機能を含む、状態更新はリスナー）。
- [ ] **Phase1.12a: ChallengeConfirm（`/challenge/:inviteCode`）** — 招待受け取りと参加確認と遷移。
- [ ] **Phase1.13: AnswerScreen（`/game/:gameId/answer`）** — 回答入力と回答済み状態と遷移（状態更新はリスナー）。
- [ ] **Phase1.14: Cloud Functions 雛形** — Gemini API 呼び出しの基盤実装（エミュレータ）。
- [ ] **Phase1.15: ResultScreen（`/game/:gameId/result`）** — AI判定と勝敗・確証度の表示（Functions経由）と遷移（結果更新はリスナー）。
- [ ] **Phase1.16: History（`/history`）** — 完了済みゲーム履歴の一覧と遷移。
- [ ] **Phase1.17: AdminDashboard（`/admin`）** — 管理ダッシュボードと遷移。
- [ ] **Phase1.18: AdminTeams（`/admin/teams`）** — チーム管理と遷移。
- [ ] **Phase1.19: AdminGames（`/admin/games`）** — ゲーム管理と遷移。
- [ ] **Phase1.20: AdminUsers（`/admin/users`）** — ユーザー管理と遷移。
- [ ] **Phase1.21: AdminContent（`/admin/content`）** — コンテンツ管理と遷移。
- [ ] **Phase1.22: セキュリティルール設計** — Firestore / Storage のアクセス制御（本番適用はMVP直前）。
- [ ] **Phase1.99: MVPデプロイ手順** — Hosting への公開手順を整備（ここで本番Firebaseに接続）。
