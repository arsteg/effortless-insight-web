/**
 * First-party, privacy-conscious activity tracker.
 *
 * - Visitor identity: random UUID in localStorage (no fingerprinting,
 *   no cookies readable by third parties, no IP handling client-side).
 * - Session: random id that rotates after 30 minutes of inactivity.
 * - Events are queued and flushed in small batches so tracking never
 *   competes with real requests; failures are silently dropped.
 * - When an access token is present the batch is sent authenticated,
 *   which lets the backend link the anonymous journey to the account.
 *
 * Never pass passwords, tokens, document contents, or free-text user
 * input into `track()` metadata.
 */

import { getAccessToken } from '@/lib/api/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const TRACK_URL = `${API_BASE_URL}/api/v1/activity/track`

const VISITOR_KEY = 'ei_visitor_id'
const SESSION_KEY = 'ei_session_id'
const SESSION_LAST_ACTIVE_KEY = 'ei_session_last'
const SESSION_IDLE_MS = 30 * 60 * 1000
const FLUSH_DELAY_MS = 5_000
const MAX_QUEUE = 20

export interface TrackOptions {
  name?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, string | number | boolean>
}

interface QueuedEvent {
  type: string
  name?: string
  page?: string
  referrer?: string
  entityType?: string
  entityId?: string
  metadata?: string
}

let queue: QueuedEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let lastTrackedPath: string | null = null
let pagehideBound = false

function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = randomId()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

/** Returns the current session id, rotating it after 30 min of inactivity. */
function getSessionId(): { id: string; isNew: boolean } {
  const now = Date.now()
  const last = Number(localStorage.getItem(SESSION_LAST_ACTIVE_KEY) || 0)
  let id = localStorage.getItem(SESSION_KEY)
  let isNew = false

  if (!id || now - last > SESSION_IDLE_MS) {
    id = randomId()
    localStorage.setItem(SESSION_KEY, id)
    isNew = true
  }
  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now))
  return { id, isNew }
}

/** Known routes whose ids are worth attaching as related entities. */
const ENTITY_ROUTES: Array<{ pattern: RegExp; entityType: string }> = [
  { pattern: /^\/notices\/([0-9a-f-]{36})/i, entityType: 'notice' },
  { pattern: /^\/tasks\/([0-9a-f-]{36})/i, entityType: 'task' },
  { pattern: /^\/support\/([0-9a-f-]{36})/i, entityType: 'support_ticket' },
]

function entityFromPath(path: string): { entityType?: string; entityId?: string } {
  for (const route of ENTITY_ROUTES) {
    const match = route.pattern.exec(path)
    if (match) {
      return { entityType: route.entityType, entityId: match[1] }
    }
  }
  return {}
}

function scheduleFlush(): void {
  if (queue.length >= MAX_QUEUE) {
    void flush()
    return
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => void flush(), FLUSH_DELAY_MS)
  }
}

async function flush(useKeepalive = false): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (queue.length === 0 || typeof window === 'undefined') return

  const visitorId = getVisitorId()
  if (!visitorId) return
  const { id: sessionId } = getSessionId()

  const events = queue.splice(0, MAX_QUEUE)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    await fetch(TRACK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ visitorId, sessionId, events }),
      keepalive: useKeepalive,
    })
  } catch {
    // Analytics is best-effort — never retry loops, never surface errors
  }

  if (queue.length > 0) {
    scheduleFlush()
  }
}

function enqueue(event: QueuedEvent, immediate = false): void {
  if (typeof window === 'undefined') return

  // Session rotation produces a session_start before the triggering event
  const { isNew } = getSessionId()
  if (isNew) {
    queue.push({
      type: 'session_start',
      page: window.location.pathname,
      referrer: document.referrer || undefined,
    })
  }

  queue.push(event)

  if (!pagehideBound) {
    pagehideBound = true
    window.addEventListener('pagehide', () => void flush(true))
  }

  if (immediate) {
    void flush()
  } else {
    scheduleFlush()
  }
}

/**
 * Track a meaningful event. Identity-changing events (login, signup,
 * logout) flush immediately so the backend links visitor → user while
 * the token is fresh.
 */
export function track(type: string, options?: TrackOptions): void {
  if (typeof window === 'undefined') return

  const immediate =
    type === 'login' || type === 'signup_completed' || type === 'logout'

  enqueue(
    {
      type,
      name: options?.name,
      page: window.location.pathname,
      entityType: options?.entityType,
      entityId: options?.entityId,
      metadata: options?.metadata ? JSON.stringify(options.metadata).slice(0, 2000) : undefined,
    },
    immediate
  )
}

/** Track a route change; consecutive duplicates are ignored. */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || path === lastTrackedPath) return
  lastTrackedPath = path

  const entity = entityFromPath(path)
  enqueue({
    type: 'page_view',
    page: path,
    referrer: document.referrer || undefined,
    ...entity,
  })
}
