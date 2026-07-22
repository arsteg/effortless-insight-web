/**
 * Firebase Configuration and Initialization
 * Initializes Firebase app and messaging for web push notifications
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// VAPID key for web push
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Singleton instances
let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

// Cache the async support result so we don't re-run the checks repeatedly.
let messagingSupported: boolean | null = null;

/**
 * Authoritative check for FCM web-push support. Firebase's isSupported() covers
 * cases the coarse `'Notification' in window` check misses — notably IndexedDB
 * availability (Firefox/Safari private mode) and iOS Safari outside an installed
 * PWA, where getMessaging() would otherwise throw or never deliver (audit WB-06).
 */
export async function isMessagingSupported(): Promise<boolean> {
  if (messagingSupported !== null) return messagingSupported;

  let supported = false;
  if (typeof window !== 'undefined' && isFirebaseConfigured()) {
    try {
      supported = await isSupported();
    } catch {
      supported = false;
    }
  }
  messagingSupported = supported;
  return supported;
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey
  );
}

/**
 * Initialize Firebase app
 */
export function initializeFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Push notifications will not work.');
    return null;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

/**
 * Get Firebase Messaging instance
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (messagingInstance) {
    return messagingInstance;
  }

  const app = initializeFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('Error getting Firebase Messaging:', error);
    return null;
  }
}

/**
 * Build the service-worker URL with the (public) Firebase config as query
 * params. The worker reads these from its own URL on every startup, so it can
 * initialize and handle background push even when no page is open to message it
 * (audit WB-01). The config is stable across loads, so the URL is stable and
 * the browser does not treat each registration as a different worker.
 */
function buildServiceWorkerUrl(): string {
  const params = new URLSearchParams();
  if (firebaseConfig.apiKey) params.set('apiKey', firebaseConfig.apiKey);
  if (firebaseConfig.authDomain) params.set('authDomain', firebaseConfig.authDomain);
  if (firebaseConfig.projectId) params.set('projectId', firebaseConfig.projectId);
  if (firebaseConfig.storageBucket) params.set('storageBucket', firebaseConfig.storageBucket);
  if (firebaseConfig.messagingSenderId) params.set('messagingSenderId', firebaseConfig.messagingSenderId);
  if (firebaseConfig.appId) params.set('appId', firebaseConfig.appId);
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

/**
 * Register the Firebase messaging service worker.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured; skipping service worker registration.');
    return null;
  }

  try {
    // Config travels in the URL so the worker is self-sufficient on respawn.
    const registration = await navigator.serviceWorker.register(buildServiceWorkerUrl(), {
      scope: '/',
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Same-session fallback for any already-active worker without URL params.
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
    }

    return registration;
  } catch (error) {
    console.error('Error registering service worker:', error);
    return null;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Get FCM token for push notifications
 */
export async function getFCMToken(): Promise<string | null> {
  if (!isFirebaseConfigured() || !vapidKey) {
    console.warn('Firebase is not configured for push notifications');
    return null;
  }

  if (!(await isMessagingSupported())) {
    console.warn('FCM web push is not supported in this browser');
    return null;
  }

  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  try {
    // Ensure service worker is registered
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service worker registration failed');
      return null;
    }

    // Request permission first
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get the FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
    callback(payload);
  });

  return unsubscribe;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Export Firebase config for service worker
export { firebaseConfig };
