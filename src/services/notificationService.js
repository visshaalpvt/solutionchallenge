import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

/**
 * Notification Service
 * Handles creating, reading, and managing real-time notifications for volunteers.
 * 
 * Notification types:
 *   - new_task: A new task has been created matching volunteer's zone/skills
 *   - task_assigned: A task has been assigned to the volunteer
 *   - task_completed: A task has been completed (admin notification)
 *   - need_alert: A critical/high urgency need reported in volunteer's zone
 *   - system: General system notifications
 */

// ==================== CREATE NOTIFICATIONS ====================

/**
 * Create a single notification for a specific user
 */
export const createNotification = async (notification) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

/**
 * Notify all matching volunteers when a new task is created.
 * Matches by zone and/or skills.
 */
export const notifyVolunteersOfNewTask = async (task, volunteers) => {
  if (!db || !volunteers?.length) return;

  const batch = writeBatch(db);
  let count = 0;

  for (const vol of volunteers) {
    // Match by zone OR skills
    const zoneMatch = task.zone && vol.zone && task.zone === vol.zone;
    const skillMatch = (task.requiredSkills || []).some(skill =>
      (vol.skills || []).includes(skill)
    );

    if (zoneMatch || skillMatch) {
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        type: 'new_task',
        title: '🆕 New Task Available',
        message: `"${task.title}" in ${task.zone || 'your area'} needs a volunteer${task.requiredSkills?.length ? ` with ${task.requiredSkills[0]}` : ''}.`,
        recipientId: vol.uid || vol.id,
        relatedTaskId: task.id || '',
        taskTitle: task.title,
        taskZone: task.zone || '',
        read: false,
        createdAt: serverTimestamp(),
      });
      count++;
    }
  }

  // Also create a general notification for ALL volunteers
  if (count === 0) {
    const notifRef = doc(collection(db, 'notifications'));
    batch.set(notifRef, {
      type: 'new_task',
      title: '🆕 New Task Available',
      message: `"${task.title}" in ${task.zone || 'Unknown Zone'} needs volunteers.`,
      recipientId: 'all_volunteers',
      relatedTaskId: task.id || '',
      taskTitle: task.title,
      taskZone: task.zone || '',
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
    console.log(`Notified ${count || 'all'} volunteers about new task: ${task.title}`);
  } catch (err) {
    console.error('Failed to batch notify volunteers:', err);
  }
};

/**
 * Notify a specific volunteer that they've been assigned a task
 */
export const notifyTaskAssigned = async (taskTitle, volunteerId, taskId) => {
  return createNotification({
    type: 'task_assigned',
    title: '✅ Task Assigned to You',
    message: `You have been assigned to "${taskTitle}". Check your tasks to get started!`,
    recipientId: volunteerId,
    relatedTaskId: taskId,
    taskTitle,
  });
};

/**
 * Notify admin when a volunteer completes a task
 */
export const notifyTaskCompleted = async (taskTitle, volunteerName, adminId, taskId) => {
  return createNotification({
    type: 'task_completed',
    title: '🎉 Task Completed',
    message: `${volunteerName} has completed "${taskTitle}". Great teamwork!`,
    recipientId: adminId,
    relatedTaskId: taskId,
    taskTitle,
  });
};

/**
 * Notify relevant volunteers when a critical need is reported
 */
export const notifyCriticalNeed = async (need, volunteers) => {
  if (!db || !volunteers?.length) return;
  if (!['critical', 'high'].includes(need.urgencyLabel)) return;

  const batch = writeBatch(db);

  for (const vol of volunteers) {
    const zoneMatch = need.zone && vol.zone && need.zone === vol.zone;
    if (zoneMatch || need.urgencyLabel === 'critical') {
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        type: 'need_alert',
        title: need.urgencyLabel === 'critical' ? '🚨 Critical Need Alert' : '⚠️ High Priority Need',
        message: `${need.title} reported in ${need.zone || 'your area'}. Urgency: ${need.urgencyScore}/10.`,
        recipientId: vol.uid || vol.id,
        relatedNeedId: need.id || '',
        needTitle: need.title,
        urgencyLabel: need.urgencyLabel,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (err) {
    console.error('Failed to notify about critical need:', err);
  }
};

// ==================== READ NOTIFICATIONS ====================

/**
 * Subscribe to notifications for a specific user (real-time)
 */
export const subscribeToNotifications = (userId, callback) => {
  if (!isFirebaseConfigured || !db || !userId) {
    callback([]);
    return () => {};
  }

  try {
    // Query notifications for this specific user
    const q1 = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Also query general volunteer notifications
    const q2 = query(
      collection(db, 'notifications'),
      where('recipientId', '==', 'all_volunteers'),
      orderBy('createdAt', 'desc')
    );

    let personalNotifs = [];
    let generalNotifs = [];

    const unsub1 = onSnapshot(q1, (snapshot) => {
      personalNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Merge and sort
      const all = [...personalNotifs, ...generalNotifs]
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      callback(all);
    }, (err) => {
      console.warn('Notification subscription error (personal):', err.message);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      generalNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const all = [...personalNotifs, ...generalNotifs]
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      callback(all);
    }, (err) => {
      console.warn('Notification subscription error (general):', err.message);
    });

    return () => {
      unsub1();
      unsub2();
    };
  } catch (error) {
    console.warn('Notification subscribe failed:', error.message);
    callback([]);
    return () => {};
  }
};

/**
 * Subscribe to notifications for admin
 */
export const subscribeToAdminNotifications = (callback) => {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('type', '==', 'task_completed'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(notifs);
    }, (err) => {
      console.warn('Admin notification error:', err.message);
      callback([]);
    });
  } catch (err) {
    callback([]);
    return () => {};
  }
};

// ==================== UPDATE NOTIFICATIONS ====================

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (notificationId) => {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
};

/**
 * Mark all notifications for a user as read
 */
export const markAllNotificationsRead = async (userId) => {
  if (!db) return;
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
};
