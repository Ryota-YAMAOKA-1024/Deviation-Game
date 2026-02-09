r# Requirements Document

## プロジェクト概要

### プロジェクト名
Deviation

### 目的
友人とオンラインでプレイできるお絵かきゲームWebアプリケーションの開発

### 背景
- 個人用の新しいアプリケーション開発プロジェクト
- ターゲットユーザー: 自分自身とその友人グループ

### ゲームコンセプト
**人間 vs AI のお絵かき当てゲーム**

5人でプレイするゲームで、以下のルールで進行する:
1. 1人がお題（指定された言葉）を表すスケッチを90秒以内に描く（iPad想定）
2. 残りの4人がそれを当てる（テキスト入力で回答）
3. AIもそのスケッチが何を描いているか同時に推測する
4. **勝敗条件:**
   - AIが正解を当てたら → 人間側の負け
   - AIが当てず、人間のうち1人以上が当てたら → 人間側の勝ち

### MVP開発方針

#### 段階的実装戦略
1. **Phase 1（MVP）: ディスタンスモード**
   - 非同期プレイに特化
   - スケッチは完成後のみ共有
   - Firebase Firestore のみでシンプルに実装
   - 早期リリースを優先

2. **Phase 2（将来）: リアルタイムモード**
   - リアルタイム描画同期を追加
   - WebSocket または Firebase Realtime Database を導入
   - MVPの学びを活かして実装

#### 並列開発方針
先に「全体の骨組み（共通構造）」を作成し、その後は機能ブロック単位で並列に実装する。
全体の骨組みには、ルーティング、データモデルの雛形、共通UIコンポーネント、画面テンプレ、API/Firestoreのインターフェース定義を含める。
ブロック例: 認証/ユーザー、チーム、トピック選定、描画、待機、回答、結果、履歴、管理、AI判定/Functions、Storage。
各ブロックは独立して進められるように、入出力（データ構造/画面遷移/呼び出しAPI）を事前に固定する。

#### 技術選択の理由
- **Firestore のみ（MVP）**:
  - シンプルで学習コストが低い
  - ディスタンスモードには十分な性能
  - 実装速度を優先

- **Realtime DB / WebSocket 追加（将来）**:
  - リアルタイム描画同期に最適
  - 段階的な機能追加が可能

## ゲームモード

### リアルタイムモード
- 全プレイヤーが同時にオンラインでプレイ
- **スケッチを描いている最中、リアルタイムで他のプレイヤーに表示される**
- 描いている途中でも他のプレイヤーは回答可能
- AIも同時進行で判定を行う
- **実装:** WebSocket または Firebase Realtime Database
- **ステータス: 将来実装予定（MVP対象外）**

### ディスタンスモード（非同期モード）
- 描く人が好きなタイミングでスケッチを作成
- **スケッチ完成後のみ他のプレイヤーに公開される**（描画中はリアルタイム同期なし）
- 他のプレイヤーは好きなタイミングで回答できる
- AIも回答者の判定と同じタイミングで判定
- **実装:** Firebase Firestore のみ
- **ステータス: MVP（最優先実装）**

## 機能要件

### 必須機能（MVP: ディスタンスモード）

共通ルール:
- 画面実装時は必ず遷移（画面間の導線）も同時に実装する
- Firestore は **基本1回取得**、状態変化が重要な画面のみ **リスナー（onSnapshot）** を使う

#### 1. モード選択画面
- リアルタイムモードとディスタンスモードの選択ページ
- TeamHome からリアルタイムモード画面への遷移は可能にする
- リアルタイムモード画面は今回はプレースホルダーのみとし、機能は完全に未実装でよい
- **iPad のみ**ディスタンスモードのボタンが押下可能で、押下時に出題画面へ遷移する
- iPad 以外（iPhone/PC）はボタン自体は表示するが押下不可（無効化）

#### 2. お絵かき機能
- p5.jsを使用したキャンバス描画
- 90秒のタイマー（DrawingScreenを開いた時点でカウント開始）
- 90秒経過時は WaitingScreen（`/game/:gameId/wait`）へ自動遷移
- 描画ツール（ペン、消しゴム、色選択、線の太さ）
- キャンバスのクリア機能
- 描画の保存と送信
  - Canvas を PNG 形式で Firebase Storage にアップロード
  - ダウンロード URL を Firestore に保存
  - 他のプレイヤーは URL 経由で画像を表示

#### 3. お題システム
- お題リストからランダムに5つを提示
- 描く人が5つの中から1つを選択
- お題リストの管理:
  - **日常的な単語を150語**プリセット登録
  - お題の追加は **管理者のみ**（MVP）
  - プレイヤーによるお題追加は **アップデート要件**

#### 4. 回答システム
- テキスト自由入力での回答
- AI判定による正誤判定（完全一致ではなく、意味的な正解判定）
- リアルタイムで他のプレイヤーの回答状況を表示（誰が回答済みか）

