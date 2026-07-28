'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, Users, X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useMembers } from '@/hooks/use-team'
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from '@/hooks/use-collaboration'
import type { Team } from '@/types/collaboration'

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

type TeamFormData = z.infer<typeof teamSchema>

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function TeamsSettingsPage() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)

  const { data: teams, isLoading } = useTeams()
  const createMutation = useCreateTeam()
  const updateMutation = useUpdateTeam()
  const deleteMutation = useDeleteTeam()

  const handleDelete = async () => {
    if (!deletingTeam) return
    try {
      await deleteMutation.mutateAsync(deletingTeam.id)
      toast({
        title: 'Team deleted',
        description: `"${deletingTeam.name}" has been removed. Existing task assignments keep their history.`,
        variant: 'success',
      })
      setDeletingTeam(null)
    } catch (error) {
      toast({
        title: 'Failed to delete team',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/settings"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Group members into teams so whole teams can be assigned to tasks at once.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Team
        </Button>
      </div>

      {/* Team list */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !teams || teams.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-medium">No teams yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Create teams like &quot;Compliance&quot; or &quot;Litigation&quot; and assign them
                to tasks — every team member automatically becomes an assignee.
              </p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Create your first team
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={() => setEditingTeam(team)}
              onDelete={() => setDeletingTeam(team)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog
        open={showForm || !!editingTeam}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingTeam(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam
                ? 'Update the team name, description, or members.'
                : 'Name the team and pick its members.'}
            </DialogDescription>
          </DialogHeader>
          <TeamForm
            key={editingTeam?.id ?? 'new'}
            team={editingTeam ?? undefined}
            onSubmit={async (data, memberIds) => {
              try {
                if (editingTeam) {
                  await updateMutation.mutateAsync({
                    teamId: editingTeam.id,
                    data: { ...data, memberIds },
                  })
                  toast({ title: 'Team updated', variant: 'success' })
                  setEditingTeam(null)
                } else {
                  await createMutation.mutateAsync({ ...data, memberIds })
                  toast({
                    title: 'Team created',
                    description: `"${data.name}" can now be assigned to tasks.`,
                    variant: 'success',
                  })
                  setShowForm(false)
                }
              } catch (error) {
                toast({
                  title: editingTeam ? 'Failed to update team' : 'Failed to create team',
                  description:
                    (error as { message?: string })?.message ||
                    'Something went wrong. Please try again.',
                  variant: 'destructive',
                })
              }
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingTeam(null)
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingTeam} onOpenChange={() => setDeletingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTeam?.name}&quot;? Tasks already
              assigned to this team keep their assignees; the team just can&apos;t be used for new
              assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTeam(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamCard({
  team,
  onEdit,
  onDelete,
}: {
  team: Team
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users
                className="h-4 w-4"
                style={team.color ? { color: team.color } : undefined}
              />
              {team.name}
            </CardTitle>
            {team.description && (
              <CardDescription className="mt-1 line-clamp-2">{team.description}</CardDescription>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit team</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete team</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {team.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex -space-x-2">
                {team.members.slice(0, 6).map((member) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{member.name}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            {team.members.length > 6 && (
              <span className="text-xs text-muted-foreground">+{team.members.length - 6}</span>
            )}
            <Badge variant="secondary" className="ml-auto text-xs">
              {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TeamForm({
  team,
  onSubmit,
  onCancel,
  isLoading,
}: {
  team?: Team
  onSubmit: (data: TeamFormData, memberIds: string[]) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: membersData } = useMembers()
  const [memberIds, setMemberIds] = useState<string[]>(team?.members.map((m) => m.id) ?? [])
  const [pickerOpen, setPickerOpen] = useState(false)

  const orgMembers = (membersData?.members ?? []).map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }))

  const selectedMembers = orgMembers.filter((m) => memberIds.includes(m.id))

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
    },
  })

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data, memberIds))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Compliance" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="What does this team handle?"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Members */}
        <div className="space-y-2">
          <FormLabel>Members</FormLabel>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <Badge key={member.id} variant="secondary" className="gap-1 pr-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{member.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => toggleMember(member.id)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={isLoading}>
                  <Users className="mr-1 h-4 w-4" />
                  {memberIds.length === 0 ? 'Add Members' : 'Add More'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search members..." />
                  <CommandList>
                    <CommandEmpty>No members found.</CommandEmpty>
                    <CommandGroup>
                      {orgMembers
                        .filter((m) => !memberIds.includes(m.id))
                        .map((member) => (
                          <CommandItem key={member.id} onSelect={() => toggleMember(member.id)}>
                            <Avatar className="mr-2 h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{member.name}</p>
                              {member.email && (
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {team ? 'Saving...' : 'Creating...'}
              </>
            ) : team ? (
              'Save Changes'
            ) : (
              'Create Team'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
