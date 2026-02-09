import { getFirebaseClient } from '../firebase/client.js';
import { err, ok } from '../result.js';

const mapTopic = (docSnap) => ({
  id: docSnap.id,
  text: docSnap.data().text
});

export const createTopicsRepo = () => ({
  async listActiveTopics(limitCount) {
    if (!Number.isInteger(limitCount) || limitCount <= 0) {
      return err('VALIDATION_ERROR', 'limit は1以上の整数で指定してください。');
    }

    const clientResult = await getFirebaseClient();
    if (!clientResult.ok) return clientResult;

    try {
      const { db, firestore } = clientResult.data;
      const topicsRef = firestore.collection(db, 'topics');
      const q = firestore.query(
        topicsRef,
        firestore.where('isActive', '==', true),
        firestore.limit(limitCount)
      );
      const snapshot = await firestore.getDocs(q);
      return ok(snapshot.docs.map(mapTopic));
    } catch (error) {
      return err('INTERNAL_ERROR', 'topics の取得に失敗しました。');
    }
  }
});