#### 5. AI判定機能
- スケッチ画像をAIに送信
- AIがスケッチ内容を推測
- **確証度（0-100）も取得**
- 推測結果とお題を照合
- 判定結果と確証度の表示

#### 6. スコア・統計機能
- 人間 vs AI の勝敗カウント（必須）
- ゲーム履歴の保存
- 詳細な統計情報:
  - 各プレイヤーの正解数
  - AI勝率
  - **AIの平均確証度**
  - **確証度別の正解率**（AIが自信満々な時の正解率など）
  - ラウンド数
  - 過去のスケッチと結果の閲覧
    - Firestore から `games/{gameId}/rounds` を取得
    - 各ラウンドの `sketchUrl` で画像を表示
    - 回答と AI 推測を同時に表示
    - 1つのクエリで全データ取得可能

#### 7. ユーザー認証・管理
- MVPは Firebase Authentication を使わず、**簡易ニックネーム登録のみ**で運用
- 招待制のゲームルーム作成
- ルーム招待リンクの生成と共有
- WaitingScreen で招待共有用URLのコピー機能を提供

#### 8. ゲーム進行管理
- ラウンド数: 無制限（プレイヤーが終了を選択するまで）
- 描く人の順番管理
- 次のラウンドへの移行

#### 9. 管理者画面
- 管理ダッシュボード、チーム管理、ゲーム管理、ユーザー管理、コンテンツ管理
- 画面構成は `doc/screen-flow.md` を参照

### オプション機能（将来的な拡張）

#### 1. 個人ポイント制
- 人間 vs AI の他に、人間同士の競争要素を追加
- 正解したプレイヤーに個人ポイントを付与
- 個人ランキングの表示

#### 2. リアルタイムモード（リアルタイムモード）の実装
- リアルタイム同期機能の実装
- 同時接続管理

#### 3. 高度なお絵かき機能
- 図形ツール（円、四角、直線）
- レイヤー機能
- Undo/Redo機能

#### 4. リプレイ機能
- 描画プロセスの記録と再生
- 描画の様子をアニメーションで再現

#### 5. カスタムルーム設定
- 制限時間のカスタマイズ
- プレイヤー人数の変更
- お題カテゴリーの選択

#### 6. テキストチャット
- ゲーム中のテキストチャット機能
- 回答とは別のコミュニケーション用

## 非機能要件

### パフォーマンス

#### MVP（ディスタンスモード）
- AI判定の応答時間は5秒以内
- Canvas描画のフレームレートは60fps以上
- Firestoreのリスナー更新は1秒以内に反映
- 画像アップロード（Firebase Storage）は10秒以内

#### 将来（リアルタイムモード）
- スケッチのリアルタイム同期は遅延100ms以内を目指す
- 最大5人の同時接続に対応
- WebSocket接続の安定性を確保

### セキュリティ
- 招待制によるアクセス制限
- Firebase Authenticationによる簡易認証
- API KeyはFirebase環境変数で管理
- 不適切な画像・テキストの報告機能（将来的に）

### 拡張性
- お題リストの動的追加・編集に対応
- 将来的なプレイヤー人数の変更に対応できる設計
- **リアルタイムモードへの移行を想定した設計**
  - Firestore → Realtime Database / WebSocket 追加が容易
  - データ構造はモード切り替えに対応
- その他のモード追加も想定した柔軟な設計

### ユーザビリティ
- iPad（タブレット）を主要デバイスとして最適化
- iPhone: 回答専用モードとして参加可能
- シンプルでミニマルなUI/UX
- 直感的な操作性

## 技術スタック

### レンダリング方式
- **CSR（クライアントサイドレンダリング）**
  - リアルタイム性とインタラクティブ性が重要
  - Firebaseとの直接連携
  - SEO不要（招待制の友人向けアプリ）

## 開発フェーズ

### Phase 1（MVP: ディスタンスモード）
- 非同期プレイに特化
- Firestore + Storage + Cloud Functions（Gemini）で構成（MVPはAuthなし）
- iPad を主要デバイスとして最適化

### Phase 2（将来: リアルタイムモード）
- リアルタイム描画同期を追加
- Realtime Database または WebSocket を導入

## Firebase 利用タイミング（MVP開発内）

### Firestore（エミュレータで開始 → 本番はMVP公開直前）
- Phase1.1: `users` / `teams` の読み取り（UserHome）
- Phase1.4: `teams` 作成・メンバー追加（CreateTeam）
- Phase1.7: `topics` 読み取り（DistanceMode）
- Phase1.11: `games` 作成・進行更新（Waiting/Answer/Result）

### Storage（エミュレータで開始 → 本番はMVP公開直前）
- Phase1.9: 画像アップロード方式の設計
- Phase1.10: スケッチ画像のアップロード（DrawingScreen）

