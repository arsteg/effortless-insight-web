'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addDays, format } from 'date-fns'
import { Loader2, X, Plus, FileText, Calendar, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useDocumentRequestTemplates } from '@/hooks/use-collaboration'
import type {
  DocumentRequest,
  CreateDocumentRequestRequest,
  TaskPriority,
  DocumentRequestTemplate,
} from '@/types/collaboration'
import { cn } from '@/lib/utils'

const requestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be 2000 characters or less'),
  requestedFrom: z.string().min(1, 'Please select who to request from'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  acceptedFormats: z.array(z.string()).optional(),
  templateId: z.string().optional(),
})

type RequestFormData = z.infer<typeof requestSchema>

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface DocumentRequestFormProps {
  request?: DocumentRequest
  noticeType?: string
  availableMembers?: OrganizationMember[]
  onSubmit: (data: CreateDocumentRequestRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
]

const COMMON_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'DOC/DOCX' },
  { value: 'xls', label: 'XLS/XLSX' },
  { value: 'jpg', label: 'JPG/PNG' },
  { value: 'zip', label: 'ZIP/RAR' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DocumentRequestForm({
  request,
  noticeType,
  availableMembers = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: DocumentRequestFormProps) {
  const isEditing = !!request
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false)
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false)
  const [formatInput, setFormatInput] = useState('')

  const { data: templates } = useDocumentRequestTemplates(noticeType)

  // Default due date to 7 days from now
  const defaultDueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      requestedFrom: request?.requestedFrom?.id || '',
      dueDate: request?.dueDate ? request.dueDate.split('T')[0] : defaultDueDate,
      priority: request?.priority || 'medium',
      acceptedFormats: request?.acceptedFormats || [],
    },
  })

  const selectedMemberId = form.watch('requestedFrom')
  const currentFormats = form.watch('acceptedFormats') || []

  const selectedMember = availableMembers.find((m) => m.id === selectedMemberId)

  const handleTemplateSelect = (template: DocumentRequestTemplate) => {
    form.setValue('title', template.titleTemplate)
    form.setValue('description', template.descriptionTemplate)
    form.setValue('priority', template.defaultPriority)
    form.setValue('dueDate', format(addDays(new Date(), template.defaultDueDays), 'yyyy-MM-dd'))
    if (template.acceptedFormats) {
      form.setValue('acceptedFormats', template.acceptedFormats)
    }
    form.setValue('templateId', template.id)
    setTemplatePopoverOpen(false)
  }

  const handleAddFormat = (formatValue: string) => {
    const trimmedFormat = formatValue.trim().toLowerCase()
    if (trimmedFormat && !currentFormats.includes(trimmedFormat)) {
      form.setValue('acceptedFormats', [...currentFormats, trimmedFormat])
    }
    setFormatInput('')
  }

  const handleRemoveFormat = (formatValue: string) => {
    form.setValue(
      'acceptedFormats',
      currentFormats.filter((f) => f !== formatValue)
    )
  }

  const handleSubmit = (data: RequestFormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      requestedFrom: data.requestedFrom,
      dueDate: data.dueDate,
      priority: data.priority,
      acceptedFormats: data.acceptedFormats && data.acceptedFormats.length > 0 ? data.acceptedFormats : undefined,
      templateId: data.templateId,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Template Selector (only for new requests) */}
        {!isEditing && templates && templates.length > 0 && (
          <div className="mb-4">
            <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search templates..." />
                  <CommandList>
                    <CommandEmpty>No templates found.</CommandEmpty>
                    <CommandGroup>
                      {templates.map((template) => (
                        <CommandItem
                          key={template.id}
                          onSelect={() => handleTemplateSelect(template)}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Default: {template.defaultDueDays} days, {template.defaultPriority} priority
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., GST Return Documents Q2 2024" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what documents are needed and any specific requirements..."
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Request From */}
        <FormField
          control={form.control}
          name="requestedFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request From</FormLabel>
              <div>
                {selectedMember ? (
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedMember.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedMember.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedMember.name}</p>
                        {selectedMember.email && (
                          <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.setValue('requestedFrom', '')}
                      disabled={isLoading}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        disabled={isLoading}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Select a person...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search members..." />
                        <CommandList>
                          <CommandEmpty>No members found.</CommandEmpty>
                          <CommandGroup>
                            {availableMembers.map((member) => (
                              <CommandItem
                                key={member.id}
                                onSelect={() => {
                                  form.setValue('requestedFrom', member.id)
                                  setMemberPopoverOpen(false)
                                }}
                              >
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={member.avatarUrl} />
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
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn('inline-block w-2 h-2 rounded-full', option.color)}
                          />
                          {option.label}
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
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-9" disabled={isLoading} {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Accepted Formats */}
        <div className="space-y-2">
          <FormLabel>
            Accepted Formats <span className="text-muted-foreground font-normal">(optional)</span>
          </FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentFormats.map((format) => (
              <Badge key={format} variant="secondary" className="gap-1 pr-1 uppercase">
                {format}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => handleRemoveFormat(format)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add format (e.g., pdf)..."
              value={formatInput}
              onChange={(e) => setFormatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFormat(formatInput)
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAddFormat(formatInput)}
              disabled={isLoading || !formatInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {currentFormats.length === 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {COMMON_FORMATS.map((fmt) => (
                <Button
                  key={fmt.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleAddFormat(fmt.value)}
                  disabled={isLoading}
                >
                  + {fmt.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Request'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
