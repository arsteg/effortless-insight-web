/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications when the app is not in focus
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker.
// These values are public and safe to expose in client-side code.
//
// The config is read from THIS worker's own registration URL query params
// (set by registerServiceWorker in src/lib/firebase.ts). This is what makes
// background push work: when the browser terminates an idle worker and later
// respawns it to handle a `push` event, no page exists to postMessage the
// config — but the worker can always read its own URL. The postMessage path
// below is kept only as a same-session fallback (audit WB-01).
let firebaseConfig = null;
let messaging = null;

function readConfigFromUrl() {
  try {
    const params = new URL(self.location.href).searchParams;
    const config = {
      apiKey: params.get('apiKey'),
      authDomain: params.get('authDomain'),
      projectId: params.get('projectId'),
      storageBucket: params.get('storageBucket'),
      messagingSenderId: params.get('messagingSenderId'),
      appId: params.get('appId'),
    };
    if (config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
      return config;
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Failed to read config from URL:', error);
  }
  return null;
}

// Initialize immediately on every worker startup (including push respawn).
firebaseConfig = readConfigFromUrl();
if (firebaseConfig) {
  initializeFirebase();
}

// Fallback: accept config from the page in the same session (older registrations
// that lack URL params). Harmless when URL init already succeeded.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseConfig) {
      firebaseConfig = event.data.config;
    }
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

  // Snooze only dismisses.
  if (event.action === 'snooze') {
    return;
  }

  // Resolve the destination from the payload for every other action
  // (view/accept/reply and the default body tap), so advertised action buttons
  // deep-link correctly instead of falling through to /dashboard (audit WB-08).
  let url = '/dashboard';
  if (data.noticeId) {
    url = `/notices/${data.noticeId}`;
  } else if (data.taskId) {
    url = `/tasks/${data.taskId}`;
  } else if (typeof data.actionUrl === 'string' && data.actionUrl.startsWith('/')) {
    url = data.actionUrl;
  }

  // Reply deep-links to the comment thread.
  if (event.action === 'reply' && data.noticeId) {
    url = `/notices/${data.noticeId}#comments`;
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
