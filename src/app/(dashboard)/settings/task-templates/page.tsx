'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  EyeOff,
  Loader2,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  useTaskTemplates,
  useCreateTaskTemplate,
  useDeleteTaskTemplate,
} from '@/hooks/use-collaboration'
import { usePermissions } from '@/hooks/use-permissions'
import type { TaskTemplate, TaskPriority } from '@/types/collaboration'
import { cn } from '@/lib/utils'

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

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; badgeClass: string }[] = [
  { value: 'critical', label: 'Critical', badgeClass: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', badgeClass: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', badgeClass: 'bg-green-100 text-green-800' },
]

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  defaultTitle: z.string().min(1, 'Default task title is required').max(200, 'Max 200 characters'),
  defaultDescription: z.string().max(2000, 'Max 2000 characters').optional(),
  defaultPriority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  defaultEstimatedHours: z.number().min(0).max(999).optional(),
})

type TemplateFormData = z.infer<typeof templateSchema>

export default function TaskTemplatesPage() {
  const { toast } = useToast()
  const { isViewer } = usePermissions()
  const [showForm, setShowForm] = useState(false)
  const [deletingTemplate, setDeletingTemplate] = useState<TaskTemplate | null>(null)

  // Viewers have read-only access
  const canEdit = !isViewer

  const { data: templates, isLoading } = useTaskTemplates()
  const createMutation = useCreateTaskTemplate()
  const deleteMutation = useDeleteTaskTemplate()

  const handleDelete = async () => {
    if (!deletingTemplate) return
    try {
      await deleteMutation.mutateAsync(deletingTemplate.id)
      toast({
        title: 'Template deleted',
        description: `"${deletingTemplate.name}" has been removed.`,
        variant: 'success',
      })
      setDeletingTemplate(null)
    } catch {
      toast({
        title: 'Failed to delete template',
        description: 'Something went wrong. Please try again.',
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
          <h1 className="text-3xl font-bold tracking-tight">Task Templates</h1>
          <p className="text-muted-foreground">
            Reusable task definitions your team can apply when creating tasks on a notice.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>

      {/* Read-only banner for viewers */}
      {!canEdit && (
        <Alert>
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            You have view-only access to task templates. Contact your administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Template list */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardList className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-medium">No templates yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Templates pre-fill the task form with a title, priority, estimated hours, and
                labels — handy for recurring work like &quot;Draft reply&quot; or &quot;Reconcile
                ITC&quot; on common notice types.
              </p>
              {canEdit && (
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create your first template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              canEdit={canEdit}
              onDelete={() => setDeletingTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Task Template</DialogTitle>
            <DialogDescription>
              Define the defaults this template applies to new tasks.
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            onSubmit={async (data, labels, noticeTypes) => {
              try {
                await createMutation.mutateAsync({
                  name: data.name,
                  description: data.description || undefined,
                  defaultTitle: data.defaultTitle,
                  defaultDescription: data.defaultDescription || undefined,
                  defaultPriority: data.defaultPriority,
                  defaultEstimatedHours: data.defaultEstimatedHours,
                  defaultLabels: labels.length > 0 ? labels : undefined,
                  // Omitting notice types means the template applies to all types
                  applicableNoticeTypes: noticeTypes.length > 0 ? noticeTypes : undefined,
                })
                toast({
                  title: 'Template created',
                  description: `"${data.name}" is now available in the task form.`,
                  variant: 'success',
                })
                setShowForm(false)
              } catch {
                toast({
                  title: 'Failed to create template',
                  description: 'Something went wrong. Please try again.',
                  variant: 'destructive',
                })
              }
            }}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTemplate?.name}&quot;? Existing tasks
              created from it are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTemplate(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
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

function TemplateCard({
  template,
  canEdit,
  onDelete,
}: {
  template: TaskTemplate
  canEdit: boolean
  onDelete: () => void
}) {
  const priority = PRIORITY_OPTIONS.find((p) => p.value === template.defaultPriority)
  const appliesToAll =
    !template.applicableNoticeTypes ||
    template.applicableNoticeTypes.length === 0 ||
    template.applicableNoticeTypes.includes('*')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{template.name}</CardTitle>
            {template.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {template.description}
              </CardDescription>
            )}
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete template</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Creates task</p>
          <p className="truncate text-sm font-medium">{template.defaultTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {priority && (
            <Badge variant="outline" className={cn('text-xs', priority.badgeClass)}>
              {priority.label}
            </Badge>
          )}
          {template.defaultEstimatedHours != null && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {template.defaultEstimatedHours}h
            </span>
          )}
          {template.defaultLabels && template.defaultLabels.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Tag className="h-3 w-3" />
              {template.defaultLabels.join(', ')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {appliesToAll ? (
            <Badge variant="secondary" className="text-xs">
              All notice types
            </Badge>
          ) : (
            template.applicableNoticeTypes!.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TemplateForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: TemplateFormData, labels: string[], noticeTypes: string[]) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')
  const [noticeTypes, setNoticeTypes] = useState<string[]>([])

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultTitle: '',
      defaultDescription: '',
      defaultPriority: 'medium',
    },
  })

  const addLabel = (label: string) => {
    const trimmed = label.trim().toLowerCase()
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed])
    }
    setLabelInput('')
  }

  const toggleNoticeType = (type: string) => {
    setNoticeTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data, labels, noticeTypes))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Show Cause Response"
                  disabled={isLoading}
                  {...field}
                />
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
                  placeholder="When should this template be used?"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Task Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Draft reply to show cause notice"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Default Task Description{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Steps or checklist for this task"
                  rows={3}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultPriority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="defaultEstimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Estimated Hours{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={999}
                    step={0.5}
                    disabled={isLoading}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseFloat(value) : undefined)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Default labels */}
        <div className="space-y-2">
          <FormLabel>
            Default Labels <span className="font-normal text-muted-foreground">(optional)</span>
          </FormLabel>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <Badge key={label} variant="secondary" className="gap-1 pr-1">
                  <Tag className="h-3 w-3" />
                  {label}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-transparent"
                    onClick={() => setLabels(labels.filter((l) => l !== label))}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add a label..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLabel(labelInput)
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addLabel(labelInput)}
              disabled={isLoading || !labelInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Applicable notice types */}
        <div className="space-y-2">
          <FormLabel>Applies to Notice Types</FormLabel>
          <FormDescription>
            Leave all unselected to make the template available on every notice type.
          </FormDescription>
          <div className="flex flex-wrap gap-2">
            {NOTICE_TYPES.map((type) => {
              const selected = noticeTypes.includes(type)
              return (
                <Button
                  key={type}
                  type="button"
                  variant={selected ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toggleNoticeType(type)}
                  disabled={isLoading}
                >
                  {type}
                </Button>
              )
            })}
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
                Creating...
              </>
            ) : (
              'Create Template'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