### Cloud Functions / Gemini API（エミュレータで開始 → 本番はMVP公開直前）
- Phase1.14: Cloud Functions 雛形を用意
- Phase1.15: Gemini API を Cloud Functions 経由で実行（ResultScreen）
  - サーバーレスアーキテクチャ

### フロントエンド
- **ビルドツール:** Vite
- **フレームワーク:** React
- **描画ライブラリ:** p5.js (instance mode)
  - グローバル名前空間を汚染しない
  - React コンポーネント内で安全に使用可能
  - 複数のスケッチを同時に管理可能
- **スタイリング:** Tailwind CSS
  - ユーティリティファーストCSS
  - シンプル・ミニマルなデザインに最適
  - レスポンシブ対応が簡単（iPad/iPhone対応）
  - Vite + React との相性が良い
  - 開発速度が速い
- **状態管理:** React hooks（useState, useEffect, useContext）
- **ルーティング:** React Router

### バックエンド
- **BaaS:** Firebase

#### MVP（ディスタンスモード）で使用
  - **Firebase Firestore（メインDB）**
    - ゲーム状態管理
    - ゲーム履歴、統計
    - お題リスト
    - チャット
    - プレイヤー情報
  - **Firebase Authentication**（簡易認証）
  - **Firebase Hosting**（静的サイトホスティング）
  - **Firebase Storage**（スケッチ画像の保存）
  - **Firebase Cloud Functions**（Gemini API連携用）

#### 将来追加（リアルタイムモード実装時）
  - **Firebase Realtime Database**
    - リアルタイムゲーム状態の同期
    - WebSocketとの併用でリアルタイム描画同期
    - 間引き送信によるストロークデータの同期

### AI API
- **採用:** Google Gemini API (gemini-2.5-flash)
  - マルチモーダルAPI（画像とテキストの両方を扱える）
  - スケッチ認識に適している（推論能力が高い）
  - Google Cloudから直接課金可能
  - 高速レスポンス
  - Firebase Cloud Functionsから呼び出し

#### 料金（2026年2月時点）
- 入力: $0.15 / 1M tokens
- 出力: $0.60 / 1M tokens
- 画像: $0.0011 / image（約560 tokens）
- **月間コスト試算:** 月20ラウンド（40 API呼び出し）で約**$0.027（約4円）**

#### API呼び出しフロー（1ラウンドあたり2回）

**1回目: スケッチ認識 + AIの推測**
```javascript
入力:
  - スケッチ画像（base64）
  - プロンプト:
    "この絵は何を描いていますか？
     以下のJSON形式で回答してください：
     {
       \"guess\": \"あなたの推測\",
       \"confidence\": 0-100の数値（あなたの推測の確信度）
     }"

出力例:
  {
    "guess": "犬",
    "confidence": 85
  }
```

**2回目: 正誤判定（テキストのみ）**
```javascript
入力:
  - プロンプト:
    "お題は「犬」です。
     以下の回答が、お題と意味的に一致するか判定してください。
     表記ゆれ（ひらがな/カタカナ、送り仮名など）は正解とします。

     回答:
     - AI: 犬
     - player1: わんちゃん
     - player2: いぬ
     - player3: 猫
     - player4: ドッグ

     以下のJSON形式で回答してください：
     {
       \"ai\": true/false,
       \"player1\": true/false,
       \"player2\": true/false,
       \"player3\": true/false,
       \"player4\": true/false
     }"

出力例:
  {
    "ai": true,
    "player1": true,
    "player2": true,
    "player3": false,
    "player4": true
  }
```

**確証度の実装について:**
- **重要:** Gemini APIには組み込みの確証度スコアは存在しない
- プロンプトでAIに自己評価させる方式を採用
- この確証度はモデルの実際の確信度ではなく、AIの推測値
- 精度は保証されないが、ゲーム性向上のために使用
- （参考）Cloud Vision APIには正確な確証度スコアがあるが、スケッチ認識の精度が低い

**確証度の活用:**
- AIが確信を持って答えているか可視化
- 低確証度（例: 40以下）の場合、UIで表現（「AIが迷っている」など）
- ゲームの面白さを向上（AIが自信なさそうな時は人間有利）
- デバッグや改善の指標（あくまで参考値として）

**メリット:**
- 2回目のリクエストで全員分をまとめて判定できる
- 意味的な一致を判定可能（"犬" = "わんちゃん" = "いぬ"）
- Cloud Vision API（ラベル検出のみ）より推論能力が高い
- スケッチや抽象的な絵の理解に優れている

#### 代替モデル候補

**Gemini 3 Flash（最新）**
- 入力: $0.50 / 1M tokens、出力: $3.00 / 1M tokens
- 2.5 Flashより新しく高性能
- 月20ラウンドで約$0.04（約6円）
- 将来的に切り替える可能性あり

