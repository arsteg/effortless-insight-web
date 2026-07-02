/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications when the app is not in focus
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Note: These values are public and safe to expose in client-side code
// The actual Firebase config will be injected at runtime via postMessage
let firebaseConfig = null;
let messaging = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

function initializeFirebase() {
  if (!firebaseConfig || firebase.apps.length > 0) {
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message:', payload);

      const notificationTitle = payload.notification?.title || 'EffortlessInsight';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/small-logo.png',
        badge: '/small-logo.png',
        tag: payload.data?.notificationId || 'default',
        data: payload.data || {},
        // Actions for the notification
        actions: getNotificationActions(payload.data),
        // Vibration pattern for mobile
        vibrate: [200, 100, 200],
        // Require interaction for important notifications
        requireInteraction: payload.data?.priority === 'high' || payload.data?.priority === 'critical',
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
  }
}

/**
 * Get notification actions based on notification type
 */
function getNotificationActions(data) {
  if (!data) return [];

  const type = data.type || '';
  const actions = [];

  switch (type) {
    case 'deadline_reminder':
    case 'sla_warning':
    case 'sla_breach':
      actions.push({ action: 'view', title: 'View Notice' });
      actions.push({ action: 'snooze', title: 'Remind Later' });
      break;
    case 'task_assigned':
      actions.push({ action: 'view', title: 'View Task' });
      actions.push({ action: 'accept', title: 'Accept' });
      break;
    case 'comment_mention':
    case 'comment_reply':
      actions.push({ action: 'reply', title: 'Reply' });
      actions.push({ action: 'view', title: 'View' });
      break;
    default:
      actions.push({ action: 'view', title: 'View' });
  }

  return actions;
}

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event.action);

  event.notification.close();

  const data = event.notification.data || {};
  let url = '/dashboard';

  // Determine URL based on action and data
  if (event.action === 'view' || !event.action) {
    if (data.noticeId) {
      url = `/notices/${data.noticeId}`;
    } else if (data.taskId) {
      url = `/tasks/${data.taskId}`;
    } else if (data.actionUrl) {
      url = data.actionUrl;
    }
  } else if (event.action === 'snooze') {
    // For snooze action, we could track this and send to backend
    // For now, just dismiss the notification
    return;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification.tag);
  // Could track notification dismissals here
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});
