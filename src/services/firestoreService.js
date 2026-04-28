/**
 * Local Storage Database — replaces Firestore entirely.
 * All data persists in the browser's localStorage.
 * Uses a custom event system for real-time "subscriptions".
 * 
 * No billing, no cloud, no permissions — just works.
 */

// ==================== CORE ENGINE ====================

const DB_PREFIX = 'smartalloc_';
const listeners = {}; // collectionName → [callback, ...]

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getCollection = (name) => {
  try {
    return JSON.parse(localStorage.getItem(DB_PREFIX + name)) || [];
  } catch {
    return [];
  }
};

const saveCollection = (name, data) => {
  localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
  // Fire all listeners for this collection
  (listeners[name] || []).forEach(cb => {
    try { cb([...data]); } catch (e) { console.warn('Listener error:', e); }
  });
};

const subscribe = (name, callback) => {
  if (!listeners[name]) listeners[name] = [];
  listeners[name].push(callback);
  // Immediately fire with current data
  callback(getCollection(name));
  // Return unsubscribe function
  return () => {
    listeners[name] = (listeners[name] || []).filter(cb => cb !== callback);
  };
};

// ==================== NEEDS ====================

export const createNeed = async (needData) => {
  const needs = getCollection('needs');
  const newNeed = {
    ...needData,
    id: generateId(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  needs.unshift(newNeed); // newest first
  saveCollection('needs', needs);

  // 🔔 Auto-create notification for all volunteers
  const volunteers = getCollection('users').filter(u => u.role === 'volunteer');
  const urgencyEmoji = needData.urgencyLabel === 'critical' ? '🚨' :
    needData.urgencyLabel === 'high' ? '⚠️' : '📋';

  volunteers.forEach(vol => {
    createNotification({
      userId: vol.uid || vol.id,
      type: 'need_alert',
      title: `${urgencyEmoji} New Need: ${needData.title}`,
      message: needData.aiSummary || needData.description || 'A new community need has been reported.',
      read: false,
    });
  });

  return newNeed.id;
};

export const subscribeToNeeds = (callback) => {
  return subscribe('needs', callback);
};

export const updateNeed = async (needId, data) => {
  const needs = getCollection('needs');
  const idx = needs.findIndex(n => n.id === needId);
  if (idx !== -1) {
    needs[idx] = { ...needs[idx], ...data };
    saveCollection('needs', needs);
  }
};

export const deleteNeed = async (needId) => {
  const needs = getCollection('needs').filter(n => n.id !== needId);
  saveCollection('needs', needs);
};

// ==================== TASKS ====================

/**
 * Simple volunteer scoring for auto-assignment.
 */
const findBestVolunteer = (task, volunteers) => {
  if (!volunteers?.length) return null;

  const scored = volunteers.map(vol => {
    let score = 20; // Base score
    const requiredSkills = task.requiredSkills || [];
    const volunteerSkills = vol.skills || [];
    if (requiredSkills.length > 0) {
      const matchCount = requiredSkills.filter(s => volunteerSkills.includes(s)).length;
      score += Math.round(40 * (matchCount / requiredSkills.length));
    } else {
      score += 20;
    }
    if (task.zone && vol.zone && task.zone === vol.zone) score += 20;
    const activeTasks = vol.tasksActive || 0;
    if (activeTasks === 0) score += 30;
    else if (activeTasks <= 2) score += 15;
    else if (activeTasks <= 4) score += 5;
    if ((vol.availability || []).length >= 3) score += 10;

    return { ...vol, autoScore: score };
  });

  scored.sort((a, b) => {
    if (b.autoScore !== a.autoScore) return b.autoScore - a.autoScore;
    return (a.tasksActive || 0) - (b.tasksActive || 0);
  });

  return scored[0]?.autoScore > 0 ? scored[0] : null;
};

export const createTask = async (taskData) => {
  const tasks = getCollection('tasks');
  const newTask = {
    ...taskData,
    id: generateId(),
    status: 'open',
    assignedTo: null,
    createdAt: new Date().toISOString(),
  };

  // 🤖 AUTO-ASSIGN: Find best volunteer
  const volunteers = getCollection('users').filter(u => u.role === 'volunteer');
  const bestVolunteer = findBestVolunteer(taskData, volunteers);

  if (bestVolunteer) {
    newTask.assignedTo = bestVolunteer.uid || bestVolunteer.id;
    newTask.status = 'assigned';
    newTask.autoAssigned = true;

    // Update volunteer's active task count
    const users = getCollection('users');
    const vIdx = users.findIndex(u => (u.uid || u.id) === (bestVolunteer.uid || bestVolunteer.id));
    if (vIdx !== -1) {
      users[vIdx].tasksActive = (users[vIdx].tasksActive || 0) + 1;
      saveCollection('users', users);
    }

    // Notify the assigned volunteer
    createNotification({
      userId: bestVolunteer.uid || bestVolunteer.id,
      type: 'task_assigned',
      title: `✅ Task Assigned: ${taskData.title}`,
      message: `You've been auto-assigned to this task based on your skills and availability.`,
      read: false,
    });
  }

  tasks.unshift(newTask);
  saveCollection('tasks', tasks);

  // Update linked need status
  if (taskData.needId) {
    updateNeed(taskData.needId, { status: 'in_progress' });
  }

  // 🔔 Notify ALL volunteers about the new task
  volunteers.forEach(vol => {
    createNotification({
      userId: vol.uid || vol.id,
      type: 'new_task',
      title: `📋 New Task: ${taskData.title}`,
      message: taskData.description || 'A new task is available for volunteers.',
      read: false,
    });
  });

  return newTask.id;
};

export const subscribeToTasks = (callback) => {
  return subscribe('tasks', callback);
};

export const updateTask = async (taskId, data) => {
  const tasks = getCollection('tasks');
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...data };
    saveCollection('tasks', tasks);
  }
};