**Gemini 2.5 Pro（高精度）**
- 入力: $1.25 / 1M tokens、出力: $1.25 / 1M tokens
- 最高精度のスケッチ理解
- 月20ラウンドで約$0.047（約7円）
- 精度が必要な場合に検討

**OpenAI GPT-4o with Vision**
- より高精度だが、コストが高い
- Google Cloud以外の課金が必要

### データ同期戦略

#### MVP: ディスタンスモード
- **Firebase Firestore**のリアルタイムリスナーで状態監視
- スケッチは完成後のみ共有（リアルタイム描画同期なし）
- チャットはFirestoreの`onSnapshot`でリアルタイム表示
- 非同期プレイに最適化

#### 将来: リアルタイムモード
- **WebSocket (Socket.io) + Node.js**
  - リアルタイム描画同期（間引き送信）
  - 低遅延チャット
- **Firebase Realtime Database**
  - ゲーム状態の即座の同期
  - WebSocketとの併用
- **技術選択肢:**
  - オプション1: WebSocketのみ（最も高速）
  - オプション2: Realtime Database + 間引き送信（Firebase完結）
  - オプション3: 両方併用（Realtime DBで状態、WebSocketで描画）

### 開発ツール
- Git（バージョン管理）
- VS Code
- Firebase CLI
- Node.js / npm

## アーキテクチャ設計

### システム構成図

#### MVP: ディスタンスモード
```
[Client (Browser) - CSR]
  Vite + React SPA
  ├── p5.js (instance mode) - Canvas描画
  ├── React Router - ルーティング
  ├── React Components - UI
  └── Firebase SDK (Client)
       ├── Authentication
       ├── Firestore (onSnapshot でリアルタイムリスナー)
       └── Storage
          ↓
[Firebase Backend]
  ├── Hosting (静的サイト配信)
  ├── Firestore
  │    ├── games (ゲーム状態)
  │    ├── rounds (ラウンド履歴)
  │    ├── chat (チャット)
  │    └── topics (お題リスト)
  ├── Storage (スケッチ画像)
  └── Cloud Functions
       └── callGemini() - AI判定 (gemini-2.5-flash)
          ↓
[External API]
  └── Google Gemini API (gemini-2.5-flash)
```

#### 将来: リアルタイムモード追加時
```
[Client]
  └── Firebase SDK + WebSocket Client
       ├── Firestore (ゲーム状態)
       ├── Realtime Database (リアルタイム同期)
       └── WebSocket (描画ストリーミング)
          ↓
[Backend]
  ├── Firebase (既存)
  ├── Realtime Database (追加)
  └── Node.js + Socket.io (追加)
       └── 描画データのリアルタイム配信
```

### フロントエンド構成
```
src/
├── components/
│   ├── Canvas/
│   │   └── P5Canvas.jsx (p5.js instance mode)
│   ├── Game/
│   │   ├── DrawingBoard.jsx
│   │   ├── AnswerInput.jsx
│   │   ├── TopicSelector.jsx
│   │   └── ScoreBoard.jsx
│   ├── Chat/
│   │   └── ChatBox.jsx
│   └── Common/
│       ├── Timer.jsx
│       └── PlayerList.jsx
├── pages/
│   ├── Home.jsx
│   ├── ModeSelect.jsx
│   ├── GameRoom.jsx
│   └── History.jsx
├── hooks/
│   ├── useP5.js
│   ├── useFirebase.js
│   └── useGameState.js
├── services/
│   ├── firebase.js
│   └── gemini.js
└── App.jsx
```

### データモデル（Firebase）

#### データ保存場所と紐づけ

**スケッチ画像: Firebase Storage**
- 保存パス: `/sketches/{gameId}/{roundId}.png`
- Canvas（p5.js）を Blob/Base64 に変換してアップロード
- アップロード後、ダウンロード URL を取得
- 例: `https://firebasestorage.googleapis.com/v0/b/deviation.appspot.com/o/sketches%2Fgame1%2Fround1.png?alt=media&token=...`

**回答データ: Firebase Firestore**
- スケッチ画像の URL を Firestore に保存
- 回答データと同じドキュメント内で管理
- **URL による紐づけ**で、画像と回答が常に一緒に取得できる

**フロー:**
```javascript
// 1. Storageに画像アップロード
const storageRef = ref(storage, `sketches/${gameId}/${roundId}.png`);
await uploadBytes(storageRef, blob);
const downloadURL = await getDownloadURL(storageRef);

// 2. Firestoreに保存（URLで紐づけ）
await setDoc(doc(db, `games/${gameId}/rounds/${roundId}`), {
  sketchUrl: downloadURL,  // ← Storage URLで紐づけ
  answers: [...],          // 回答データ
  aiGuess: {...}           // AI回答
});

// 3. 後で取得（画像と回答を同時に取得）
const roundDoc = await getDoc(doc(db, `games/${gameId}/rounds/${roundId}`));
const sketchUrl = roundDoc.data().sketchUrl;  // 画像URL
const answers = roundDoc.data().answers;      // 回答
```

