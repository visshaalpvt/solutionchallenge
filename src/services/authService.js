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

/**
 * Determine role based on email.
 * Only the configured ADMIN_EMAIL gets 'admin', everyone else is 'volunteer'.
 */
const determineRole = (email) => {
  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    return 'admin';
  }
  return 'volunteer';
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
    role: determineRole(user.email),
    skills: [], availability: [], zone: '',
    tasksCompleted: 0, tasksActive: 0,
  };

  // Try Firestore with 4s timeout — don't block login
  try {
    if (db) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await withTimeout(getDoc(userRef), 4000);

      if (userSnap.exists()) {
        const existingData = userSnap.data();
        // Always re-derive role from email to prevent stale roles in DB
        const correctRole = determineRole(user.email);
        // If role in DB is wrong, fix it
        if (existingData.role !== correctRole) {
          await setDoc(userRef, { role: correctRole }, { merge: true }).catch(() => {});
        }
        return { ...userData, ...existingData, uid: user.uid, role: correctRole };
      }

      // New user — save to Firestore
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
      // Always derive role from email — single source of truth
      const correctRole = determineRole(user.email);

      const basicData = {
        uid: user.uid,
        name: user.displayName || 'Unknown',
        email: user.email,
        photoURL: user.photoURL || '',
        role: correctRole,
        skills: [], availability: [], zone: '',
        tasksCompleted: 0, tasksActive: 0,
      };

      // Try Firestore with 3s timeout
      try {
        if (db) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await withTimeout(getDoc(userRef), 3000);
          if (userSnap.exists()) {
            const existingData = userSnap.data();
            // Fix stale role in DB if needed
            if (existingData.role !== correctRole) {
              await setDoc(userRef, { role: correctRole }, { merge: true }).catch(() => {});
            }
            callback({ ...basicData, ...existingData, uid: user.uid, role: correctRole });
            return;
          }
        }
      } catch (error) {
        console.warn('Firestore read timeout/error, using auth data:', error.message);
      }

      // Fallback to basic Firebase Auth data with correct role
      callback(basicData);
    } else {
      callback(null);
    }
  });
};
