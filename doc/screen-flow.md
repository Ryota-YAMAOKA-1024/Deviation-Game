# 画面遷移とAPI呼び出しフロー（完全版）

## ルーティング構成

### ユーザー向け画面

```
/                              → UserHome（ユーザのホーム：チーム一覧 + 個人Inbox）
/quick-signup                  → QuickSignUp（簡易登録）
/create-team                   → CreateTeam（新しいチーム作成）
/team/:teamId                  → TeamHome（チームのホーム：統計・未完了出題・モード選択）
/team/:teamId/distance         → DistanceMode（ディスタンスモード：お題選択画面）
/team/:teamId/realtime         → RealtimeMode（リアルタイムモード画面：今回はプレースホルダーのみ）
/game/:gameId/draw             → DrawingScreen（描画画面）
/game/:gameId/wait             → WaitingScreen（回答待機画面 + 招待リンク共有）
/challenge/:inviteCode         → ChallengeConfirm（出題受け取り確認画面）
/game/:gameId/answer           → AnswerScreen（回答画面）
/game/:gameId/result           → ResultScreen（結果画面）
/history                       → History（完了済みゲーム履歴）
```

### 管理者画面

```
/admin                         → AdminDashboard（管理ダッシュボード）
/admin/teams                   → AdminTeams（チーム管理）
/admin/games                   → AdminGames（ゲーム管理）
/admin/users                   → AdminUsers（ユーザー管理）
/admin/content                 → AdminContent（コンテンツ管理）
```

### 遷移導線に関する補足

- 開発中のプレースホルダーUIにある「左サイドの全画面直接遷移ナビ」は検証専用の導線。
- 最終版（MVPリリース版）では当該サイドナビを削除し、各画面は実際のユーザーフローに沿った導線のみを表示する。

---

## データモデル

### teams コレクション

```javascript
/teams/{teamId}
{
  name: string,                    // チーム名（変更可能、メンバー全員）
  createdBy: userId,
  createdAt: timestamp,

  // メンバー
  members: {
    [userId]: {
      nickname: string,
      joinedAt: timestamp,
      role: "member" | "admin",    // 将来的に

      // このチームでの統計
      correctAnswers: number,
      totalAnswers: number,
      correctRate: number           // %
    }
  },

  // チーム統計
  stats: {
    totalGames: number,
    humanWins: number,
    aiWins: number,
    winRate: number                 // 人間の勝率 %
  },

  lastPlayedAt: timestamp
}
```

### games コレクション

```javascript
/games/{gameId}
{
  teamId: string,
  mode: "distance",
  status: "waiting" | "playing" | "finished",

  // 出題者（描く人）
  createdBy: userId,
  drawer: userId,                   // createdBy と同じ
  createdAt: timestamp,

  // お題
  topic: string,
  topicId: string,

  // 招待コード
  inviteCode: string,

  // スケッチ
  sketchUrl: string | null,
  sketchUploadedAt: timestamp | null,

  // 参加者（回答者）
  participants: {
    [userId]: {
      nickname: string,
      joinedAt: timestamp,
      viewedSketchAt: timestamp | null,    // スケッチを見た時刻
      hasAnswered: boolean
    }
  },

  // 回答
  answers: {
    [userId]: {
      answer: string,
      submittedAt: timestamp,
      isCorrect: boolean | null,
      responseTime: number               // 秒
    }
  },

  // AI判定
  aiGuess: {
    answer: string,
    confidence: number,
    isCorrect: boolean | null,
    judgedAt: timestamp
  },

  // 結果
  winner: "human" | "ai" | null,
  finishedAt: timestamp | null
}
```

### users コレクション

```javascript
/users/{userId}
{
  nickname: string,
  createdAt: timestamp,

  // 所属チーム
  teams: [teamId],

  // 全体統計
  totalGamesPlayed: number,
  totalCorrectAnswers: number,

  // 管理者フラグ
  isAdmin: boolean                   // デフォルト false
}
```

---

## 画面遷移フロー（ディスタンスモード）

### 【出題者の流れ】

