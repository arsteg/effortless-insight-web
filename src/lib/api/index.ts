export { apiClient, getAccessToken, getRefreshToken, setTokens, clearTokens } from './client'
export { authApi } from './auth'
export { organizationsApi } from './organizations'
export { noticesApi } from './notices'
export { tasksApi } from './tasks'
export { commentsApi } from './comments'
export { dashboardApi } from './dashboard'
export { usersApi } from './users'
export { reportsApi } from './reports'
export { notificationsApi } from './notifications'
export { billingApi, formatAmount, getStatusBadgeVariant, getInvoiceStatusBadgeVariant, loadRazorpayScript } from './billing'

// Unified API object for convenience
export const api = {
  auth: () => import('./auth').then((m) => m.authApi),
  organizations: () => import('./organizations').then((m) => m.organizationsApi),
  notices: () => import('./notices').then((m) => m.noticesApi),
  tasks: () => import('./tasks').then((m) => m.tasksApi),
  comments: () => import('./comments').then((m) => m.commentsApi),
  dashboard: () => import('./dashboard').then((m) => m.dashboardApi),
  users: () => import('./users').then((m) => m.usersApi),
  reports: () => import('./reports').then((m) => m.reportsApi),
  notifications: () => import('./notifications').then((m) => m.notificationsApi),
  billing: () => import('./billing').then((m) => m.billingApi),
}
