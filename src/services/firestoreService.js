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
import {
  notifyVolunteersOfNewTask,
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyCriticalNeed,
} from './notificationService';

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

  // Notify ALL volunteers about this need (zone-independent)
  try {
    const volunteers = await getAllVolunteers();
    if (volunteers.length > 0) {
      await notifyCriticalNeed(
        { ...needData, id: docRef.id },
        volunteers
      );
    }
  } catch (err) {
    console.warn('Failed to send need notifications:', err.message);
  }

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

  // 🔔 Notify ALL volunteers about the new task
  try {
    const volunteers = await getAllVolunteers();
    await notifyVolunteersOfNewTask(
      { ...taskData, id: docRef.id },
      volunteers
    );

    // 🤖 AUTO-ASSIGN: Find the best-matching available volunteer
    if (volunteers.length > 0 && taskData.autoAssign !== false) {
      const bestVolunteer = findBestVolunteer(taskData, volunteers);
      if (bestVolunteer) {
        await updateDoc(doc(db, 'tasks', docRef.id), {
          assignedTo: bestVolunteer.uid,
          status: 'assigned',
          autoAssigned: true,
        });
        await updateDoc(doc(db, 'users', bestVolunteer.uid), {
          tasksActive: increment(1),
        });
        await notifyTaskAssigned(taskData.title, bestVolunteer.uid, docRef.id);
        console.log(`🤖 Auto-assigned task "${taskData.title}" to ${bestVolunteer.name}`);
      }
    }
  } catch (err) {
    console.warn('Failed to send task notifications / auto-assign:', err.message);
  }

  return docRef.id;
};

/**
 * Simple volunteer scoring for auto-assignment.
 * Finds the volunteer with the lowest active tasks who has matching skills.
 */
const findBestVolunteer = (task, volunteers) => {
  if (!volunteers?.length) return null;

  // Score each volunteer
  const scored = volunteers.map(vol => {
    let score = 0;
    // Skill match (+40)
    const requiredSkills = task.requiredSkills || [];
    const volunteerSkills = vol.skills || [];
    if (requiredSkills.length > 0) {
      const matchCount = requiredSkills.filter(s => volunteerSkills.includes(s)).length;
      score += Math.round(40 * (matchCount / requiredSkills.length));
    } else {
      score += 20; // No skills required, partial score for everyone
    }
    // Zone match (+20)
    if (task.zone && vol.zone && task.zone === vol.zone) {
      score += 20;
    }
    // Low workload (+30) — prefer volunteers with fewer active tasks
    const activeTasks = vol.tasksActive || 0;
    if (activeTasks === 0) score += 30;
    else if (activeTasks <= 2) score += 15;
    else if (activeTasks <= 4) score += 5;
    // Availability (+10)
    if ((vol.availability || []).length >= 3) score += 10;

    return { ...vol, autoScore: score };
  });

  // Sort by score descending, then by fewest active tasks
  scored.sort((a, b) => {
    if (b.autoScore !== a.autoScore) return b.autoScore - a.autoScore;
    return (a.tasksActive || 0) - (b.tasksActive || 0);
  });

  // Return the best candidate (only if score > 0)
  return scored[0]?.autoScore > 0 ? scored[0] : null;
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
  
  // Get the task title for notification
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  const taskTitle = taskSnap.exists() ? taskSnap.data().title : 'Unknown Task';

  await updateDoc(doc(db, 'tasks', taskId), {
    assignedTo: volunteerId,
    status: 'assigned',
  });

  // Increment volunteer's active tasks
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(1),
  });

  // 🔔 Notify the volunteer they've been assigned
  try {
    await notifyTaskAssigned(taskTitle, volunteerId, taskId);
  } catch (err) {
    console.warn('Failed to send assignment notification:', err.message);
  }
};

export const completeTask = async (taskId, volunteerId) => {
  if (!db) return;

  // Get task data for notification
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  const taskData = taskSnap.exists() ? taskSnap.data() : {};

  await updateDoc(doc(db, 'tasks', taskId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });

  // Update volunteer stats
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(-1),
    tasksCompleted: increment(1),
  });

  // 🔔 Notify admin that task is completed
  try {
    const volSnap = await getDoc(doc(db, 'users', volunteerId));
    const volunteerName = volSnap.exists() ? volSnap.data().name : 'A volunteer';

    // Find admin users to notify
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminSnap = await getDocs(adminQuery);
    
    for (const adminDoc of adminSnap.docs) {
      await notifyTaskCompleted(
        taskData.title || 'Unknown Task',
        volunteerName,
        adminDoc.id,
        taskId
      );
    }
  } catch (err) {
    console.warn('Failed to send completion notification:', err.message);
  }

  // Check if all tasks for the need are completed
  if (taskData?.needId) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('needId', '==', taskData.needId)
    );
    const tasksSnap = await getDocs(tasksQuery);
    const allCompleted = tasksSnap.docs.every(
      (d) => d.data().status === 'completed'
    );
    if (allCompleted) {
      await updateDoc(doc(db, 'needs', taskData.needId), {
        status: 'resolved',
      });
    }
  }
};

export const acceptTask = async (taskId, volunteerId) => {
  if (!db) return;

  // Get task title for notification
  const taskSnap = await getDoc(doc(db, 'tasks', taskId));
  const taskTitle = taskSnap.exists() ? taskSnap.data().title : 'Unknown Task';

  await updateDoc(doc(db, 'tasks', taskId), {
    assignedTo: volunteerId,
    status: 'assigned',
  });
  await updateDoc(doc(db, 'users', volunteerId), {
    tasksActive: increment(1),
  });

  // 🔔 Notify the volunteer about their acceptance confirmation
  try {
    await notifyTaskAssigned(taskTitle, volunteerId, taskId);
  } catch (err) {
    console.warn('Failed to send acceptance notification:', err.message);
  }
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
