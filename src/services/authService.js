import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Helper: Promise with timeout
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    return {
      uid: 'demo-admin-001', name: 'Demo Admin', email: 'admin@demo.com',
      photoURL: '', role: 'admin', skills: [], availability: [],
      zone: 'Central Zone', tasksCompleted: 12, tasksActive: 3,
    };
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userData = {
    uid: user.uid,
    name: user.displayName || 'Unknown',
    email: user.email,
    photoURL: user.photoURL || '',
    role: (ADMIN_EMAIL && user.email === ADMIN_EMAIL) ? 'admin' : 'admin',
    skills: [], availability: [], zone: '',
    tasksCompleted: 0, tasksActive: 0,
  };

  // Try Firestore with 4s timeout — don't block login
  try {
    if (db) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await withTimeout(getDoc(userRef), 4000);

      if (userSnap.exists()) {
        return { ...userData, ...userSnap.data(), uid: user.uid };
      }

      // New user — check if first user
      let isAdmin = true;
      if (ADMIN_EMAIL) {
        isAdmin = user.email === ADMIN_EMAIL;
      } else {
        try {
          const { getDocs, collection, limit, query } = await import('firebase/firestore');
          const usersQuery = query(collection(db, 'users'), limit(1));
          const usersSnap = await withTimeout(getDocs(usersQuery), 3000);
          isAdmin = usersSnap.empty;
        } catch { isAdmin = true; }
      }

      userData.role = isAdmin ? 'admin' : 'volunteer';
      await setDoc(userRef, { ...userData, createdAt: serverTimestamp() }).catch(() => {});
    }
  } catch (error) {
    console.warn('Firestore skipped:', error.message);
  }

  return userData;
};

export const signOutUser = async () => {
  if (!auth) return;
  try { await firebaseSignOut(auth); } catch (e) { console.error(e); }
};

export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    setTimeout(() => callback(null), 100);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const basicData = {
        uid: user.uid,
        name: user.displayName || 'Unknown',
        email: user.email,
        photoURL: user.photoURL || '',
        role: 'admin',
        skills: [], availability: [], zone: '',
        tasksCompleted: 0, tasksActive: 0,
      };

      // Try Firestore with 3s timeout
      try {
        if (db) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await withTimeout(getDoc(userRef), 3000);
          if (userSnap.exists()) {
            callback({ ...basicData, ...userSnap.data(), uid: user.uid });
            return;
          }
        }
      } catch (error) {
        console.warn('Firestore read timeout/error, using auth data:', error.message);
      }

      // Fallback to basic Firebase Auth data
      callback(basicData);
    } else {
      callback(null);
    }
  });
};
