'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Plus, Clock, Users, Tag, FileText } from 'lucide-react'

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
import { useTaskTemplates } from '@/hooks/use-collaboration'
import type {
  Task,
  TaskDetail,
  CreateTaskRequest,
  TaskPriority,
  TaskTemplate,
  TaskAssignee,
} from '@/types/collaboration'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimatedHours: z.number().min(0).max(999).optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).max(5, 'Maximum 5 assignees allowed').optional(),
  parentTaskId: z.string().optional(),
  templateId: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface TaskFormProps {
  task?: TaskDetail
  noticeType?: string
  parentTaskId?: string
  availableMembers?: OrganizationMember[]
  onSubmit: (data: CreateTaskRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
]

const COMMON_LABELS = [
  'documentation',
  'research',
  'review',
  'compliance',
  'urgent',
  'follow-up',
  'client-request',
  'internal',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TaskForm({
  task,
  noticeType,
  parentTaskId,
  availableMembers = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const isEditing = !!task
  const [labelInput, setLabelInput] = useState('')
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false)
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false)

  const { data: templates } = useTaskTemplates(noticeType)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task?.priority || 'medium',
      estimatedHours: task?.estimatedHours,
      labels: task?.labels || [],
      assignees: task?.assignees?.map((a) => a.id) || [],
      parentTaskId: parentTaskId || task?.parentTaskId,
    },
  })

  const selectedAssignees = form.watch('assignees') || []
  const currentLabels = form.watch('labels') || []

  const handleTemplateSelect = (template: TaskTemplate) => {
    form.setValue('title', template.defaultTitle)
    if (template.defaultDescription) {
      form.setValue('description', template.defaultDescription)
    }
    form.setValue('priority', template.defaultPriority)
    if (template.defaultEstimatedHours) {
      form.setValue('estimatedHours', template.defaultEstimatedHours)
    }
    if (template.defaultLabels) {
      form.setValue('labels', template.defaultLabels)
    }
    form.setValue('templateId', template.id)
    setTemplatePopoverOpen(false)
  }

  const handleAddLabel = (label: string) => {
    const trimmedLabel = label.trim().toLowerCase()
    if (trimmedLabel && !currentLabels.includes(trimmedLabel)) {
      form.setValue('labels', [...currentLabels, trimmedLabel])
    }
    setLabelInput('')
  }

  const handleRemoveLabel = (label: string) => {
    form.setValue(
      'labels',
      currentLabels.filter((l) => l !== label)
    )
  }

  const handleToggleAssignee = (memberId: string) => {
    if (selectedAssignees.includes(memberId)) {
      form.setValue(
        'assignees',
        selectedAssignees.filter((id) => id !== memberId)
      )
    } else if (selectedAssignees.length < 5) {
      form.setValue('assignees', [...selectedAssignees, memberId])
    }
  }

  const handleSubmit = (data: TaskFormData) => {
    onSubmit({
      title: data.title,
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
      priority: data.priority,
      estimatedHours: data.estimatedHours,
      labels: data.labels && data.labels.length > 0 ? data.labels : undefined,
      assignees: data.assignees && data.assignees.length > 0 ? data.assignees : undefined,
      parentTaskId: data.parentTaskId,
      templateId: data.templateId,
    })
  }

  const selectedMemberDetails = availableMembers.filter((m) =>
    selectedAssignees.includes(m.id)
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Template Selector (only for new tasks) */}
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
                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {template.description}
                              </p>
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
        )}

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" disabled={isLoading} {...field} />
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
              <FormLabel>
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
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
                <FormLabel>
                  Due Date <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estimated Hours */}
        <FormField
          control={form.control}
          name="estimatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Estimated Hours <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0"
                    className="pl-9"
                    disabled={isLoading}
                    min={0}
                    max={999}
                    step={0.5}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseFloat(value) : undefined)
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assignees */}
        {availableMembers.length > 0 && (
          <div className="space-y-2">
            <FormLabel>
              Assignees <span className="text-muted-foreground font-normal">(up to 5)</span>
            </FormLabel>
            <div className="flex flex-wrap gap-2">
              {selectedMemberDetails.map((member) => (
                <Badge key={member.id} variant="secondary" className="gap-1 pr-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.avatarUrl} />
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
                    onClick={() => handleToggleAssignee(member.id)}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading || selectedAssignees.length >= 5}
                  >
                    <Users className="mr-1 h-4 w-4" />
                    {selectedAssignees.length === 0 ? 'Add Assignee' : 'Add More'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandList>
                      <CommandEmpty>No members found.</CommandEmpty>
                      <CommandGroup>
                        {availableMembers
                          .filter((m) => !selectedAssignees.includes(m.id))
                          .map((member) => (
                            <CommandItem
                              key={member.id}
                              onSelect={() => {
                                handleToggleAssignee(member.id)
                                if (selectedAssignees.length >= 4) {
                                  setAssigneePopoverOpen(false)
                                }
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
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="space-y-2">
          <FormLabel>
            Labels <span className="text-muted-foreground font-normal">(optional)</span>
          </FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentLabels.map((label) => (
              <Badge key={label} variant="secondary" className="gap-1 pr-1">
                <Tag className="h-3 w-3" />
                {label}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => handleRemoveLabel(label)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a label..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLabel(labelInput)
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleAddLabel(labelInput)}
              disabled={isLoading || !labelInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {currentLabels.length === 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {COMMON_LABELS.slice(0, 4).map((label) => (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleAddLabel(label)}
                  disabled={isLoading}
                >
                  + {label}
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
              'Create Task'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
