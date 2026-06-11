'use client'

import { MoreHorizontal, UserMinus, Shield } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoleBadge } from './role-badge'
import type { Member, OrganizationRole } from '@/types'

interface MemberItemProps {
  member: Member
  currentUserRole: OrganizationRole
  isCurrentUser: boolean
  onChangeRole: (memberId: string, role: OrganizationRole) => void
  onRemove: (member: Member) => void
  isUpdating?: boolean
}

const roleOptions: { value: OrganizationRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MemberItem({
  member,
  currentUserRole,
  isCurrentUser,
  onChangeRole,
  onRemove,
  isUpdating,
}: MemberItemProps) {
  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
  const canChangeRole =
    canManageMembers &&
    !isCurrentUser &&
    member.role !== 'owner' &&
    (currentUserRole === 'owner' || member.role !== 'admin')
  const canRemove = canChangeRole

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
          <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.user.name}</span>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
            {member.isExternal && (
              <Badge variant="secondary" className="text-xs">
                External
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right text-sm text-muted-foreground hidden sm:block">
          Joined {formatDate(member.joinedAt)}
        </div>
        <RoleBadge role={member.role} />

        {canManageMembers && !isCurrentUser && member.role !== 'owner' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canChangeRole && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Shield className="mr-2 h-4 w-4" />
                    Change role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {roleOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => onChangeRole(member.id, option.value)}
                        disabled={member.role === option.value}
                      >
                        {option.label}
                        {member.role === option.value && ' (current)'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {canRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onRemove(member)}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove member
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