**メリット:**
- シンプルで分かりやすい
- 1つのクエリで画像と回答を同時取得
- 過去のスケッチ閲覧が簡単

#### MVP: ディスタンスモード用データ構造（Firestore）

**コレクション: users**
```javascript
/users/{userId}
{
  nickname: string,
  createdAt: timestamp,
  gamesPlayed: number
}
```

**コレクション: topics**
```javascript
/topics/{topicId}
{
  text: string,           // 例: "犬"
  category: string,       // 例: "動物"
  isDefault: boolean,     // プリセットか追加か
  createdBy: userId,      // 追加したユーザー
  createdAt: timestamp
}
```

**コレクション: games**
```javascript
/games/{gameId}
{
  mode: "realtime" | "distance",
  status: "waiting" | "playing" | "finished",
  createdBy: userId,
  createdAt: timestamp,

  // プレイヤー情報
  players: {
    [userId]: {
      nickname: string,
      joinedAt: timestamp,
      ready: boolean
    }
  },

  // 現在のラウンド情報
  currentRound: number,
  currentDrawer: userId,
  currentTopic: string,
  currentTopicId: string,

  // 現在のラウンドの回答状況
  currentRoundData: {
    sketchUrl: string,              // Firebase Storageの画像URL
    sketchUploadedAt: timestamp,
    answers: {
      [userId]: {
        answer: string,
        submittedAt: timestamp,
        isCorrect: boolean | null   // 判定前はnull
      }
    },
    aiGuess: {
      answer: string,
      confidence: number,           // 0-100
      isCorrect: boolean | null,
      judgedAt: timestamp
    }
  },

  // 累計スコア
  score: {
    human: number,
    ai: number
  }
}
```

**サブコレクション: games/{gameId}/rounds**
```javascript
/games/{gameId}/rounds/{roundId}
{
  roundNumber: number,
  drawer: userId,
  topic: string,
  topicId: string,

  // Firebase Storage URL（画像との紐づけ）
  sketchUrl: string,  // 例: "https://firebasestorage.googleapis.com/.../sketches/game1/round1.png"

  startedAt: timestamp,
  finishedAt: timestamp,

  answers: [
    {
      userId: string,
      answer: string,
      isCorrect: boolean,
      submittedAt: timestamp
    }
  ],

  aiGuess: {
    answer: string,
    confidence: number,
    isCorrect: boolean
  },

  winner: "human" | "ai"
}
```

**サブコレクション: games/{gameId}/chat**
```javascript
/games/{gameId}/chat/{messageId}
{
  userId: string,
  nickname: string,
  message: string,
  createdAt: timestamp
}
```

**コレクション: gameHistory（完了したゲームの要約）**
```javascript
/gameHistory/{gameId}
{
  mode: "distance",
  players: [userId],
  totalRounds: number,
  finalScore: {
    human: number,
    ai: number
  },
  winner: "human" | "ai",
  createdAt: timestamp,
  finishedAt: timestamp,
  // rounds データは games/{gameId}/rounds サブコレクションを参照
}
```

#### Firebase Storage（画像保存）

**ディレクトリ構造:**
```
/sketches/
  /{gameId}/
    /round_1_1643123456789.png
    /round_2_1643123789012.png
    /round_3_1643124012345.png
    ...
```

**命名規則:**
- `round_{roundNumber}_{timestamp}.png`
- または単に `{roundId}.png`

**アクセス制御:**
- Firebase Storage Rules で認証済みユーザーのみ読み書き可能
- ダウンロード URL にトークンが含まれ、セキュアにアクセス

**画像形式:**
- PNG形式（透過背景対応）
- Canvas から `canvas.toBlob('image/png')` で生成

#### 将来追加: リアルタイムモード用

**Firebase Realtime Database**（リアルタイム描画同期用）
```json
/liveGames/{gameId}/strokes
{
  "stroke_1": {
    "points": [[x1,y1], [x2,y2], ...],
    "color": "#000000",
    "thickness": 3,
    "timestamp": 1234567890
  }
}
```

## 並列開発開始前の固定事項（Phase1）

### 1. 画面I/O契約（固定）

