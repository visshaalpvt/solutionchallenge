import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { createOrUpdateUser } from './firestoreService';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

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
    throw new Error('Firebase not configured');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const correctRole = determineRole(user.email);

  const userData = {
    uid: user.uid,
    name: user.displayName || 'Unknown',
    email: user.email,
    photoURL: user.photoURL || '',
    role: correctRole,
    skills: [], availability: [], zone: '',
    tasksCompleted: 0, tasksActive: 0,
  };

  // Save/Update user in Firestore
  return createOrUpdateUser(userData);
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
      const correctRole = determineRole(user.email);
      const basicData = {
        uid: user.uid,
        name: user.displayName || 'Unknown',
        email: user.email,
        photoURL: user.photoURL || '',
        role: correctRole,
      };

      // Ensure user exists in DB and get full profile
      try {
        const fullProfile = await createOrUpdateUser(basicData);
        callback(fullProfile);
      } catch (err) {
        console.warn('DB profile fetch failed, using basic auth data:', err.message);
        callback({ ...basicData, role: correctRole });
      }
    } else {
      callback(null);
    }
  });
};