export const assignTask = async (taskId, volunteerId) => {
  const tasks = getCollection('tasks');
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;

  const taskTitle = tasks[idx].title || 'Unknown Task';
  tasks[idx].assignedTo = volunteerId;
  tasks[idx].status = 'assigned';
  saveCollection('tasks', tasks);

  // Increment volunteer's active tasks
  const users = getCollection('users');
  const vIdx = users.findIndex(u => (u.uid || u.id) === volunteerId);
  if (vIdx !== -1) {
    users[vIdx].tasksActive = (users[vIdx].tasksActive || 0) + 1;
    saveCollection('users', users);
  }

  // 🔔 Notify
  createNotification({
    userId: volunteerId,
    type: 'task_assigned',
    title: `✅ Assigned: ${taskTitle}`,
    message: `You have been assigned to this task.`,
    read: false,
  });
};

export const acceptTask = async (taskId, volunteerId) => {
  const tasks = getCollection('tasks');
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;

  const taskTitle = tasks[idx].title || 'Unknown Task';
  tasks[idx].assignedTo = volunteerId;
  tasks[idx].status = 'assigned';
  saveCollection('tasks', tasks);

  // Increment volunteer's active tasks
  const users = getCollection('users');
  const vIdx = users.findIndex(u => (u.uid || u.id) === volunteerId);
  if (vIdx !== -1) {
    users[vIdx].tasksActive = (users[vIdx].tasksActive || 0) + 1;
    saveCollection('users', users);
  }

  // 🔔 Notify
  createNotification({
    userId: volunteerId,
    type: 'task_assigned',
    title: `✅ Accepted: ${taskTitle}`,
    message: `You've accepted this task. Good luck!`,
    read: false,
  });
};

