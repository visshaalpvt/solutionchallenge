import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Firestore Service — Real-time synchronization via Firebase.
 */

// Helper: Promise with timeout to prevent "Submitting..." hangs
const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore operation timed out. Please check your internet or Firebase console.')), ms))
  ]);
};

// ==================== NEEDS ====================

export const createNeed = async (needData) => {
  try {
    const docRef = await withTimeout(addDoc(collection(db, 'needs'), {
      ...needData,
      status: 'open',
      createdAt: serverTimestamp(),
    }));
    return docRef.id;
  } catch (error) {
    console.error('Error creating need:', error);
    throw error;
  }
};

export const subscribeToNeeds = (callback) => {
  const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const needs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(needs);
  });
};

export const updateNeed = async (needId, data) => {
  const docRef = doc(db, 'needs', needId);
  return updateDoc(docRef, data);
};

export const deleteNeed = async (needId) => {
  return deleteDoc(doc(db, 'needs', needId));
};

// ==================== TASKS ====================

export const createTask = async (taskData) => {
  try {
    // 1. Create the task
    const docRef = await withTimeout(addDoc(collection(db, 'tasks'), {
      ...taskData,
      status: 'open',
      assignedTo: null,
      createdAt: serverTimestamp(),
    }));

    // 2. Update the linked need status
    if (taskData.needId) {
      await updateDoc(doc(db, 'needs', taskData.needId), { status: 'in_progress' });
    }

    // Note: Auto-assignment logic can be added here or via a Cloud Function.
    // For now, we'll keep it as manual or handle it in the Matching Page.
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const subscribeToTasks = (callback) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tasks);
  });
};

export const updateTask = async (taskId, data) => {
  const docRef = doc(db, 'tasks', taskId);
  return updateDoc(docRef, data);
};

export const assignTask = async (taskId, volunteerId) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    assignedTo: volunteerId,
    status: 'assigned'
  });

  // Increment volunteer's active tasks
  const userRef = doc(db, 'users', volunteerId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current = userSnap.data().tasksActive || 0;
    await updateDoc(userRef, { tasksActive: current + 1 });
  }

  // Notification
  await createNotification({
    userId: volunteerId,
    type: 'task_assigned',
    title: '✅ Task Assigned',
    message: 'You have been assigned to a new task.',
  });
};

export const acceptTask = async (taskId, volunteerId) => {
  return assignTask(taskId, volunteerId);
};

export const completeTask = async (taskId, volunteerId) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    status: 'completed',
    completedAt: serverTimestamp()
  });

  // Update volunteer stats
  const userRef = doc(db, 'users', volunteerId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const active = userSnap.data().tasksActive || 0;
    const completed = userSnap.data().tasksCompleted || 0;
    await updateDoc(userRef, { 
      tasksActive: Math.max(0, active - 1),
      tasksCompleted: completed + 1
    });
  }
};

// ==================== USERS ====================

export const getUser = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUser = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  return updateDoc(userRef, data);
};

export const createOrUpdateUser = async (userData) => {
  const uid = userData.uid || userData.id;
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...userData,
    lastLogin: serverTimestamp(),
  }, { merge: true });
  
  const updated = await getDoc(userRef);
  return updated.data();
};

export const subscribeToVolunteers = (callback) => {
  const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
  return onSnapshot(q, (snapshot) => {
    const volunteers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    callback(volunteers);
  });
};

export const getAllVolunteers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

// ==================== NOTIFICATIONS ====================

export const createNotification = async (notifData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notifData,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Notification failed:', err.message);
  }
};

export const subscribeToNotifications = (userId, role, callback) => {
  const q = query(
    collection(db, 'notifications'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifs);
  });
};

export const markNotificationRead = async (notifId) => {
  return updateDoc(doc(db, 'notifications', notifId), { read: true });
};

export const clearAllNotifications = async (userId) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const promises = snap.docs.map(d => deleteDoc(d.ref));
  return Promise.all(promises);
};

// ==================== AI CACHE ====================

export const findSimilarAIResult = async (title, description) => {
  // Can be implemented similarly with a dedicated collection
  return null;
};

export const saveAIResult = async (title, description, result) => {
  // Optional
};
