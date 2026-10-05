'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, CheckCircle2, LifeBuoy, Loader2, Send, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { supportApi, type SupportTicketStatus } from '@/lib/api/support'

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function SupportTicketPage() {
  const params = useParams<{ ticketId: string }>()
  const ticketId = params.ticketId
  const [reply, setReply] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support', 'tickets', ticketId],
    queryFn: () => supportApi.get(ticketId),
    enabled: !!ticketId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
  }

  const replyMutation = useMutation({
    mutationFn: () => supportApi.reply(ticketId, reply),
    onSuccess: () => {
      setReply('')
      invalidate()
    },
    onError: () => {
      toast({
        title: 'Could not send reply',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      })
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => supportApi.close(ticketId),
    onSuccess: () => {
      toast({ title: 'Ticket closed' })
      invalidate()
    },
    onError: () => {
      toast({
        title: 'Could not close ticket',
        variant: 'destructive',
      })
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="container mx-auto max-w-3xl p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <LifeBuoy className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-lg font-semibold">Ticket not found</h2>
            <Button variant="outline" asChild className="mt-5">
              <Link href="/support">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isClosed = ticket.status === 'closed'

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/support">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Support
          </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground">
              Opened {format(parseISO(ticket.createdAt), 'd MMM yyyy, h:mm a')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isClosed ? 'outline' : 'default'}>
              {STATUS_LABELS[ticket.status]}
            </Badge>
            {!isClosed && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Close ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Close it once your issue is sorted. You can always open a
                      new ticket later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep open</AlertDialogCancel>
                    <AlertDialogAction onClick={() => closeMutation.mutate()}>
                      Close ticket
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex', message.isFromSupport ? 'justify-start' : 'justify-end')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-lg border p-3',
                message.isFromSupport
                  ? 'bg-muted/50'
                  : 'border-primary/20 bg-primary/5'
              )}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                {message.isFromSupport ? (
                  <LifeBuoy className="h-3.5 w-3.5" />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span className="font-medium">{message.senderName}</span>
                <span>·</span>
                <span>{format(parseISO(message.createdAt), 'd MMM, h:mm a')}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{message.body}</p>
            </div>
          </div>
        ))}
      </div>

      {isClosed ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          This ticket is closed. Need more help?{' '}
          <Link href="/support" className="text-primary hover:underline">
            Open a new ticket
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {ticket.status === 'resolved' && (
            <p className="text-xs text-muted-foreground">
              This ticket is marked resolved — replying will reopen it.
            </p>
          )}
          <Textarea
            value={reply}
            rows={3}
            placeholder="Write a reply…"
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => replyMutation.mutate()}
              disabled={reply.trim().length === 0 || replyMutation.isPending}
            >
              {replyMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send reply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
