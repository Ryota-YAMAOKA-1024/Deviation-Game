import { getFirebaseClient } from '../firebase/client.js';
import { err, ok } from '../result.js';

const nowOrServerTimestamp = (firestore, unixMs) =>
  Number.isFinite(unixMs) ? unixMs : firestore.serverTimestamp();

export const createGamesRepo = () => ({
  async createDistanceGame(input) {
    const { teamId, drawerUserId, topicId, topic, inviteCode } = input || {};
    if (!teamId || !drawerUserId || !topicId || !topic || !inviteCode) {
      return err('VALIDATION_ERROR', 'createDistanceGame の入力が不足しています。');
    }

    const clientResult = await getFirebaseClient();
    if (!clientResult.ok) return clientResult;

    try {
      const { db, firestore } = clientResult.data;
      const gamesRef = firestore.collection(db, 'games');
      const created = await firestore.addDoc(gamesRef, {
        teamId,
        mode: 'distance',
        status: 'waiting',
        topicId,
        topic,
        drawer: drawerUserId,
        inviteCode,
        sketchUrl: null,
        participants: {},
        answers: {},
        winner: null,
        createdAt: firestore.serverTimestamp()
      });
      return ok({ gameId: created.id });
    } catch (error) {
      return err('INTERNAL_ERROR', 'games の作成に失敗しました。');
    }
  },

  async updateDrawingResult(input) {
    const { gameId, sketchUrl, sketchUploadedAt } = input || {};
    if (!gameId || typeof sketchUrl !== 'string' || !sketchUrl.trim()) {
      return err('VALIDATION_ERROR', 'updateDrawingResult の入力が不足しています。');
    }

    const clientResult = await getFirebaseClient();
    if (!clientResult.ok) return clientResult;

    try {
      const { db, firestore } = clientResult.data;
      const gameRef = firestore.doc(db, `games/${gameId}`);
      await firestore.updateDoc(gameRef, {
        sketchUrl: sketchUrl.trim(),
        sketchUploadedAt: nowOrServerTimestamp(firestore, sketchUploadedAt),
        status: 'playing'
      });
      return ok(null);
    } catch (error) {
      return err('INTERNAL_ERROR', '描画結果の保存に失敗しました。');
    }
  },

  async submitAnswer(input) {
    const { gameId, userId, answer, submittedAt } = input || {};
    if (!gameId || !userId || !answer?.trim()) {
      return err('VALIDATION_ERROR', 'submitAnswer の入力が不足しています。');
    }

    const clientResult = await getFirebaseClient();
    if (!clientResult.ok) return clientResult;

    try {
      const { db, firestore } = clientResult.data;
      const gameRef = firestore.doc(db, `games/${gameId}`);
      const submittedAtValue = nowOrServerTimestamp(firestore, submittedAt);

      await firestore.updateDoc(gameRef, {
        [`answers.${userId}.answer`]: answer.trim(),
        [`answers.${userId}.submittedAt`]: submittedAtValue,
        [`participants.${userId}.hasAnswered`]: true
      });

      return ok(null);
    } catch (error) {
      return err('INTERNAL_ERROR', '回答の保存に失敗しました。');
    }
  },

  async findGameIdByInviteCode(inviteCode) {
    if (!inviteCode) {
      return err('VALIDATION_ERROR', 'inviteCode が必要です。');
    }

    const clientResult = await getFirebaseClient();
    if (!clientResult.ok) return clientResult;

    try {
      const { db, firestore } = clientResult.data;
      const gamesRef = firestore.collection(db, 'games');
      const q = firestore.query(gamesRef, firestore.where('inviteCode', '==', inviteCode), firestore.limit(1));
      const snapshot = await firestore.getDocs(q);
      if (snapshot.empty) return err('NOT_FOUND', '該当する招待コードが見つかりません。');

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return ok({ gameId: docSnap.id, teamId: data.teamId });
    } catch (error) {
      return err('INTERNAL_ERROR', '招待コードの検索に失敗しました。');
    }
  }
});