| 画面 | 主な入力 | 主な出力/更新 | 次の遷移（通常フロー） |
|------|----------|---------------|------------------------|
| UserHome (`/`) | `users/{userId}`, `teams` の一覧 | ニックネーム更新、ログアウト（簡易セッション削除） | TeamHome / QuickSignUp / CreateTeam |
| TeamHome (`/team/:teamId`) | `teams/{teamId}`, 未完了ゲーム概要 | なし（表示中心） | DistanceMode / RealtimeMode |
| DistanceMode (`/team/:teamId/distance`) | `topics`（候補5件） | `games/{gameId}` 新規作成（topic, drawer, inviteCode） | DrawingScreen |
| DrawingScreen (`/game/:gameId/draw`) | `games/{gameId}`（topic 等） | `sketchUrl` 保存、`status` 更新 | WaitingScreen（90秒経過で自動遷移） |
| WaitingScreen (`/game/:gameId/wait`) | `games/{gameId}`（participants, answers） | 共有URLコピー（`/challenge/:inviteCode`） | ResultScreen（最終遷移） |
| ChallengeConfirm (`/challenge/:inviteCode`) | `inviteCode`, ニックネーム状態 | 未登録なら QuickSignUp へリダイレクト | AnswerScreen |
| AnswerScreen (`/game/:gameId/answer`) | `games/{gameId}`（sketch） | `answers.{userId}` 保存、回答済み更新 | ResultScreen（結果待機後） |
| ResultScreen (`/game/:gameId/result`) | `games/{gameId}`（回答/AI判定） | 勝敗・確証度表示 | TeamHome / History |

### 2. データ契約（最小スキーマ固定）

- `users/{userId}`
  - `nickname: string`
  - `teams: string[]`
  - `isAdmin: boolean`
- `teams/{teamId}`
  - `name: string`
  - `members.{userId}.nickname: string`
  - `stats.totalGames / humanWins / aiWins: number`
- `games/{gameId}`
  - `teamId: string`
  - `mode: "distance"`
  - `status: "waiting" | "playing" | "finished"`
  - `topicId: string`, `topic: string`
  - `drawer: userId`
  - `inviteCode: string`
  - `sketchUrl: string | null`
  - `participants.{userId}.hasAnswered: boolean`
  - `answers.{userId}.answer: string`
  - `aiGuess.answer / confidence / isCorrect`
  - `winner: "human" | "ai" | null`
- `topics/{topicId}`
  - `text: string`
  - `isActive: boolean`

### 3. 共通基盤（A: Repository + Usecase）

#### 3.1 レイヤー構成（固定）

`UI -> Usecase -> Repository -> Firebase SDK`

- UI（各画面）は Usecase のみ呼び出す。
- Usecase は業務ロジックと画面遷移判断を担当する。
- Repository は Firestore/Storage/Functions へのアクセスのみ担当する。
- UI から Firebase SDK を直接呼び出す実装は禁止（検証用コードを除く）。

#### 3.2 ディレクトリ方針（固定）

- `src/lib/firebase/client.js`
  - Firebase App / Firestore / Storage / Functions の初期化を一元管理。
- `src/lib/repos/`
  - `usersRepo.js`, `teamsRepo.js`, `gamesRepo.js`, `topicsRepo.js`
- `src/lib/usecases/`
  - `startDistanceGame.js`, `completeDrawing.js`, `openChallenge.js`, `submitAnswer.js`
- `src/lib/session.js`
  - ニックネーム（簡易ログイン状態）の取得/保存/削除。

#### 3.3 返却型ルール（固定）

Usecase と Repository は次の形式で返す。

```ts
type AppResult<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: string; message: string };
```

- 例外は原則 `AppResult` に変換して UI に返す。
- UI は `ok` のみで分岐し、失敗時は `message` を表示する。

#### 3.3a errorCode ルール（固定）

- `VALIDATION_ERROR`: 入力不正（必須不足、形式不正）
- `UNAUTHENTICATED`: ニックネーム未登録・セッションなし
- `NOT_FOUND`: 対象ドキュメントなし
- `PERMISSION_DENIED`: 権限不足
- `CONFLICT`: 競合（既に回答済みなど）
- `NETWORK_ERROR`: 通信失敗
- `INTERNAL_ERROR`: 想定外エラー

#### 3.3b Interface（固定）

```ts
// 共通
type AppResult<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: string; message: string };

// Repository
interface TopicsRepo {
  listActiveTopics(limit: number): Promise<AppResult<Array<{ id: string; text: string }>>>;
}

interface GamesRepo {
  createDistanceGame(input: {
    teamId: string;
    drawerUserId: string;
    topicId: string;
    topic: string;
    inviteCode: string;
  }): Promise<AppResult<{ gameId: string }>>;

  updateDrawingResult(input: {
    gameId: string;
    sketchUrl: string;
    sketchUploadedAt: number;
  }): Promise<AppResult<null>>;

  submitAnswer(input: {
    gameId: string;
    userId: string;
    answer: string;
    submittedAt: number;
  }): Promise<AppResult<null>>;

  findGameIdByInviteCode(inviteCode: string): Promise<AppResult<{ gameId: string; teamId: string }>>;
}

// Usecase
interface StartDistanceGameUsecase {
  execute(input: { teamId: string; drawerUserId: string }): Promise<AppResult<{ gameId: string }>>;
}

interface CompleteDrawingUsecase {
  execute(input: { gameId: string; sketchUrl: string }): Promise<AppResult<null>>;
}

interface OpenChallengeUsecase {
  execute(input: {
    inviteCode: string;
    nickname: string | null;
    currentPath: string;
  }): Promise<
    AppResult<
      | { action: 'redirect_signup'; redirectTo: string }
      | { action: 'open_answer'; gameId: string }
    >
  >;
}

interface SubmitAnswerUsecase {
  execute(input: {
    gameId: string;
    userId: string;
    answer: string;
  }): Promise<AppResult<null>>;
}
```