**概要:** ユーザホーム → チーム選択 → チームホーム → モード選択 → お題選択 → 描画 → 招待リンク共有

```
┌─────────────────────────────────────────────────────┐
│ 1. UserHome (/) - ユーザのホーム                    │
│                                                     │
│    自分が所属するチームの一覧を表示                 │
│                                                     │
│    📥 個人Inbox（自分への未回答の出題）            │
│                                                     │
│    ┌─────────────────────────────────────┐         │
│    │ チームA        🎮 15回  🏆 60%      │  ←選択  │
│    └─────────────────────────────────────┘         │
│    ┌─────────────────────────────────────┐         │
│    │ チームB        🎮 8回   🏆 50%      │         │
│    └─────────────────────────────────────┘         │
│                                                     │
│    [+ 新しいチームを作成]                           │
└──────────────────┬──────────────────────────────────┘
                   ↓
          チームを選択（チームAをタップ）
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. TeamHome (/team/:teamId) - チームのホーム        │
│                                                     │
│    チーム名: チームA                                │
│    統計: 15ゲーム / 勝率60%                         │
│    メンバー: 田中、佐藤、鈴木...                    │
│                                                     │
│    📋 進行中の出題（未完了）                        │
│    📚 完了済み履歴（最新10件）                      │
│                                                     │
│    ─── モード選択 ───                              │
│    ┌─────────────────────────────────────┐         │
│    │      ディスタンスモード              │  ←選択  │
│    └─────────────────────────────────────┘         │
│    ┌─────────────────────────────────────┐         │
│    │   リアルタイムモード                │  ←遷移可 │
│    └─────────────────────────────────────┘         │
└──────────────────┬──────────────────────────────────┘

※ 補足: TeamHome から `/team/:teamId/realtime` への遷移は可能だが、RealtimeMode は今回の実装範囲外のためプレースホルダー表示のみとする。

                   ↓
      [ディスタンスモード]を選択
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. DistanceMode (/team/:teamId/distance)            │
│    - お題選択画面                                   │
│                                                     │
│    お題を選んでください:                            │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│    │  犬      │  │  猫      │  │  車      │        │
│    └─────────┘  └─────────┘  └─────────┘        │
│    ┌─────────┐  ┌─────────┐                      │
│    │  花      │  │  家      │                      │
│    └─────────┘  └─────────┘                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
          お題を選択（例：「犬」）
                   ↓
          ゲーム作成（招待コード生成）
                   ↓
          すぐに描画画面へ遷移
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. DrawingScreen (/game/:gameId/draw)               │
│    - p5.js Canvas                                   │
│    - 90秒タイマー（画面表示時に開始）               │
│    - 描画ツール                                     │
│    - [完成]ボタン                                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
        描画完成 or 90秒経過（90秒時は自動で次へ）
                   ↓
    📤 Canvas → Blob 変換
    📤 Firebase Storage アップロード
    📤 Firestore に sketchUrl 保存
    📡 Cloud Functions → Gemini API #1（スケッチ認識）
    📥 AI推測を Firestore 保存
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. WaitingScreen (/game/:gameId/wait)               │
│    - 📤 招待リンク表示・共有（スケッチ完成後）      │
│      https://deviation.app/challenge/abc123         │
│      [コピー] [LINE] [メール]                       │
│    - 共有URLのコピー機能                            │
│                                                     │
│    - 回答状況をリアルタイム表示                     │
│                                                     │
│    ✅ 佐藤（回答済み）3.2秒                         │
│    ✅ 鈴木（回答済み）5.8秒                         │
│    ⏳ 山田（未回答）                                 │
│    ⏳ 加藤（未回答）                                 │
│                                                     │
│    [このまま結果を見る]ボタン ← 出題者が決定       │
│                                                     │
│    💬 [Post-MVP] チャット機能予定                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
    [結果を見る]押下 or 全員回答完了
                   ↓
    📡 Cloud Functions → Gemini API #2（正誤判定）
    📥 判定結果を Firestore 保存
                   ↓
┌─────────────────────────────────────────────────────┐
│ 6. ResultScreen (/game/:gameId/result)              │
│    - スケッチ表示                                   │
│    - お題表示                                       │
│    - 全回答と正誤                                   │
│    - AIの推測と確証度                               │
│    - 勝敗結果                                       │
│    - [ホームに戻る]                                 │
└─────────────────────────────────────────────────────┘
```

