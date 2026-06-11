'use client'

import { Badge } from '@/components/ui/badge'
import type { OrganizationRole } from '@/types'

interface RoleBadgeProps {
  role: OrganizationRole
  className?: string
}

const roleConfig: Record<
  OrganizationRole,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  owner: { label: 'Owner', variant: 'default' },
  admin: { label: 'Admin', variant: 'secondary' },
  manager: { label: 'Manager', variant: 'secondary' },
  member: { label: 'Member', variant: 'outline' },
  viewer: { label: 'Viewer', variant: 'outline' },
  ca: { label: 'CA', variant: 'secondary' },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role] || { label: role, variant: 'outline' as const }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
