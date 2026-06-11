'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useOrganization, useUpdateOrganizationSettings } from '@/hooks/use-settings'

export default function NotificationsSettingsPage() {
  const { data: organization, isLoading } = useOrganization()
  const updateSettingsMutation = useUpdateOrganizationSettings()

  const settings = organization?.settings

  const handleToggle = (key: 'notificationEmail' | 'notificationSms', value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Configure how you receive notifications.
          </p>
        </div>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Receive notifications via email for important updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for deadlines, notice updates, and task assignments.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings?.notificationEmail ?? true}
              onCheckedChange={(checked) => handleToggle('notificationEmail', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
          <CardDescription>
            Receive urgent notifications via SMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications" className="font-medium">
                SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive SMS alerts for critical deadlines and urgent notices.
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={settings?.notificationSms ?? false}
              onCheckedChange={(checked) => handleToggle('notificationSms', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {updateSettingsMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Deadline Reminders</CardTitle>
          <CardDescription>
            Configure when to receive reminders before notice deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Default reminder days: {settings?.defaultReminderDays?.join(', ') || '7, 3, 1'} days
              before deadline.
            </p>
            <p className="text-sm text-muted-foreground">
              Custom reminder settings will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