### 【回答者の流れ】

**概要:** 招待リンク受信 → 確認画面（開く？）→ 60秒タイマー開始 → 回答 → 結果

```
┌─────────────────────────────────────────────────────┐
│ 招待リンク受信（スケッチ付き）                      │
│ https://deviation.app/challenge/abc123              │
└──────────────────┬──────────────────────────────────┘
                   ↓
          リンクをクリック
                   ↓
          認証状態チェック
                   ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    【未認証】            【認証済み】
         ↓                   ↓
  QuickSignUp          ChallengeConfirm
  (ニックネーム入力)
         ↓
  ChallengeConfirm
                   ↓
┌─────────────────────────────────────────────────────┐
│ 1. ChallengeConfirm (/challenge/:inviteCode)        │
│                                                     │
│    🎨                                               │
│    田中さんから出題です。開きますか？               │
│                                                     │
│    ⚠️ 開くと60秒のタイマーが開始します              │
│                                                     │
│    [開く]                                           │
└──────────────────┬──────────────────────────────────┘
                   ↓
          [開く]ボタン押下
                   ↓
      ゲーム参加処理（participants に追加）
      チームに自動追加（teams/{teamId}/members）
      viewedSketchAt を記録
      60秒タイマー開始
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. AnswerScreen (/game/:gameId/answer)              │
│                                                     │
│    [スケッチ表示]                                   │
│                                                     │
│    残り時間: 58秒                                   │
│                                                     │
│    回答を入力:                                      │
│    ┌─────────────────────┐                         │
│    │                         │                     │
│    └─────────────────────┘                         │
│                                                     │
│    [回答する]                                       │
└──────────────────┬──────────────────────────────────┘
                   ↓
    回答送信 or 60秒経過
                   ↓
    📤 Firestore に回答保存
                   ↓
    出題者の WaitingScreen に反映
                   ↓
    結果発表を待つ...
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. ResultScreen (/game/:gameId/result)              │
│    - 全員の結果表示                                 │
└─────────────────────────────────────────────────────┘
```

---

## API呼び出しタイミング

### 📡 API #1: スケッチ認識（Gemini API）

**タイミング:** 出題者が描画完成ボタンを押した直後、または90秒経過時

**処理フロー:**

```javascript
// DrawingScreen.jsx
const handleComplete = async () => {
  try {
    setIsUploading(true);

    // 1. Canvas → Blob
    const blob = await canvasToBlob(p5Instance);

    // 2. Firebase Storage アップロード
    const storageRef = ref(storage, `sketches/${gameId}/${Date.now()}.png`);
    await uploadBytes(storageRef, blob);
    const sketchUrl = await getDownloadURL(storageRef);

    // 3. Firestore 更新
    await updateDoc(doc(db, `games/${gameId}`), {
      sketchUrl: sketchUrl,
      sketchUploadedAt: serverTimestamp(),
      status: 'playing'
    });

    // 4. Cloud Functions → Gemini API
    const recognizeSketch = httpsCallable(functions, 'recognizeSketch');
    const result = await recognizeSketch({
      gameId: gameId,
      sketchUrl: sketchUrl,
      topic: topic
    });

    // 5. AI推測保存
    await updateDoc(doc(db, `games/${gameId}`), {
      aiGuess: {
        answer: result.data.guess,
        confidence: result.data.confidence,
        isCorrect: null,
        judgedAt: serverTimestamp()
      }
    });

    // 6. 回答待機画面へ
    navigate(`/game/${gameId}/wait`);

  } catch (error) {
    console.error('アップロードエラー:', error);
    alert('スケッチの送信に失敗しました');
  } finally {
    setIsUploading(false);
  }
};
```

**Cloud Function:**

