import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';
import { Transaction } from '../types/index.ts';

export interface FirebaseConfigType {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const STORAGE_KEY = 'custom_firebase_config';
export const TARGET_PROJECT_DISPLAY_NAME = 'acountdb01';

export const getStoredFirebaseConfig = (): FirebaseConfigType => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId === 'acountdb01') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored Firebase config:', e);
  }
  return defaultConfig as FirebaseConfigType;
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigType) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
};

export const resetToDefaultFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

const activeConfig = getStoredFirebaseConfig();

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(activeConfig);
} else {
  app = getApp();
}

let db: Firestore;
try {
  if (activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, activeConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, db, auth, googleProvider };

// Auth helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(
        `โดเมน ${window.location.hostname} ยังไม่ได้รับอนุญาตใน Firebase Console (${TARGET_PROJECT_DISPLAY_NAME}) กรุณาเพิ่มโดเมนใน Firebase Console > Authentication > Settings > Authorized domains หรือเลือกใช้โหมดทดลองใช้งาน (Guest)`
      );
    }
    if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
      throw new Error(
        `ยังไม่ได้เปิดใช้งาน Google Sign-in ใน Firebase Console (${TARGET_PROJECT_DISPLAY_NAME}) กรุณาเปิดใช้งานที่ Firebase Console > Authentication > Sign-in method หรือเลือกใช้โหมดทดลองใช้งาน (Guest)`
      );
    }
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('หน้าต่างล็อกอินถูกบล็อกโดยเบราว์เซอร์ กรุณาอนุญาตป็อปอัป หรือเปิดในแท็บใหม่');
    }
    throw error;
  }
};

export const signInAsGuest = async (displayName = 'ผู้ใช้งานทั่วไป (Guest)') => {
  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      await updateProfile(result.user, {
        displayName: displayName
      });
    }
    return result.user;
  } catch (error: any) {
    console.error('Guest Sign In Error:', error);
    throw error;
  }
};

export const logOut = async () => {
  await signOut(auth);
};

// Firestore Transaction Helpers
export const subscribeToTransactions = (
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
) => {
  const txRef = collection(db, 'transactions');
  const q = query(
    txRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          userEmail: data.userEmail || '',
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category,
          date: data.date,
          note: data.note || '',
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      onError(err);
    }
  );
};

export const addTransaction = async (
  userId: string,
  userEmail: string,
  data: Omit<Transaction, 'id' | 'userId' | 'userEmail' | 'createdAt'>
) => {
  const txRef = collection(db, 'transactions');
  const docRef = await addDoc(txRef, {
    ...data,
    userId,
    userEmail: userEmail || '',
    amount: Number(data.amount),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateTransaction = async (
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'userId'>>
) => {
  const docRef = doc(db, 'transactions', id);
  await updateDoc(docRef, {
    ...data,
    ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
};
