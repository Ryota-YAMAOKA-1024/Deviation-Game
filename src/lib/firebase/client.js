import { err, ok } from '../result.js';

let cachedClient = null;
let emulatorConnected = false;

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const hasRequiredConfig = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.authDomain &&
      firebaseConfig.storageBucket
  );

const toBool = (value, fallback = false) => {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
};

const emulator = {
  enabled: toBool(env.VITE_USE_FIREBASE_EMULATOR, false),
  host: env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1',
  firestorePort: Number(env.VITE_FIRESTORE_EMULATOR_PORT || 8080),
  storagePort: Number(env.VITE_STORAGE_EMULATOR_PORT || 9199),
  functionsPort: Number(env.VITE_FUNCTIONS_EMULATOR_PORT || 5001)
};

const importFirebaseModules = async () => {
  try {
    const app = await import(/* @vite-ignore */ 'firebase/app');
    const firestore = await import(/* @vite-ignore */ 'firebase/firestore');
    const storage = await import(/* @vite-ignore */ 'firebase/storage');
    const functions = await import(/* @vite-ignore */ 'firebase/functions');
    return ok({ app, firestore, storage, functions });
  } catch (error) {
    return err(
      'INTERNAL_ERROR',
      'Firebase SDK が見つかりません。`firebase` を依存に追加して再実行してください。'
    );
  }
};

export const getFirebaseClient = async () => {
  if (cachedClient) return ok(cachedClient);
  if (!hasRequiredConfig()) {
    return err('INTERNAL_ERROR', 'Firebase 設定が不足しています。.env の設定を確認してください。');
  }

  const modulesResult = await importFirebaseModules();
  if (!modulesResult.ok) return modulesResult;

  const { app, firestore, storage, functions } = modulesResult.data;

  const firebaseApp = app.getApps().length ? app.getApp() : app.initializeApp(firebaseConfig);
  const db = firestore.getFirestore(firebaseApp);
  const bucket = storage.getStorage(firebaseApp);
  const funcs = functions.getFunctions(firebaseApp);

  if (emulator.enabled && !emulatorConnected) {
    firestore.connectFirestoreEmulator(db, emulator.host, emulator.firestorePort);
    storage.connectStorageEmulator(bucket, emulator.host, emulator.storagePort);
    functions.connectFunctionsEmulator(funcs, emulator.host, emulator.functionsPort);
    emulatorConnected = true;
  }

  cachedClient = {
    app: firebaseApp,
    db,
    storage: bucket,
    functions: funcs,
    firestore,
    storageApi: storage,
    functionsApi: functions
  };

  return ok(cachedClient);
};