```javascript
// functions/src/index.ts
export const recognizeSketch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
  }

  const { gameId, sketchUrl } = data;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 画像をBase64で取得
    const imageBase64 = await fetchImageAsBase64(sketchUrl);

    const prompt = `
この絵は何を描いていますか？
以下のJSON形式で回答してください：
{
  "guess": "あなたの推測",
  "confidence": 0-100の数値（確信度）
}
    `.trim();

    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: imageBase64 } }
        ]
      }]
    });

    const response = JSON.parse(result.response.text());
    return response;

  } catch (error) {
    console.error('Gemini API エラー:', error);
    throw new functions.https.HttpsError('internal', 'AI判定失敗');
  }
});
```

---

### 📡 API #2: 正誤判定（Gemini API）

**タイミング:** 出題者が「結果を見る」ボタンを押したとき

**処理フロー:**

```javascript
// WaitingScreen.jsx
const handleShowResult = async () => {
  try {
    setIsJudging(true);

    // 判定実行
    const judgeAnswers = httpsCallable(functions, 'judgeAnswers');
    const result = await judgeAnswers({
      gameId: gameId,
      topic: topic,
      aiGuess: aiGuess.answer,
      answers: answers
    });

    // 判定結果を保存
    const batch = writeBatch(db);

    // 各回答の正誤を更新
    Object.entries(result.data.players).forEach(([userId, isCorrect]) => {
      batch.update(doc(db, `games/${gameId}`), {
        [`answers.${userId}.isCorrect`]: isCorrect
      });
    });

    // AIの正誤を更新
    batch.update(doc(db, `games/${gameId}`), {
      'aiGuess.isCorrect': result.data.ai
    });

    // 勝者を決定
    const humanWon = result.data.ai === false &&
                     Object.values(result.data.players).some(correct => correct === true);

    batch.update(doc(db, `games/${gameId}`), {
      winner: humanWon ? 'human' : 'ai',
      status: 'finished',
      finishedAt: serverTimestamp()
    });

    await batch.commit();

    // チーム統計を更新
    await updateTeamStats(teamId, humanWon, answers, result.data.players);

    // 結果画面へ
    navigate(`/game/${gameId}/result`);

  } catch (error) {
    console.error('判定エラー:', error);
    alert('判定に失敗しました');
  } finally {
    setIsJudging(false);
  }
};
```

**Cloud Function:**

```javascript
// functions/src/index.ts
export const judgeAnswers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
  }

  const { gameId, topic, aiGuess, answers } = data;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // プロンプト生成
    const answersList = Object.entries(answers)
      .map(([userId, data]: [string, any]) => `${userId}: ${data.answer}`)
      .join('\n');

    const prompt = `
お題は「${topic}」です。
以下の回答が、お題と意味的に一致するか判定してください。
表記ゆれ（ひらがな/カタカナ、送り仮名など）は正解としてください。

回答:
AI: ${aiGuess}
${answersList}

以下のJSON形式で回答してください：
{
  "ai": true/false,
  "players": {
    "userId1": true/false,
    "userId2": true/false,
    ...
  }
}
    `.trim();

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const response = JSON.parse(result.response.text());
    return response;

  } catch (error) {
    console.error('Gemini API エラー:', error);
    throw new functions.https.HttpsError('internal', '正誤判定失敗');
  }
});
```

---

## Firestore リアルタイムリスナー

### WaitingScreen（回答状況監視）

```javascript
// WaitingScreen.jsx
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, `games/${gameId}`),
    (docSnap) => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();

      // 回答状況を更新
      setAnswers(data.answers || {});
      setParticipants(data.participants || {});

      // 全員回答完了チェック（自動判定はしない、出題者が決定）
      const totalParticipants = Object.keys(data.participants).length;
      const answeredCount = Object.keys(data.answers).length;

      setCanShowResult(answeredCount > 0); // 1人でも回答したら表示可能
    }
  );

  return () => unsubscribe();
}, [gameId]);
```

### AnswerScreen（タイマー管理）

