import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

// Safety wrapper — returns noop unsubscribe if Firestore isn't available
const safeSubscribe = (queryFn, callback) => {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }
  try {
    return onSnapshot(queryFn, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(items);
    }, (error) => {
      console.warn('Firestore subscription error:', error.message);
      callback([]);
    });
  } catch (error) {
    console.warn('Firestore subscribe failed:', error.message);
    callback([]);
    return () => {};
  }
};

// ==================== NEEDS ====================

export const createNeed = async (needData) => {
  if (!db) throw new Error('Firestore not configured');
  const docRef = await addDoc(collection(db, 'needs'), {
    ...needData,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToNeeds = (callback) => {
  if (!db) { callback([]); return () => {}; }
  const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
  return safeSubscribe(q, callback);
};

export const updateNeed = async (needId, data) => {
  if (!db) return;
  await updateDoc(doc(db, 'needs', needId), data);
};

export const deleteNeed = async (needId) => {
  if (!db) return;
  await deleteDoc(doc(db, 'needs', needId));
};

/**
 * Find existing need with same title/description to reuse AI result (Caching)
 */
export const findSimilarAIResult = async (title, description) => {
  if (!db) return null;
  
  // Try exact title match first
  const qTitle = query(
    collection(db, 'needs'),
    where('title', '==', title),
    orderBy('createdAt', 'desc')
  );
  const snapTitle = await getDocs(qTitle);
  
  if (!snapTitle.empty) {
    const data = snapTitle.docs[0].data();
    if (data.urgencyScore && data.aiSummary) {
      return {
        urgencyScore: data.urgencyScore,
        urgencyLabel: data.urgencyLabel,
        aiSummary: data.aiSummary,
        aiSource: 'cache'
      };
    }
  }

  // Fallback: check similar description (exact match for now)
  const qDesc = query(
    collection(db, 'needs'),
    where('description', '==', description),
    orderBy('createdAt', 'desc')
  );
  const snapDesc = await getDocs(qDesc);
  
  if (!snapDesc.empty) {
     const data = snapDesc.docs[0].data();
     if (data.urgencyScore && data.aiSummary) {
       return {
         urgencyScore: data.urgencyScore,
         urgencyLabel: data.urgencyLabel,
         aiSummary: data.aiSummary,
         aiSource: 'cache'
       };
     }
  }

  return null;
};

// ==================== TASKS ====================

export const createTask = async (taskData) => {
  if (!db) throw new Error('Firestore not configured');
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...taskData,
    status: 'open',
    assignedTo: null,
    createdAt: serverTimestamp(),
  });

  // Update need status if linked
  if (taskData.needId) {
    await updateDoc(doc(db, 'needs', taskData.needId), {
      status: 'in_progress',
    });
  }

  return docRef.id;
};

export const subscribeToTasks = (callback) => {
  if (!db) { callback([]); return () => {}; }
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return safeSubscribe(q, callback);
};

export const updateTask = async (taskId, data) => {
  if (!db) return;
  await updateDoc(doc(db, 'tasks', taskId), data);
};

export const assignTask = async (taskId, volunteerId) => {
  if (!db) return;
  await updateDoc(doc(db, 'tasks', taskId), {
    assignedTo: volunteerId,
    status: 'assigned',
  });

  // Increment volunteer's active tasks
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(1),
  });
};

export const completeTask = async (taskId, volunteerId) => {
  if (!db) return;
  await updateDoc(doc(db, 'tasks', taskId), {
    status: 'completed',
  });

  // Update volunteer stats
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(-1),
    tasksCompleted: increment(1),
  });

  // Check if all tasks for the need are completed
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  const task = taskSnap.data();
  if (task?.needId) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('needId', '==', task.needId)
    );
    const tasksSnap = await getDocs(tasksQuery);
    const allCompleted = tasksSnap.docs.every(
      (d) => d.data().status === 'completed'
    );
    if (allCompleted) {
      await updateDoc(doc(db, 'needs', task.needId), {
        status: 'resolved',
      });
    }
  }
};

export const acceptTask = async (taskId, volunteerId) => {
  if (!db) return;
  await updateDoc(doc(db, 'tasks', taskId), {
    assignedTo: volunteerId,
    status: 'assigned',
  });
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(1),
  });
};

// ==================== USERS ====================

export const getUser = async (uid) => {
  if (!db) return null;
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() };
  }
  return null;
};

export const updateUser = async (uid, data) => {
  if (!db) return;
  await updateDoc(doc(db, 'users', uid), data);
};

export const subscribeToVolunteers = (callback) => {
  if (!db) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'volunteer')
  );
  return safeSubscribe(q, (items) => {
    // Map id → uid for volunteer docs
    callback(items.map(v => ({ ...v, uid: v.id })));
  });
};

export const getAllVolunteers = async () => {
  if (!db) return [];
  const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
};
