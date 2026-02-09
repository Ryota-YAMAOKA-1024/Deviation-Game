# Codex依頼文テンプレート（並行開発用）

## 使い方

- 1テンプレを1スレッドで使う。
- `[]` の中身を埋めてから依頼する。
- スコープ外の変更を禁止する文言を毎回入れる。

## テンプレートA（共通）

```md
目的: [何を実装するか]

対象ブランチ:
- [codex/phase1-xx-xxx]

対象ファイル（この範囲のみ変更可）:
- [path1]
- [path2]

完了条件:
1. [条件1]
2. [条件2]
3. npm run build が通る

制約:
- UIからFirebase SDKを直接呼ばない（Usecase経由）
- AppResult/errorCodeルールを守る
- 対象外ファイルは変更しない

確認してほしいこと:
- 変更ファイル一覧
- 実施した確認内容
- 未実施/未解決があれば明記
```

## テンプレートB（DistanceMode）

```md
DistanceMode（/team/:teamId/distance）を実装してください。

対象ブランチ:
- codex/phase1-8-distance-mode

対象ファイル:
- src/pages/[DistanceMode関連]
- src/lib/usecases/startDistanceGame.js
- src/lib/repos/topicsRepo.js
- 必要最小限のルーティング関連

完了条件:
1. お題5件を表示できる
2. 1件選択でゲーム開始処理（startDistanceGame）を呼べる
3. DrawingScreenへ遷移できる
4. npm run build が成功

制約:
- 仕様変更はしない（必要なら先に提案）
- RealtimeModeや管理画面には触れない
```

## テンプレートC（DrawingScreen）

```md
DrawingScreen（/game/:gameId/draw）を実装してください。

対象ブランチ:
- codex/phase1-10-drawing-screen

対象ファイル:
- src/pages/[DrawingScreen関連]
- src/lib/usecases/completeDrawing.js
- src/lib/repos/gamesRepo.js（必要箇所のみ）

完了条件:
1. 画面表示時に90秒タイマー開始
2. 90秒経過時にWaitingScreenへ自動遷移
3. 完了時にcompleteDrawingを呼び出す
4. npm run build が成功

制約:
- AnswerScreen/ResultScreenのロジックは変更しない
```

## テンプレートD（AnswerScreen）

```md
AnswerScreen（/game/:gameId/answer）を実装してください。

対象ブランチ:
- codex/phase1-13-answer-screen

対象ファイル:
- src/pages/[AnswerScreen関連]
- src/lib/usecases/submitAnswer.js
- src/lib/repos/gamesRepo.js（必要箇所のみ）

完了条件:
1. 回答入力と送信ができる
2. submitAnswer呼び出し後、状態更新が反映される
3. ResultScreen待機導線が成立
4. npm run build が成功

制約:
- DistanceMode/DrawingScreenには触れない
```

## テンプレートE（レビュー依頼）

```md
このブランチの実装レビューをしてください。

観点:
1. 仕様逸脱がないか
2. AppResult/errorCodeルール違反がないか
3. UIからSDK直呼びがないか
4. 回帰リスク（遷移断・データ更新漏れ）

出力形式:
- Findingsを重大度順で列挙
- 各Findingに対象ファイルを明記
- Findingsがなければ「なし」と明記
```