```javascript
// AnswerScreen.jsx
useEffect(() => {
  const startTime = Date.now();
  const timeLimit = 60 * 1000; // 60秒

  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);

    setRemainingTime(Math.ceil(remaining / 1000));

    if (remaining <= 0) {
      // タイムアウト → 未回答扱い
      clearInterval(timer);
      handleTimeout();
    }
  }, 100);

  return () => clearInterval(timer);
}, []);

const handleTimeout = () => {
  alert('時間切れです');
  navigate(`/team/${teamId}`); // チーム画面に戻る
};
```

---

## 管理者画面

### ルーティング

```
/admin                         → AdminDashboard
/admin/teams                   → AdminTeams
/admin/teams/:teamId           → AdminTeamDetail
/admin/games                   → AdminGames
/admin/games/:gameId           → AdminGameDetail
/admin/users                   → AdminUsers
/admin/content                 → AdminContent
```

### 管理者権限チェック

```javascript
// AdminRoute.jsx
function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }

    const userDoc = await getDoc(doc(db, `users/${user.uid}`));
    const userData = userDoc.data();

    if (!userData?.isAdmin) {
      alert('管理者権限がありません');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  return isAdmin ? children : null;
}
```

### 管理者機能

#### 1. チーム削除

```javascript
const deleteTeam = async (teamId) => {
  if (!confirm('このチームを削除しますか？')) return;

  try {
    // チームに紐づくゲームも削除
    const gamesQuery = query(collection(db, 'games'), where('teamId', '==', teamId));
    const gamesSnapshot = await getDocs(gamesQuery);

    const batch = writeBatch(db);

    gamesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.delete(doc(db, `teams/${teamId}`));

    await batch.commit();

    alert('チームを削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};
```

#### 2. メンバー削除

```javascript
const removeMember = async (teamId, userId) => {
  if (!confirm('このメンバーを削除しますか？')) return;

  try {
    await updateDoc(doc(db, `teams/${teamId}`), {
      [`members.${userId}`]: deleteField()
    });

    alert('メンバーを削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};
```

#### 3. ゲーム削除

```javascript
const deleteGame = async (gameId) => {
  if (!confirm('このゲームを削除しますか？')) return;

  try {
    await deleteDoc(doc(db, `games/${gameId}`));
    alert('ゲームを削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};
```

#### 4. 不適切なスケッチ削除

```javascript
const deleteSketch = async (gameId, sketchUrl) => {
  if (!confirm('このスケッチを削除しますか？')) return;

  try {
    // Storage から削除
    const storageRef = ref(storage, sketchUrl);
    await deleteObject(storageRef);

    // Firestore から URL を削除
    await updateDoc(doc(db, `games/${gameId}`), {
      sketchUrl: deleteField()
    });

    alert('スケッチを削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};
```

---

## 重要な仕様まとめ

### ⏱️ 時間制限
- **描画:** 90秒
- **回答:** 60秒（スケッチを見た瞬間から）

### 👥 人数制限
- **制限なし**（何人でも参加可能）

### 🎯 回答打ち切り
- **出題者が決定**
- 1人でも回答したら結果表示可能
- 全員の回答を待たなくてもOK

### ⏰ タイムアウト処理
- **タイマー開始:** 招待リンクを開いて「開く」ボタンを押した瞬間
- **60秒経過:** 未回答扱い（統計から除外）
- ペナルティなし

### 🔗 招待リンク
- **生成タイミング:** 描画完成後（WaitingScreen で表示）
- **URL の役割:** スケッチとともに出題するためだけに使用
- **必須条件:** URLには必ずスケッチが付属している
- URLを送ることで相手を出題者にすることはできない
- **有効期限:** なし
- **再利用:** 可能（同じスケッチに複数人が回答可能）

### 👑 チーム名
- **変更可能:** メンバー全員

### 📝 履歴保存のタイミング
- **勝敗が決したとき**のみ履歴に保存
- status が "finished" になった時点で記録
- 途中のゲーム（waiting/playing）は履歴に表示されない

