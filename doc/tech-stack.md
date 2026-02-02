# 技術スタック

## 概要

**アーキテクチャ:** CSR（クライアントサイドレンダリング）
**開発方針:** Firebase BaaS + React SPA でサーバーレス構成

---

## フロントエンド

| 技術 | 用途 | 備考 |
|------|------|------|
| **Vite** | ビルドツール | 高速な開発サーバー |
| **React** | UI フレームワーク | SPA構築 |
| **p5.js (instance mode)** | Canvas描画 | お絵かきキャンバス |
| **Tailwind CSS** | スタイリング | ユーティリティファーストCSS |
| **React Router** | ルーティング | ページ遷移 |
| **React Hooks** | 状態管理 | useState, useEffect, useContext |

---

## バックエンド

### MVP（ディスタンスモード）

| サービス | 用途 |
|----------|------|
| **Firebase Firestore** | メインDB（ゲーム状態、履歴、統計、お題、チャット） |
| **Firebase Storage** | スケッチ画像保存 |
| **Firebase Authentication** | 簡易認証 |
| **Firebase Hosting** | 静的サイトホスティング |
| **Firebase Cloud Functions** | Gemini API連携 |

### 将来追加（リアルタイムモード）

| サービス | 用途 |
|----------|------|
| **Firebase Realtime Database** | リアルタイムゲーム状態同期 |
| **WebSocket (Socket.io)** | リアルタイム描画同期（オプション） |

---

## AI API

**採用モデル:** Google Gemini API (gemini-2.5-flash)

| 項目 | 詳細 |
|------|------|
| **用途** | スケッチ認識 + 正誤判定 |
| **料金** | 入力: $0.15/1M tokens、出力: $0.60/1M tokens、画像: $0.0011/image |
| **月間コスト** | 約$0.027（月20ラウンド想定） |
| **呼び出し回数** | 1ラウンドあたり2回（認識1回 + 判定1回） |

---

## 開発ツール

- Git（バージョン管理）
- VS Code
- Firebase CLI
- Node.js / npm

---

## データフロー

```
[Client - React SPA]
  ├── p5.js → Canvas描画
  ├── Tailwind CSS → UI
  └── Firebase SDK
       ├── Firestore → ゲーム状態・履歴
       ├── Storage → スケッチ画像（URL で紐づけ）
       └── Cloud Functions → Gemini API 呼び出し
            └── Google Gemini API → AI判定
```

---

## レスポンシブ対応

| デバイス | 対応 |
|----------|------|
| **iPad（タブレット）** | メイン対応（描画 + 回答） |
| **iPhone** | 回答専用モード |
| **PC** | サブ対応 |

---

## 将来の拡張予定

1. **リアルタイムモード追加**
   - Firebase Realtime Database または WebSocket
   - リアルタイム描画同期

2. **AI モデル切り替え**
   - Gemini 3 Flash（最新）
   - Gemini 2.5 Pro（高精度）
