'use client'

import { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMembers } from '@/hooks/use-team'
import { useAssignNotice } from '@/hooks/use-notices'
import type { Notice } from '@/types'

interface AssignNoticeDialogProps {
  notice: Notice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AssignNoticeDialog({ notice, open, onOpenChange }: AssignNoticeDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const { data: membersData, isLoading: isLoadingMembers } = useMembers()
  const assignMutation = useAssignNotice()

  const members = membersData?.members || []

  const handleAssign = async () => {
    if (!notice || !selectedMemberId) return

    await assignMutation.mutateAsync({
      id: notice.id,
      data: { assigneeId: selectedMemberId },
    })

    setSelectedMemberId('')
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMemberId('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Notice
          </DialogTitle>
          <DialogDescription>
            Assign notice {notice?.noticeNumber || notice?.id} to a team member.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedMemberId}
            onValueChange={setSelectedMemberId}
            disabled={isLoadingMembers}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.user.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span>{member.user.name}</span>
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({member.role})
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {notice?.assignedToName && (
            <p className="mt-2 text-sm text-muted-foreground">
              Currently assigned to: {notice.assignedToName}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedMemberId || assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