### 📥 個人Inbox
- ユーザホーム画面で表示
- 自分が participants に含まれているゲーム
- まだ自分が回答していないゲーム（answers に自分の userId がない）
- status が "playing" のゲームのみ

### 📋 チームの未完了出題
- チームホームページで表示
- そのチームの teamId を持つゲーム
- status が "waiting" または "playing" のゲーム

### 🛡️ 管理者権限
- チーム削除
- メンバー削除
- ゲーム削除
- ラウンド削除
- スケッチ削除
- ユーザーBAN

---

## 統計計算ロジック

### チーム統計

```javascript
// チーム勝率の計算
const updateTeamStats = async (teamId, humanWon) => {
  const teamDoc = await getDoc(doc(db, `teams/${teamId}`));
  const team = teamDoc.data();

  const newStats = {
    totalGames: team.stats.totalGames + 1,
    humanWins: humanWon ? team.stats.humanWins + 1 : team.stats.humanWins,
    aiWins: humanWon ? team.stats.aiWins : team.stats.aiWins + 1
  };

  newStats.winRate = Math.round((newStats.humanWins / newStats.totalGames) * 100);

  await updateDoc(doc(db, `teams/${teamId}`), {
    stats: newStats,
    lastPlayedAt: serverTimestamp()
  });
};
```

### メンバー統計

```javascript
// メンバー正答率の更新
const updateMemberStats = async (teamId, userId, isCorrect) => {
  const teamDoc = await getDoc(doc(db, `teams/${teamId}`));
  const member = teamDoc.data().members[userId];

  const newCorrectAnswers = isCorrect ? member.correctAnswers + 1 : member.correctAnswers;
  const newTotalAnswers = member.totalAnswers + 1;
  const newCorrectRate = Math.round((newCorrectAnswers / newTotalAnswers) * 100);

  await updateDoc(doc(db, `teams/${teamId}`), {
    [`members.${userId}.correctAnswers`]: newCorrectAnswers,
    [`members.${userId}.totalAnswers`]: newTotalAnswers,
    [`members.${userId}.correctRate`]: newCorrectRate
  });
};
```

---

## エラーハンドリング

### 1. API呼び出し失敗

```javascript
try {
  const result = await callGemini();
} catch (error) {
  if (error.code === 'unauthenticated') {
    alert('ログインしてください');
    navigate('/quick-signup');
  } else if (error.code === 'permission-denied') {
    alert('権限がありません');
  } else {
    alert('エラーが発生しました。もう一度お試しください。');
    console.error(error);
  }
}
```

### 2. ネットワークエラー

```javascript
const [isOffline, setIsOffline] = useState(false);

useEffect(() => {
  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

{isOffline && (
  <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
    オフラインです。インターネット接続を確認してください。
  </div>
)}
```

### 3. タイムアウト処理

```javascript
// Cloud Functions でタイムアウト設定
export const recognizeSketch = functions
  .runWith({ timeoutSeconds: 60 }) // 60秒でタイムアウト
  .https.onCall(async (data, context) => {
    // ...
  });
```

---

## Post-MVP 機能: 回答待機画面でのチャット

### 概要
回答待機画面（WaitingScreen）でプレイヤー同士がリアルタイムでチャットできる機能を追加します。

### データモデル

**サブコレクション: games/{gameId}/waitingChat**

```javascript
/games/{gameId}/waitingChat/{messageId}
{
  userId: string,
  nickname: string,
  message: string,
  createdAt: timestamp,
  type: "text" | "emoji"  // 将来的に絵文字対応
}
```

### セキュリティルール（Firestore Rules）

```
match /games/{gameId}/waitingChat/{messageId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.message is string
    && request.resource.data.message.size() <= 200;
  allow delete: if false; // メッセージ削除は管理者のみ
}
```

### 将来の拡張案

1. **絵文字・スタンプ機能**
   - カスタム絵文字セット
   - クイックリアクション

2. **メッセージ削除**
   - 管理者による不適切なメッセージの削除
   - 自分のメッセージの削除（送信後5分以内）

3. **通知機能**
   - 新しいメッセージの通知
   - サウンド・バイブレーション
