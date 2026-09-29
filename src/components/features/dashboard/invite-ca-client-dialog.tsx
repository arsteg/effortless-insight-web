'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
import { useCreateCaClientInvitation } from '@/hooks/use-ca-clients'

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const inviteClientSchema = z.object({
  gstin: z
    .string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(gstinRegex, 'Please enter a valid GSTIN format'),
  email: z.string().email('Please enter a valid email address'),
  clientDisplayName: z.string().max(255).optional(),
  message: z.string().max(500).optional(),
})

type InviteClientFormValues = z.infer<typeof inviteClientSchema>

export function InviteCaClientDialog() {
  const [open, setOpen] = useState(false)
  const inviteMutation = useCreateCaClientInvitation()

  const form = useForm<InviteClientFormValues>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: {
      gstin: '',
      email: '',
      clientDisplayName: '',
      message: '',
    },
  })

  const onSubmit = async (data: InviteClientFormValues) => {
    await inviteMutation.mutateAsync({
      gstin: data.gstin.toUpperCase(),
      email: data.email,
      clientDisplayName: data.clientDisplayName || undefined,
      message: data.message || undefined,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Client</DialogTitle>
          <DialogDescription>
            Invite a Business Owner to set up their organization for a GSTIN. You can start
            syncing or uploading notices for this GSTIN right away, even before they accept.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client GSTIN *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="22AAAAA0000A1Z5"
                      autoComplete="off"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    They&apos;ll receive an email to set up their organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientDisplayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Client Name{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Traders" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your own label for this client, shown until they accept and name their
                    organization.
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
                  <FormLabel>
                    Personal Message{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a personal note to the invitation email..." {...field} />
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
                {inviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
