import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { createOrUpdateUser, getUser } from './firestoreService';

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
    // Demo fallback
    const demoUser = {
      uid: 'demo-admin-001', name: 'Demo Admin', email: 'admin@demo.com',
      photoURL: '', role: 'admin', skills: [], availability: [],
      zone: 'Central Zone', tasksCompleted: 12, tasksActive: 3,
    };
    await createOrUpdateUser(demoUser);
    return demoUser;
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

  // Check if user already exists in localStorage
  const existing = await getUser(user.uid);
  if (existing) {
    // Update login info + ensure role is correct
    const merged = { ...existing, ...userData, role: correctRole };
    await createOrUpdateUser(merged);
    return merged;
  }

  // New user — save to localStorage
  await createOrUpdateUser(userData);
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

      // Check localStorage for existing user data
      const existing = await getUser(user.uid);
      if (existing) {
        const merged = { ...basicData, ...existing, uid: user.uid, role: correctRole };
        await createOrUpdateUser(merged);
        callback(merged);
      } else {
        await createOrUpdateUser(basicData);
        callback(basicData);
      }
    } else {
      callback(null);
    }
  });
};
