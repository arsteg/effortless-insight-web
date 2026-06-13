'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  Moon,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  CheckSquare,
  MessageCircle,
  User,
  Loader2,
  Info,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useNotificationPreferences, useUpdatePreferences } from '@/hooks/use-notifications'
import type {
  NotificationPreferences,
  TypeChannelPreferences,
  UpdatePreferencesRequest,
} from '@/types/notification'

// Notification types configuration
const NOTIFICATION_TYPES = {
  deadline: {
    label: 'Deadline Reminders',
    icon: Clock,
    description: 'Reminders for upcoming response deadlines',
    types: [
      { key: 'deadline_7_day', label: '7 days before' },
      { key: 'deadline_3_day', label: '3 days before' },
      { key: 'deadline_1_day', label: '1 day before' },
      { key: 'deadline_today', label: 'Due today' },
      { key: 'deadline_missed', label: 'Deadline missed' },
    ],
  },
  sla: {
    label: 'SLA Alerts',
    icon: AlertTriangle,
    description: 'Warnings and breaches for service level agreements',
    types: [
      { key: 'sla_warning', label: 'SLA Warning' },
      { key: 'sla_critical', label: 'SLA Critical' },
      { key: 'sla_breach', label: 'SLA Breach' },
    ],
  },
  notice: {
    label: 'Notice Updates',
    icon: FileText,
    description: 'Updates about notices and analysis',
    types: [
      { key: 'notice_uploaded', label: 'Notice uploaded' },
      { key: 'notice_analyzed', label: 'AI analysis complete' },
      { key: 'notice_high_risk', label: 'High risk notice' },
      { key: 'notice_assigned', label: 'Notice assigned' },
    ],
  },
  task: {
    label: 'Task Notifications',
    icon: CheckSquare,
    description: 'Updates about tasks assigned to you',
    types: [
      { key: 'task_assigned', label: 'Task assigned' },
      { key: 'task_due_soon', label: 'Task due soon' },
      { key: 'task_overdue', label: 'Task overdue' },
      { key: 'task_completed', label: 'Task completed' },
    ],
  },
  collaboration: {
    label: 'Collaboration',
    icon: MessageCircle,
    description: 'Comments, mentions, and document requests',
    types: [
      { key: 'comment_added', label: 'New comment' },
      { key: 'user_mentioned', label: 'You were mentioned' },
      { key: 'document_requested', label: 'Document requested' },
      { key: 'document_received', label: 'Document received' },
    ],
  },
  account: {
    label: 'Account & Security',
    icon: User,
    description: 'Account and security notifications',
    types: [
      { key: 'login_alert', label: 'Login from new device' },
      { key: 'subscription_expiring', label: 'Subscription expiring' },
    ],
  },
}