export const completeTask = async (taskId, volunteerId) => {
  const tasks = getCollection('tasks');
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;

  const taskData = tasks[idx];
  tasks[idx].status = 'completed';
  tasks[idx].completedAt = new Date().toISOString();
  saveCollection('tasks', tasks);

  // Update volunteer stats
  const users = getCollection('users');
  const vIdx = users.findIndex(u => (u.uid || u.id) === volunteerId);
  if (vIdx !== -1) {
    users[vIdx].tasksActive = Math.max(0, (users[vIdx].tasksActive || 0) - 1);
    users[vIdx].tasksCompleted = (users[vIdx].tasksCompleted || 0) + 1;
    saveCollection('users', users);
  }

  // Notify admins
  const admins = users.filter(u => u.role === 'admin');
  const volName = vIdx !== -1 ? users[vIdx].name : 'A volunteer';
  admins.forEach(admin => {
    createNotification({
      userId: admin.uid || admin.id,
      type: 'task_completed',
      title: `🎉 Task Completed: ${taskData.title}`,
      message: `${volName} has completed this task.`,
      read: false,
    });
  });

  // Check if all tasks for the need are completed
  if (taskData?.needId) {
    const allTasks = getCollection('tasks').filter(t => t.needId === taskData.needId);
    const allDone = allTasks.every(t => t.status === 'completed');
    if (allDone) {
      updateNeed(taskData.needId, { status: 'resolved' });
    }
  }
};

// ==================== USERS ====================

export const getUser = async (uid) => {
  const users = getCollection('users');
  return users.find(u => (u.uid || u.id) === uid) || null;
};

export const updateUser = async (uid, data) => {
  const users = getCollection('users');
  const idx = users.findIndex(u => (u.uid || u.id) === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...data };
  } else {
    users.push({ uid, id: uid, ...data });
  }
  saveCollection('users', users);
};

export const createOrUpdateUser = async (userData) => {
  const uid = userData.uid || userData.id;
  const users = getCollection('users');
  const idx = users.findIndex(u => (u.uid || u.id) === uid);
  if (idx !== -1) {
    // Only update — don't overwrite existing fields like role, skills, etc.
    users[idx] = { ...users[idx], ...userData, lastLogin: new Date().toISOString() };
  } else {
    users.push({ ...userData, uid, id: uid, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() });
  }
  saveCollection('users', users);
  return users.find(u => (u.uid || u.id) === uid);
};

export const subscribeToVolunteers = (callback) => {
  // Custom subscription that filters for volunteers only
  const handler = (allUsers) => {
    const volunteers = allUsers.filter(u => u.role === 'volunteer').map(v => ({ ...v, uid: v.uid || v.id }));
    callback(volunteers);
  };
  return subscribe('users', handler);
};

export const getAllVolunteers = async () => {
  return getCollection('users')
    .filter(u => u.role === 'volunteer')
    .map(v => ({ ...v, uid: v.uid || v.id }));
};

// ==================== NOTIFICATIONS ====================

const createNotification = (notifData) => {
  const notifications = getCollection('notifications');
  notifications.unshift({
    ...notifData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  });
  // Keep only last 100 per user to avoid storage bloat
  saveCollection('notifications', notifications.slice(0, 500));
};

export const subscribeToNotifications = (userId, role, callback) => {
  const handler = (allNotifs) => {
    const mine = allNotifs.filter(n => n.userId === userId);
    callback(mine);
  };
  return subscribe('notifications', handler);
};

export const markNotificationRead = async (notifId) => {
  const notifications = getCollection('notifications');
  const idx = notifications.findIndex(n => n.id === notifId);
  if (idx !== -1) {
    notifications[idx].read = true;
    saveCollection('notifications', notifications);
  }
};

export const clearAllNotifications = async (userId) => {
  const notifications = getCollection('notifications').filter(n => n.userId !== userId);
  saveCollection('notifications', notifications);
};

// ==================== AI CACHE ====================

export const findSimilarAIResult = async (title, description) => {
  const cache = getCollection('ai_cache');
  // Simple fuzzy match — check if title matches closely
  const match = cache.find(c => {
    const titleMatch = c.title?.toLowerCase() === title?.toLowerCase();
    return titleMatch;
  });
  return match?.result || null;
};

export const saveAIResult = async (title, description, result) => {
  const cache = getCollection('ai_cache');
  cache.unshift({ title, description, result, savedAt: new Date().toISOString() });
  // Keep only last 50 results
  saveCollection('ai_cache', cache.slice(0, 50));
};
