'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateNotice } from '@/hooks/use-notices'
import type { NoticeDetail, UpdateNoticeRequest, NoticePriority } from '@/types'

const editNoticeSchema = z.object({
  noticeNumber: z.string().optional(),
  noticeType: z.string().optional(),
  noticeCategory: z.string().optional(),
  gstin: z.string().optional(),
  issueDate: z.string().optional(),
  responseDeadline: z.string().optional(),
  extendedDeadline: z.string().optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  penaltyAmount: z.coerce.number().min(0).optional(),
  interestAmount: z.coerce.number().min(0).optional(),
  priority: z.string().optional(),
})

type EditNoticeFormData = z.infer<typeof editNoticeSchema>

interface EditNoticeDialogProps {
  notice: NoticeDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NOTICE_TYPES = [
  'DRC-01',
  'DRC-01A',
  'DRC-01B',
  'DRC-02',
  'DRC-03',
  'DRC-07',
  'ASMT-10',
  'ASMT-12',
  'GST REG-17',
  'GST REG-18',
  'Other',
]

const NOTICE_CATEGORIES = [
  'Assessment',
  'Demand & Recovery',
  'Registration',
  'Return Filing',
  'Refund',
  'Appeals',
  'Other',
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function EditNoticeDialog({ notice, open, onOpenChange }: EditNoticeDialogProps) {
  const updateMutation = useUpdateNotice()

  const form = useForm<EditNoticeFormData>({
    resolver: zodResolver(editNoticeSchema),
    defaultValues: {
      noticeNumber: notice.noticeNumber || '',
      noticeType: notice.noticeType || '',
      noticeCategory: notice.noticeCategory || '',
      gstin: notice.gstin || '',
      issueDate: notice.issueDate ? notice.issueDate.split('T')[0] : '',
      responseDeadline: notice.responseDeadline ? notice.responseDeadline.split('T')[0] : '',
      extendedDeadline: notice.extendedDeadline ? notice.extendedDeadline.split('T')[0] : '',
      taxAmount: notice.taxAmount || 0,
      penaltyAmount: notice.penaltyAmount || 0,
      interestAmount: notice.interestAmount || 0,
      priority: notice.priority || 'medium',
    },
  })

  // Reset form when notice changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        noticeNumber: notice.noticeNumber || '',
        noticeType: notice.noticeType || '',
        noticeCategory: notice.noticeCategory || '',
        gstin: notice.gstin || '',
        issueDate: notice.issueDate ? notice.issueDate.split('T')[0] : '',
        responseDeadline: notice.responseDeadline ? notice.responseDeadline.split('T')[0] : '',
        extendedDeadline: notice.extendedDeadline ? notice.extendedDeadline.split('T')[0] : '',
        taxAmount: notice.taxAmount || 0,
        penaltyAmount: notice.penaltyAmount || 0,
        interestAmount: notice.interestAmount || 0,
        priority: notice.priority || 'medium',
      })
    }
  }, [notice, open, form])

  const onSubmit = async (data: EditNoticeFormData) => {
    // Only include changed fields
    const updateData: UpdateNoticeRequest = {}

    if (data.noticeNumber !== notice.noticeNumber) updateData.noticeNumber = data.noticeNumber
    if (data.noticeType !== notice.noticeType) updateData.noticeType = data.noticeType
    if (data.noticeCategory !== notice.noticeCategory) updateData.noticeCategory = data.noticeCategory
    if (data.gstin !== notice.gstin) updateData.gstin = data.gstin
    if (data.issueDate && data.issueDate !== notice.issueDate?.split('T')[0]) updateData.issueDate = data.issueDate
    if (data.responseDeadline && data.responseDeadline !== notice.responseDeadline?.split('T')[0]) updateData.responseDeadline = data.responseDeadline
    if (data.extendedDeadline !== (notice.extendedDeadline?.split('T')[0] || '')) {
      updateData.extendedDeadline = data.extendedDeadline || undefined
    }
    if (data.taxAmount !== notice.taxAmount) updateData.taxAmount = data.taxAmount
    if (data.penaltyAmount !== notice.penaltyAmount) updateData.penaltyAmount = data.penaltyAmount
    if (data.interestAmount !== notice.interestAmount) updateData.interestAmount = data.interestAmount
    if (data.priority !== notice.priority) updateData.priority = data.priority as NoticePriority | undefined

    // Check if any changes were made
    if (Object.keys(updateData).length === 0) {
      onOpenChange(false)
      return
    }

    await updateMutation.mutateAsync({ id: notice.id, data: updateData })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Notice Details</DialogTitle>
          <DialogDescription>
            Update the notice information. Changes will be recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Notice Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="noticeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DRC-01/2024/001" {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g., 29AABCU9603R1ZM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noticeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTICE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="noticeCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTICE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extendedDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extended Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="penaltyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
