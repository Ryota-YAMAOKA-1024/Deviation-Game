import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { initializeApp } from 'firebase/app';
import { collection, connectFirestoreEmulator, doc, getFirestore, writeBatch } from 'firebase/firestore';

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) return;

  const raw = readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

const projectRoot = resolve(process.cwd());
loadEnvFile(resolve(projectRoot, '.env'));
loadEnvFile(resolve(projectRoot, '.env.local'));

const loadDefaultProjectId = () => {
  const filePath = resolve(projectRoot, '.firebaserc');
  if (!existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    return parsed?.projects?.default || null;
  } catch (error) {
    return null;
  }
};

const toBool = (value, fallback = false) => {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
};

const emulatorEnabled = toBool(process.env.VITE_USE_FIREBASE_EMULATOR, true);
const defaultProjectId = loadDefaultProjectId() || 'deviation-game';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (emulatorEnabled) {
  firebaseConfig.apiKey ||= 'dummy-api-key';
  firebaseConfig.authDomain ||= 'local-dev.firebaseapp.com';
  firebaseConfig.projectId ||= defaultProjectId;
  firebaseConfig.storageBucket ||= `${firebaseConfig.projectId}.appspot.com`;
  firebaseConfig.messagingSenderId ||= '000000000000';
  firebaseConfig.appId ||= '1:000000000000:web:localdev';
} else {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingKeys.length > 0) {
    console.error(`Firebase 設定が不足しています: ${missingKeys.join(', ')}`);
    process.exit(1);
  }
}

const topics = [
  'りんご',
  'みかん',
  'バナナ',
  'いちご',
  'ぶどう',
  'もも',
  'なし',
  'すいか',
  'メロン',
  'レモン',
  'トマト',
  'きゅうり',
  'にんじん',
  'たまねぎ',
  'じゃがいも',
  'だいこん',
  'なす',
  'かぼちゃ',
  'キャベツ',
  'ブロッコリー',
  'パン',
  'ごはん',
  'おにぎり',
  'うどん',
  'そば',
  'ラーメン',
  'カレー',
  'ハンバーグ',
  'オムライス',
  'みそしる',
  '牛乳',
  'コーヒー',
  '紅茶',
  'ジュース',
  '水',
  'ケーキ',
  'クッキー',
  'チョコレート',
  'アイス',
  'プリン',
  'えんぴつ',
  'けしごむ',
  'ノート',
  '定規',
  'はさみ',
  'のり',
  'ペン',
  '色えんぴつ',
  'ふでばこ',
  '教科書',
  'つくえ',
  'いす',
  'ソファ',
  'ベッド',
  'まくら',
  'ふとん',
  'カーテン',
  '時計',
  'テレビ',
  '冷蔵庫',
  '電子レンジ',
  '洗濯機',
  '掃除機',
  '扇風機',
  'エアコン',
  'スマホ',
  'ノートパソコン',
  'イヤホン',
  'カメラ',
  '充電器',
  'かばん',
  'さいふ',
  'かぎ',
  '傘',
  'くつ',
  'スニーカー',
  'サンダル',
  'ぼうし',
  'てぶくろ',
  'マフラー',
  'シャツ',
  'ズボン',
  'スカート',
  'コート',
  'パジャマ',
  '自転車',
  '自動車',
  'バス',
  '電車',
  '新幹線',
  '飛行機',
  '船',
  'タクシー',
  '学校',
  '図書館',
  '病院',
  '公園',
  '郵便局',
  'スーパー',
  'コンビニ',
  '薬局',
  '銀行',
  '駅',
  '家',
  '玄関',
  'リビング',
  '台所',
  'お風呂',
  'トイレ',
  '窓',
  'ドア',
  '階段',
  '庭',
  '犬',
  '猫',
  'うさぎ',
  'ハムスター',
  '金魚',
  '鳥',
  'パンダ',
  'ぞう',
  'きりん',
  'くま',
  'ボール',
  'サッカー',
  '野球',
  'バスケットボール',
  'テニス',
  'バドミントン',
  '水泳',
  '縄跳び',
  'かけっこ',
  '体操',
  '本',
  '漫画',
  '新聞',
  '手紙',
  '写真',
  'アルバム',
  'カレンダー',
  '海',
  '山',
  '川',
  '空',
  '雲',
  '雨',
  '雪',
  '風',
  '太陽',
  '月'
];

const EXPECTED_TOPIC_COUNT = 150;
if (topics.length !== EXPECTED_TOPIC_COUNT) {
  console.error(`topics 件数が不正です: ${topics.length} (expected: ${EXPECTED_TOPIC_COUNT})`);
  process.exit(1);
}

const run = async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (emulatorEnabled) {
    const host = process.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
    const port = Number(process.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
    connectFirestoreEmulator(db, host, port);
  }

  const batch = writeBatch(db);
  const topicsRef = collection(db, 'topics');

  for (let index = 0; index < topics.length; index += 1) {
    const id = `topic-${String(index + 1).padStart(3, '0')}`;
    const ref = doc(topicsRef, id);
    batch.set(
      ref,
      {
        text: topics[index],
        isActive: true,
        updatedAt: Date.now()
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(`Seed completed: ${topics.length} topics`);
};

run().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
