'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to check role-based permissions for the current user.
 *
 * This hook provides permission checks based on the user's role in the **current organization**
 * (user.organization.role), not their global role. Viewers have read-only access and cannot
 * perform write operations.
 *
 * @example
 * ```tsx
 * const { canUploadNotices, canComment, isViewer } = usePermissions()
 *
 * if (!canUploadNotices) {
 *   return <AccessDenied message="You don't have permission to upload notices." />
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuthStore()
  // Use the organization role (role within current org), not the global user role
  const role = user?.organization?.role?.toLowerCase()

  return useMemo(() => ({
    // Notice permissions
    canUploadNotices: role !== 'viewer',
    canEditNotices: role !== 'viewer',
    canDeleteNotices: role === 'owner' || role === 'admin',
    canAssignNotices: role === 'owner' || role === 'admin' || role === 'manager',

    // Comment permissions
    canComment: role !== 'viewer',

    // Task permissions
    canCreateTasks: role !== 'viewer',
    canEditTasks: role !== 'viewer',
    canDeleteTasks: role !== 'viewer',

    // Workflow permissions
    canTransitionWorkflow: role !== 'viewer',
    canAdminWorkflow: role === 'owner' || role === 'admin' || role === 'manager',

    // Response permissions
    canDraftResponse: role !== 'viewer',
    canApproveResponse: role === 'owner' || role === 'admin' || role === 'manager',

    // Role checks
    isViewer: role === 'viewer',
    isAdmin: role === 'owner' || role === 'admin',
    isManager: role === 'owner' || role === 'admin' || role === 'manager',
    isOwner: role === 'owner',

    // Raw role for custom checks
    role,
  }), [role])
}

/**
 * Hook to check a specific permission.
 *
 * @param permission - The permission key to check
 * @returns boolean indicating if the user has the permission
 */
export function useHasPermission(permission: keyof ReturnType<typeof usePermissions>): boolean {
  const permissions = usePermissions()
  const value = permissions[permission]
  return typeof value === 'boolean' ? value : false
}
