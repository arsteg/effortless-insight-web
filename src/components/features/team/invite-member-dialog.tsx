'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowUpRight } from 'lucide-react'
import { useInviteMember } from '@/hooks/use-team'
import { useCurrentSubscription } from '@/hooks/use-billing'
import type { OrganizationRole } from '@/types'

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer', 'ca'] as const),
  isExternal: z.boolean().default(false),
  accessDurationDays: z.number().min(1).max(365).optional(),
  message: z.string().max(500).optional(),
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

interface InviteMemberDialogProps {
  currentUserRole: OrganizationRole
  /** Optional override for plan limits - useful for testing */
  planLimits?: {
    users: number
    additionalUsersAllowed: boolean
  }
}

const roleOptions: { value: OrganizationRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
  { value: 'member', label: 'Member', description: 'Can view and manage notices' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view notices' },
  { value: 'ca', label: 'CA', description: 'External chartered accountant access' },
]

export function InviteMemberDialog({ currentUserRole, planLimits }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const inviteMutation = useInviteMember()
  const { data: subscriptionData } = useCurrentSubscription()

  // Calculate user limits from subscription or props
  const seats = subscriptionData?.subscription?.seats
  const usage = subscriptionData?.usage?.users
  const totalSeats = seats ? seats.included + seats.additional : undefined
  const usedSeats = usage?.used ?? seats?.used ?? 0

  // Check if additional users are allowed (from plan limits)
  const additionalUsersAllowed = planLimits?.additionalUsersAllowed ?? true // Default to true if not specified
  const baseUserLimit = planLimits?.users ?? seats?.included ?? 0

  // Determine if user can invite
  const isAtLimit = totalSeats !== undefined && totalSeats > 0 && usedSeats >= totalSeats
  const canAddMoreSeats = additionalUsersAllowed && isAtLimit

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
      isExternal: false,
      message: '',
    },
  })

  const isExternal = useWatch({ control: form.control, name: 'isExternal' })

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin'
  const availableRoles = roleOptions.filter((option) => {
    if (currentUserRole === 'owner') return option.value !== 'owner'
    if (currentUserRole === 'admin') return option.value !== 'owner' && option.value !== 'admin'
    return false
  })

  const onSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate(
      {
        email: data.email,
        role: data.role,
        isExternal: data.isExternal,
        accessDurationDays: data.isExternal ? data.accessDurationDays : undefined,
        message: data.message || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  if (!canInvite) return null

  // Show disabled button with tooltip when at limit and can't add more
  const showLimitReached = isAtLimit && !canAddMoreSeats

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={showLimitReached} title={showLimitReached ? 'User limit reached' : undefined}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. They will receive an email with
            instructions.
          </DialogDescription>
        </DialogHeader>

        {/* User limit warning */}
        {isAtLimit && (
          <Alert variant={canAddMoreSeats ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {canAddMoreSeats ? 'Seat Limit Reached' : 'Additional Users Not Allowed'}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {canAddMoreSeats
                  ? `You have used all ${totalSeats} seats (${baseUserLimit} included + ${(totalSeats ?? 0) - baseUserLimit} additional). Add more seats to invite users.`
                  : `Your plan allows ${baseUserLimit} user${baseUserLimit > 1 ? 's' : ''} and does not support additional users. Please upgrade to a plan that allows additional seats.`}
              </p>
              <Button size="sm" variant="outline" className="w-fit" asChild>
                <Link href="/settings/billing">
                  {canAddMoreSeats ? 'Add More Seats' : 'View Upgrade Options'}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="colleague@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <span>{option.label}</span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              - {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isExternal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>External access</FormLabel>
                    <FormDescription>
                      Grant temporary access to external collaborators like CAs
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isExternal && (
              <FormField
                control={form.control}
                name="accessDurationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access duration (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        min={1}
                        max={365}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Access will automatically expire after this period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal message (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal note to the invitation..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
