'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Shield,
  Bell,
  Clock,
  AlertTriangle,
  CheckSquare,
  Calendar,
  Loader2,
  Check,
  X,
  RefreshCw,
  Unlink,
  Link2,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  useWhatsAppStatus,
  useRequestWhatsAppLink,
  useVerifyWhatsAppLink,
  useUnlinkWhatsApp,
  useWhatsAppPreferences,
  useUpdateWhatsAppPreferences,
  useWhatsAppOptIn,
} from '@/hooks/use-whatsapp'

// Phone number validation for Indian numbers
function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return digits[0] >= '6' && digits[0] <= '9'
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits[2] >= '6' && digits[2] <= '9'
  }
  return false
}

// Format phone number for display
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone
}

function LoadingSkeleton() {
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
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function WhatsAppSettingsPage() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useWhatsAppStatus()
  const { data: preferences, isLoading: prefsLoading } = useWhatsAppPreferences()
  const requestLink = useRequestWhatsAppLink()
  const verifyLink = useVerifyWhatsAppLink()
  const unlinkWhatsApp = useUnlinkWhatsApp()
  const updatePreferences = useUpdateWhatsAppPreferences()
  const setOptIn = useWhatsAppOptIn()

  // Local state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)

  const isLoading = statusLoading || prefsLoading
  const isLinked = status?.linked ?? false

  const handlePhoneChange = (value: string) => {
    // Only allow digits and common phone number characters
    const cleaned = value.replace(/[^\d\s\+\-\(\)]/g, '')
    setPhoneNumber(cleaned)
    setPhoneError('')
  }

  const handleRequestLink = async () => {
    // Validate phone number
    const digits = phoneNumber.replace(/\D/g, '')
    if (!isValidIndianPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Indian mobile number (10 digits starting with 6-9)')
      return
    }

    // Format phone number for API (ensure +91 prefix)
    const formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`

    try {
      await requestLink.mutateAsync({ phoneNumber: formattedPhone })
      setShowVerifyDialog(true)
    } catch {
      // Error handled by hook
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return

    try {
      await verifyLink.mutateAsync({ code: verificationCode })
      setShowVerifyDialog(false)
      setVerificationCode('')
      setPhoneNumber('')
      refetchStatus()
    } catch {
      // Error handled by hook
    }
  }

  const handleUnlink = async () => {
    try {
      await unlinkWhatsApp.mutateAsync()
      setShowUnlinkDialog(false)
      refetchStatus()
    } catch {
      // Error handled by hook
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value })
  }

  const handleOptInChange = (optIn: boolean) => {
    setOptIn.mutate({ optIn })
  }

  if (isLoading) {
    return <LoadingSkeleton />
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
          <p className="text-muted-foreground">
            Connect your WhatsApp to receive notifications and interact with the bot.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStatus()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Link your WhatsApp to receive deadline reminders, high-risk alerts, and task notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLinked ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">WhatsApp Connected</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {status?.phoneNumber || 'Phone number linked'}
                    </p>
                    {status?.linkedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected on {new Date(status.linkedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>

              {/* Opt-in Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="font-medium">Receive Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to receive WhatsApp notifications from EffortlessInsight.
                  </p>
                </div>
                <Switch
                  checked={status?.optedIn ?? false}
                  onCheckedChange={handleOptInChange}
                  disabled={setOptIn.isPending}
                />
              </div>

              {status?.lastMessageAt && (
                <p className="text-sm text-muted-foreground">
                  Last interaction: {new Date(status.lastMessageAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Link2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">WhatsApp Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Link your WhatsApp number to receive notifications.
                  </p>
                </div>
              </div>

              {/* Link Form */}
              <div className="space-y-3">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={cn('pl-10', phoneError && 'border-destructive')}
                    />
                  </div>
                  <Button
                    onClick={handleRequestLink}
                    disabled={!phoneNumber || requestLink.isPending}
                  >
                    {requestLink.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send Code'
                    )}
                  </Button>
                </div>
                {phoneError && (
                  <p className="text-sm text-destructive">{phoneError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your WhatsApp-registered mobile number. We&apos;ll send a verification code to your app notifications.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        {isLinked && (
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowUnlinkDialog(true)}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect WhatsApp
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Notification Preferences */}
      {isLinked && status?.optedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications to receive via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium">Deadline Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified 7, 3, and 1 day before notice deadlines.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.deadlineReminders ?? true}
                onCheckedChange={(checked) => handlePreferenceChange('deadlineReminders', checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium">High-Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate alerts when high-priority notices are detected.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.highRiskAlerts ?? true}
                onCheckedChange={(checked) => handlePreferenceChange('highRiskAlerts', checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium">Task Assignments</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when tasks are assigned to you.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.taskAssignments ?? true}
                onCheckedChange={(checked) => handlePreferenceChange('taskAssignments', checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Morning summary of pending notices and upcoming deadlines.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.dailyDigest ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('dailyDigest', checked)}
                disabled={updatePreferences.isPending}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bot Commands Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            WhatsApp Bot Commands
          </CardTitle>
          <CardDescription>
            Once connected, you can use these commands to interact with the bot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">status</code>
              <p className="text-xs text-muted-foreground mt-1">
                Get your compliance dashboard summary
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">notices</code>
              <p className="text-xs text-muted-foreground mt-1">
                View recent pending notices
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">deadlines</code>
              <p className="text-xs text-muted-foreground mt-1">
                See upcoming deadlines by urgency
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">tasks</code>
              <p className="text-xs text-muted-foreground mt-1">
                View your assigned tasks
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">help</code>
              <p className="text-xs text-muted-foreground mt-1">
                See all available commands
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <code className="text-sm font-mono text-primary">stop</code>
              <p className="text-xs text-muted-foreground mt-1">
                Disconnect your WhatsApp
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Your data is secure</AlertTitle>
        <AlertDescription>
          We use end-to-end security for all WhatsApp communications. Your phone number is stored securely
          and never shared with third parties. OTP verification ensures only you can link your account.
        </AlertDescription>
      </Alert>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a 6-digit verification code to your app notifications.
              Enter it below to complete the WhatsApp linking.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setVerificationCode(value)
              }}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono w-40"
              autoFocus
            />
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the code? Check your in-app notifications or request a new code.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyDialog(false)
                setVerificationCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || verifyLink.isPending}
            >
              {verifyLink.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation Dialog */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect WhatsApp?</DialogTitle>
            <DialogDescription>
              You will no longer receive WhatsApp notifications from EffortlessInsight.
              You can reconnect anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlinkDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlink}
              disabled={unlinkWhatsApp.isPending}
            >
              {unlinkWhatsApp.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saving indicator */}
      {(updatePreferences.isPending || setOptIn.isPending) && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
