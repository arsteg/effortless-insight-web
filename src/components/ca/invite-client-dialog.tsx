'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, UserPlus } from 'lucide-react'

import { caApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const inviteClientSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  gstin: z
    .string()
    .min(1, 'GSTIN is required')
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
      'Please enter a valid GSTIN (e.g., 27AABCU9603R1ZM)'
    ),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
})

type InviteClientFormData = z.infer<typeof inviteClientSchema>

interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InviteClientFormData>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: {
      email: '',
      gstin: '',
      message: '',
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: InviteClientFormData) =>
      caApi.createInvitation({
        email: data.email,
        gstin: data.gstin.toUpperCase(),
        message: data.message || undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['ca-invitations'] })
      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${response.inviteeEmail} for GSTIN ${response.gstin}`,
        variant: 'success',
      })
      form.reset()
      onOpenChange(false)
    },
    onError: (error: { message?: string; code?: string }) => {
      if (error.code === 'INVITATION_EXISTS') {
        form.setError('email', {
          type: 'server',
          message: 'An invitation already exists for this email and GSTIN',
        })
      } else if (error.code === 'INVALID_GSTIN') {
        form.setError('gstin', {
          type: 'server',
          message: 'Invalid GSTIN format',
        })
      } else {
        toast({
          title: 'Failed to send invitation',
          description: error.message || 'Please try again',
          variant: 'destructive',
        })
      }
    },
  })

  const onSubmit = async (data: InviteClientFormData) => {
    setIsSubmitting(true)
    try {
      await inviteMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Client
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a business owner to manage their GST notices
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The business owner will receive an invitation email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="27AABCU9603R1ZM"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    The GSTIN you want to manage for this client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message to your invitation..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