// Time options
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00`,
  label: `${i === 0 ? '12' : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`,
}))

// Timezone options (simplified)
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'UTC', label: 'UTC' },
]

// Day options
const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ChannelToggleProps {
  icon: React.ElementType
  label: string
  description: string
  enabled: boolean
  verified?: boolean
  detail?: string
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

function ChannelToggle({
  icon: Icon,
  label,
  description,
  enabled,
  verified,
  detail,
  onChange,
  disabled,
}: ChannelToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label className="font-medium">{label}</Label>
            {verified === true && (
              <Badge variant="outline" className="text-xs text-green-600">
                <Check className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
            {verified === false && (
              <Badge variant="outline" className="text-xs text-amber-600">
                Not verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

export default function NotificationsSettingsPage() {
  const { data: preferences, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdatePreferences()

  // Local state for optimistic updates
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences)
    }
  }, [preferences])

  const handleUpdateChannels = (
    channel: 'email' | 'sms' | 'push' | 'whatsApp' | 'inApp',
    enabled: boolean
  ) => {
    if (!localPrefs) return

    const update: UpdatePreferencesRequest = {
      channels: {
        [channel]: { enabled },
      },
    }

    setLocalPrefs({
      ...localPrefs,
      channels: {
        ...localPrefs.channels,
        [channel]: {
          ...localPrefs.channels[channel],
          enabled,
        },
      },
    })

    updatePreferences.mutate(update)
  }

  const handleUpdateQuietHours = (updates: Partial<NotificationPreferences['quietHours']>) => {
    if (!localPrefs) return

    const newQuietHours = { ...localPrefs.quietHours, ...updates }
    setLocalPrefs({
      ...localPrefs,
      quietHours: newQuietHours,
    })

    updatePreferences.mutate({ quietHours: updates })
  }

  const handleUpdateDigest = (
    type: 'daily' | 'weekly',
    updates: Record<string, unknown>
  ) => {
    if (!localPrefs) return

    const currentTypePref = localPrefs.digest[type]
    const newDigest = {
      ...localPrefs.digest,
      [type]: { ...currentTypePref, ...updates },
    }

    setLocalPrefs({
      ...localPrefs,
      digest: newDigest,
    })

    updatePreferences.mutate({
      digest: { [type]: updates },
    })
  }

  const handleUpdateTypePreference = (
    typeKey: string,
    channel: keyof TypeChannelPreferences,
    enabled: boolean
  ) => {
    if (!localPrefs) return

    const currentPref = localPrefs.preferences[typeKey] || {
      email: true,
      sms: false,
      push: true,
      whatsApp: false,
      inApp: true,
    }

    const newPref = { ...currentPref, [channel]: enabled }

    setLocalPrefs({
      ...localPrefs,
      preferences: {
        ...localPrefs.preferences,
        [typeKey]: newPref,
      },
    })

    updatePreferences.mutate({
      preferences: { [typeKey]: newPref },
    })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const prefs = localPrefs || preferences

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground">
            Configure how and when you receive notifications.
          </p>
        </div>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChannelToggle
            icon={Mail}
            label="Email Notifications"
            description="Receive notifications in your email inbox"
            detail={prefs?.channels.email.address}
            enabled={prefs?.channels.email.enabled ?? true}
            verified={prefs?.channels.email.verified}
            onChange={(enabled) => handleUpdateChannels('email', enabled)}
            disabled={updatePreferences.isPending}
          />

          <ChannelToggle
            icon={Smartphone}
            label="SMS Notifications"
            description="Receive text messages for urgent alerts"
            detail={prefs?.channels.sms.phoneNumber}
            enabled={prefs?.channels.sms.enabled ?? false}
            verified={prefs?.channels.sms.verified}
            onChange={(enabled) => handleUpdateChannels('sms', enabled)}
            disabled={updatePreferences.isPending}
          />

          <ChannelToggle
            icon={Bell}
            label="Push Notifications"
            description="Receive push notifications on your devices"
            detail={
              prefs?.channels.push.registeredDevices
                ? `${prefs.channels.push.registeredDevices} device(s) registered`
                : undefined
            }
            enabled={prefs?.channels.push.enabled ?? true}
            onChange={(enabled) => handleUpdateChannels('push', enabled)}
            disabled={updatePreferences.isPending}
          />

          <ChannelToggle
            icon={MessageCircle}
            label="WhatsApp Notifications"
            description="Receive notifications via WhatsApp"
            detail={prefs?.channels.whatsApp.phoneNumber}
            enabled={prefs?.channels.whatsApp.enabled ?? false}
            verified={prefs?.channels.whatsApp.verified}
            onChange={(enabled) => handleUpdateChannels('whatsApp', enabled)}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause non-critical notifications during specific hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="font-medium">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Non-critical notifications will be held until quiet hours end.
              </p>
            </div>
            <Switch
              checked={prefs?.quietHours.enabled ?? false}
              onCheckedChange={(enabled) => handleUpdateQuietHours({ enabled })}
              disabled={updatePreferences.isPending}
            />
          </div>

          {prefs?.quietHours.enabled && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={prefs.quietHours.start}
                  onValueChange={(value) => handleUpdateQuietHours({ start: value })}
                  disabled={updatePreferences.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={prefs.quietHours.end}
                  onValueChange={(value) => handleUpdateQuietHours({ end: value })}
                  disabled={updatePreferences.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={prefs.quietHours.timezone}
                  onValueChange={(value) => handleUpdateQuietHours({ timezone: value })}
                  disabled={updatePreferences.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Critical notifications will always be delivered regardless of quiet hours.</span>
          </div>
        </CardContent>
      </Card>

      {/* Email Digests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Email Digests
          </CardTitle>
          <CardDescription>
            Receive summaries of your notifications periodically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Digest */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Get a daily summary of all notifications.
                </p>
              </div>
              <Switch
                checked={prefs?.digest.daily.enabled ?? false}
                onCheckedChange={(enabled) => handleUpdateDigest('daily', { enabled })}
                disabled={updatePreferences.isPending}
              />
            </div>

            {prefs?.digest.daily.enabled && (
              <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label>Send Time</Label>
                  <Select
                    value={prefs.digest.daily.time}
                    onValueChange={(value) => handleUpdateDigest('daily', { time: value })}
                    disabled={updatePreferences.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={prefs.digest.daily.timezone}
                    onValueChange={(value) => handleUpdateDigest('daily', { timezone: value })}
                    disabled={updatePreferences.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Weekly Digest */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly overview of activity and trends.
                </p>
              </div>
              <Switch
                checked={prefs?.digest.weekly.enabled ?? false}
                onCheckedChange={(enabled) => handleUpdateDigest('weekly', { enabled })}
                disabled={updatePreferences.isPending}
              />
            </div>

            {prefs?.digest.weekly.enabled && (
              <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={String(prefs.digest.weekly.day)}
                    onValueChange={(value) =>
                      handleUpdateDigest('weekly', { day: parseInt(value) })
                    }
                    disabled={updatePreferences.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Send Time</Label>
                  <Select
                    value={prefs.digest.weekly.time}
                    onValueChange={(value) => handleUpdateDigest('weekly', { time: value })}
                    disabled={updatePreferences.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Type Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Configure which channels to use for each type of notification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(NOTIFICATION_TYPES).map(([category, config]) => {
              const Icon = config.icon
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{config.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>

                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Notification</TableHead>
                          <TableHead className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Mail className="h-4 w-4 mx-auto" />
                                </TooltipTrigger>
                                <TooltipContent>Email</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Bell className="h-4 w-4 mx-auto" />
                                </TooltipTrigger>
                                <TooltipContent>Push</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Smartphone className="h-4 w-4 mx-auto" />
                                </TooltipTrigger>
                                <TooltipContent>SMS</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <MessageCircle className="h-4 w-4 mx-auto" />
                                </TooltipTrigger>
                                <TooltipContent>WhatsApp</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {config.types.map((type) => {
                          const typePref = prefs?.preferences[type.key] || {
                            email: true,
                            sms: false,
                            push: true,
                            whatsApp: false,
                            inApp: true,
                          }

                          return (
                            <TableRow key={type.key}>
                              <TableCell className="font-medium">{type.label}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={typePref.email}
                                  onCheckedChange={(checked) =>
                                    handleUpdateTypePreference(type.key, 'email', checked)
                                  }
                                  disabled={
                                    updatePreferences.isPending ||
                                    !prefs?.channels.email.enabled
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={typePref.push}
                                  onCheckedChange={(checked) =>
                                    handleUpdateTypePreference(type.key, 'push', checked)
                                  }
                                  disabled={
                                    updatePreferences.isPending ||
                                    !prefs?.channels.push.enabled
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={typePref.sms}
                                  onCheckedChange={(checked) =>
                                    handleUpdateTypePreference(type.key, 'sms', checked)
                                  }
                                  disabled={
                                    updatePreferences.isPending ||
                                    !prefs?.channels.sms.enabled
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={typePref.whatsApp}
                                  onCheckedChange={(checked) =>
                                    handleUpdateTypePreference(type.key, 'whatsApp', checked)
                                  }
                                  disabled={
                                    updatePreferences.isPending ||
                                    !prefs?.channels.whatsApp.enabled
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Saving indicator */}
      {updatePreferences.isPending && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