補足:
- `OpenChallengeUsecase` は画面遷移判定を返すだけで、Router を直接操作しない。
- UI は返却された `action` を見て `navigate` する。

#### 3.4 初期実装対象（固定）

- `topicsRepo.listActiveTopics()` + `startDistanceGame`
- `gamesRepo.updateDrawingResult()` + `completeDrawing`
- `gamesRepo.submitAnswer()` + `submitAnswer`
- `openChallenge`（未登録時 QuickSignUp へ遷移し、完了後に復帰）

#### 3.5 実装順（固定）

1. `firebase/client.js`（Emulator切替含む）
2. Repository 雛形（users/teams/games/topics）
3. Usecase 雛形（startDistanceGame/completeDrawing/openChallenge/submitAnswer）
4. UI を Usecase 呼び出しへ差し替え

#### 3.6 現在の進捗（2026-02-07）

- 画面遷移の骨組みは実装済み（主要ルート遷移とプレースホルダー表示）。
- QuickSignUp -> ChallengeConfirm 復帰フロー（未登録時リダイレクト）は実装済み。
- UserHome の名前変更とログアウト（簡易セッション更新/削除）は実装済み。
- 共通基盤A（Repository + Usecase）の仕様固定は完了。
- `firebase emulators:start` の起動確認は完了。
- 実装済み共通基盤（雛形）:
  - `firebase/client`（初期化 + Emulator切替）
  - `topicsRepo + startDistanceGame`
  - `gamesRepo + completeDrawing`
  - `gamesRepo + submitAnswer`
- 備考: この実行環境ではネットワーク制限により `npm install firebase` は未実行。依存導入はローカル端末で実施。

### 4. 画面ごとの完了条件（Done Definition）

- UserHome: 名前変更、ログアウト、チーム一覧表示、主要導線遷移が動作。
- TeamHome: 統計/未完了出題の表示枠と DistanceMode/RealtimeMode 遷移が動作。
- DistanceMode: お題5件提示、1件選択、次画面遷移が動作。
- DrawingScreen: 画面表示時に90秒開始、90秒で自動遷移、保存処理呼び出しが動作。
- WaitingScreen: 回答状況表示、`/challenge/:inviteCode` の共有URLコピーが動作。
- ChallengeConfirm: 未登録時QuickSignUpへ遷移、登録後に復帰し `[開く]` で進める。
- AnswerScreen: 回答入力/送信、回答済み反映、結果待機導線が動作。
- ResultScreen: 回答一覧、AI推測、勝敗・確証度の表示が動作。

### 5. 統合ルール（並列開発用）

#### 5.1 接続の原則

- 画面は Repository を直接呼ばず、必ず Usecase 経由で接続する。
- 画面間の受け渡しは「ルートパラメータ + FirestoreドキュメントID」に統一する。
- 画面実装完了時は、必ず前後画面との遷移を実機で確認する。

#### 5.2 仕様凍結と変更管理

- I/O契約・データ契約・Interface は本節を正とする。
- 変更が必要な場合は、実装より先に `doc/requirements.md` を更新してから着手する。
- 変更時は `doc/progress.md` の該当Phase説明にも反映する。

#### 5.3 統合時の受け入れ条件（必須）

- 型/ビルドエラーがないこと（`npm run build` 成功）。
- 返却型が `AppResult` に統一されていること。
- 失敗時に `errorCode` と `message` をUIで扱えること。
- エミュレータ環境で最低1回の正常系を確認済みであること。

#### 5.4 競合を避ける実装ルール

- 1PR（または1コミット群）1機能ブロックを原則とする。
- 共通ファイル（`src/lib/firebase/client.js`, `src/lib/result.js`, `doc/requirements.md`）の同時変更は最小化する。
- 画面側は「表示」と「Usecase呼び出し」に責務を限定し、データ変換はUsecase側へ寄せる。

#### 5.5 最低スモークテスト（統合チェック）

- DistanceMode -> DrawingScreen -> WaitingScreen -> ResultScreen の遷移が切れない。
- ChallengeConfirm 未登録導線（QuickSignUpリダイレクト -> 復帰）が切れない。
- submitAnswer 実行後に `participants.{userId}.hasAnswered=true` が反映される。

#### 5.6 環境変数ファイル運用（固定）

