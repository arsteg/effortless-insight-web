'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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

import { useCreateGstClient } from '@/hooks/use-gst-sync'

// GSTIN validation regex
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/

const formSchema = z.object({
  gstin: z
    .string()
    .min(15, 'GSTIN must be 15 characters')
    .max(15, 'GSTIN must be 15 characters')
    .regex(gstinRegex, 'Please enter a valid GSTIN'),
  clientName: z.string().optional(),
  syncFrequencyHours: z.coerce.number().min(1).max(168).default(6),
})

type FormValues = z.infer<typeof formSchema>

interface AddGstClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddGstClientDialog({ open, onOpenChange }: AddGstClientDialogProps) {
  const createMutation = useCreateGstClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gstin: '',
      clientName: '',
      syncFrequencyHours: 6,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        gstin: values.gstin.toUpperCase(),
        clientName: values.clientName || undefined,
        syncFrequencyHours: values.syncFrequencyHours,
      })
      form.reset()
      onOpenChange(false)
    } catch {
      // Error is handled by the mutation
    }
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add GSTIN for Sync</DialogTitle>
          <DialogDescription>
            Enter the GSTIN you want to monitor. Notices will be automatically captured when you log into the GST portal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="27AABCU9603R1ZM"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the 15-digit GST Identification Number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC Enterprises"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this GSTIN
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syncFrequencyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Frequency</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Every hour</SelectItem>
                      <SelectItem value="6">Every 6 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Once daily</SelectItem>
                      <SelectItem value="168">Once weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to check for new notices when you&apos;re logged in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add GSTIN'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddGstClientDialog
