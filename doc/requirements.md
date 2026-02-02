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

#### 1. モード選択画面
- リアルタイムモードとディスタンスモードの選択ページ
- リアルタイムモードは「準備中」表示

#### 2. お絵かき機能
- p5.jsを使用したキャンバス描画
- 90秒のタイマー
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
  - 固定のプリセットお題リスト
  - プレイヤーによるお題の追加機能

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
- ニックネーム登録（自由入力）
- 招待制のゲームルーム作成
- ルーム招待リンクの生成と共有

#### 8. テキストチャット
- ゲーム中のテキストチャット機能
- 回答とは別のコミュニケーション用

#### 9. ゲーム進行管理
- ラウンド数: 無制限（プレイヤーが終了を選択するまで）
- 描く人の順番管理
- 次のラウンドへの移行

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