- 各トラックはローカル専用で `.env.local` を作成してよい（コミット禁止）。
- 共有すべき環境変数仕様は `.env.example` のみ更新する。
- `.env` / `.env.local` / `.env.*.local` は Git 管理対象外とする（`.gitignore` 準拠）。
- PR 前に `git status --short` で `.env*` が差分に含まれないことを確認する。

### 6. ブランチ戦略（並列開発用）

#### 6.1 基本方針

- `main` は常にデプロイ可能な状態を維持する。
- 開発は `codex/` プレフィックス付きの機能ブランチで行う。
- 1ブランチ = 1機能ブロックを原則とする。

#### 6.2 命名規則

- 形式: `codex/phase1-<番号>-<機能名>`
- 例:
  - `codex/phase1-8-distance-mode`
  - `codex/phase1-10-drawing-screen`
  - `codex/phase1-12-waiting-screen`
  - `codex/phase1-13-answer-screen`

#### 6.3 開発フロー

1. `main` から機能ブランチを作成
2. 実装 + `doc/requirements.md` / `doc/progress.md` を同期更新
3. `npm run build` と最低スモークテストを実施
4. レビュー後に `main` へマージ
5. マージ後に機能ブランチを削除

#### 6.4 競合回避

- 共通基盤改修（`src/lib/firebase/client.js`, `src/lib/result.js`）は専用ブランチで先に取り込む。
- 画面ブロックごとに担当を分け、同一ファイルの同時編集を避ける。
- 仕様変更が発生した場合は先に `doc` 更新を行う。

#### 6.5 PR受け入れ条件

- `AppResult` / `errorCode` ルールに準拠している。
- UI から Firebase SDK を直接呼んでいない。
- `npm run build` が成功する。
- 対象導線の遷移確認が完了している。
- `doc/requirements.md` と `doc/progress.md` が同期されている。

#### 6.6 進捗管理運用（一本線 + 並行トラック）

- `doc/progress.md` の Phase1.x はマスタープラン（一本線）として維持する。
- 並行実行は `Track A/B/C` の3トラックで管理する。
- 各トラックの作業が完了したら、対応する Phase1.x のチェックを更新する。
- つまり「実行管理はトラック」「完了判定はPhase一覧」に統一する。

#### 6.7 GitHub保護運用（main）

- `main` への直接 push を禁止し、PR経由マージを必須とする。
- Branch protection の required status checks を有効化する。
- required checks は `web-build` と `functions-build` を最低要件とする。
- PRに対するCI実行（buildチェック）を必須とする。
- 詳細手順は `doc/github-branch-protection.md` を参照。

## MVP実装範囲

### Phase 1: 基本構造（最優先）
1. プロジェクトセットアップ（Firebase初期化）
2. モード選択画面
3. ディスタンスモード基本UI

### Phase 2: お絵かき機能
1. p5.jsキャンバス実装
2. 描画ツール（ペン、消しゴム、色、太さ）
3. タイマー実装
4. 画像保存とFirebase Storageへのアップロード

### Phase 3: ゲームロジック
1. お題システム（ランダム5つ表示、選択）
2. 回答システム（テキスト入力）
3. Gemini API連携（gemini-2.5-flash）
4. 正誤判定ロジック
5. スコア計算

### Phase 4: マルチプレイヤー対応
1. ルーム作成・招待機能
2. プレイヤー管理
3. ターン管理
4. Firebase Firestoreでの状態同期（onSnapshotリスナー）

### Phase 5: 統計・履歴
1. ゲーム履歴の保存
2. 統計情報の表示
3. 過去のスケッチ閲覧

### Phase 6: チャット機能
1. テキストチャット実装
2. メッセージの同期

## 制約事項

### MVP（ディスタンスモード）
- 同時接続プレイヤー数は最大5人まで
- スケッチの描画時間は90秒固定
- **リアルタイム描画同期はなし**（完成後のみ共有）
- お題は日本語を想定（多言語対応は将来的に）
- Gemini API（gemini-2.5-flash）の利用料金が発生（月20ラウンドで約4円）
- Firebase無料枠（Firestore, Storage, Hosting）を超える可能性あり

### 将来（リアルタイムモード）
- WebSocketサーバーまたはRealtime Databaseの追加が必要
- サーバー運用コストが発生する可能性

## スケジュール
- 特に期限は設定せず、マイペースで開発
- まずはMVPのディスタンスモードを完成させることを目指す

## 参考資料
- p5.js公式ドキュメント: https://p5js.org/
- Firebase公式ドキュメント: https://firebase.google.com/docs
- Google Gemini API: https://ai.google.dev/
- お絵かきゲームの参考: Gartic Phone, Skribbl.io

## その他のメモ
- シンプル・ミニマルなデザインを心がける
- 機能過多にならないよう、MVPに集中する
- 友人グループで楽しく遊べることを最優先にする
