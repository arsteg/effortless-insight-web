'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { LifeBuoy, Loader2, MessageCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  supportApi,
  type SupportTicketCategory,
  type SupportTicketStatus,
} from '@/lib/api/support'

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const STATUS_VARIANTS: Record<
  SupportTicketStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
}

const CATEGORY_OPTIONS: { value: SupportTicketCategory; label: string }[] = [
  { value: 'question', label: 'Question' },
  { value: 'problem', label: 'Problem / bug' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'other', label: 'Other' },
]

export default function SupportPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: () => supportApi.list(),
  })

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground">
            Raise a ticket and we&apos;ll reply here — you&apos;ll also see our
            answers on this page.
          </p>
        </div>
        <NewTicketDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <LifeBuoy className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-lg font-semibold">No tickets yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Stuck on something, found a problem, or have a billing question?
              Create a ticket and a real person will reply.
            </p>
            <Button className="mt-5" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`} className="block">
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{ticket.subject}</span>
                      {ticket.hasUnreadSupportReply && ticket.status !== 'closed' && (
                        <Badge variant="default" className="shrink-0">
                          New reply
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Updated{' '}
                      {formatDistanceToNow(parseISO(ticket.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {ticket.messageCount}
                  </span>
                  <Badge variant={STATUS_VARIANTS[ticket.status]}>
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NewTicketDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<SupportTicketCategory>('question')
  const [message, setMessage] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: () => supportApi.create({ subject, category, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
      toast({
        title: 'Ticket created',
        description: "We'll reply here — check back or watch for the New reply badge.",
      })
      setSubject('')
      setCategory('question')
      setMessage('')
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: 'Could not create ticket',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      })
    },
  })

  const canSubmit =
    subject.trim().length > 0 && message.trim().length > 0 && !createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New support ticket</DialogTitle>
          <DialogDescription>
            Describe the issue and we&apos;ll get back to you — usually within one
            business day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              value={subject}
              maxLength={200}
              placeholder="Short summary of the issue"
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as SupportTicketCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-message">Message</Label>
            <Textarea
              id="ticket-message"
              value={message}
              rows={5}
              placeholder="What happened? Include the notice or screen involved if relevant."
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => createMutation.mutate()} disabled={!canSubmit}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
