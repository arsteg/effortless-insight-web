'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Globe,
  Key,
  Loader2,
  LogOut,
  Monitor,
  Smartphone,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useSessions,
  useRevokeSession,
  useChangePassword,
  useProfile,
  useSetup2fa,
  useVerifySetup2fa,
  useDisable2fa,
} from '@/hooks/use-settings'
import type { Session } from '@/types'

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

function getDeviceIcon(platform: string) {
  if (platform === 'web') return Monitor
  if (platform === 'ios' || platform === 'android') return Smartphone
  return Globe
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SecuritySettingsPage() {
  const { data: user, isLoading: isLoadingProfile } = useProfile()
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions()
  const revokeMutation = useRevokeSession()
  const changePasswordMutation = useChangePassword()
  const setup2faMutation = useSetup2fa()
  const verify2faMutation = useVerifySetup2fa()
  const disable2faMutation = useDisable2fa()

  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)
  const [show2faSetup, setShow2faSetup] = useState(false)
  const [show2faDisable, setShow2faDisable] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmitPassword = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => form.reset(),
    })
  }

  const handleRevokeConfirm = () => {
    if (!sessionToRevoke) return
    revokeMutation.mutate(sessionToRevoke.id, {
      onSuccess: () => setSessionToRevoke(null),
    })
  }

  const handleSetup2fa = () => {
    setup2faMutation.mutate(undefined, {
      onSuccess: () => setShow2faSetup(true),
    })
  }

  const handleVerify2fa = () => {
    verify2faMutation.mutate(twoFactorCode, {
      onSuccess: (data) => {
        setRecoveryCodes(data.recoveryCodes)
        setTwoFactorCode('')
      },
    })
  }

  const handleClose2faSetup = () => {
    setShow2faSetup(false)
    setTwoFactorCode('')
    setRecoveryCodes(null)
    setup2faMutation.reset()
  }

  const handleDisable2fa = () => {
    disable2faMutation.mutate(disablePassword, {
      onSuccess: () => {
        setShow2faDisable(false)
        setDisablePassword('')
      },
    })
  }

  const isLoading = isLoadingProfile || isLoadingSessions

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
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground">
            Manage your password and security settings.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="font-medium">
                {user?.is2faEnabled ? '2FA is enabled' : '2FA is not enabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.is2faEnabled
                  ? 'Your account is protected with two-factor authentication.'
                  : 'Enable 2FA to add an extra layer of security.'}
              </p>
            </div>
            {user?.is2faEnabled ? (
              <Button variant="outline" onClick={() => setShow2faDisable(true)}>
                Disable
              </Button>
            ) : (
              <Button onClick={handleSetup2fa} disabled={setup2faMutation.isPending}>
                {setup2faMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Enable 2FA'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices where you&apos;re currently logged in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
            <div className="space-y-4">
              {sessionsData.sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.platform)
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {session.deviceName || session.platform}
                          </span>
                          {session.isCurrent && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location && `${session.location} • `}
                          Last active: {formatDate(session.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSessionToRevoke(session)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No active sessions found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revoke Session Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log out the device at {sessionToRevoke?.location || 'unknown location'}.
              They will need to sign in again to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Log out'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2faSetup} onOpenChange={handleClose2faSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the code to verify.
            </DialogDescription>
          </DialogHeader>

          {recoveryCodes ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="font-medium mb-2">Recovery Codes</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Save these codes in a safe place. You can use them to access your account if you lose your authenticator.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, i) => (
                    <div key={i} className="bg-background rounded px-2 py-1">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleClose2faSetup}>Done</Button>
              </DialogFooter>
            </div>
          ) : setup2faMutation.data ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 p-4 rounded-lg border bg-muted/50">
                <img
                  src={setup2faMutation.data.qrCodeUri}
                  alt="2FA QR Code"
                  className="h-48 w-48"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with your authenticator app
                </p>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Manual entry code:</p>
                  <code className="text-sm font-mono select-all">{setup2faMutation.data.secret}</code>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter verification code</label>
                <Input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose2faSetup}>
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify2fa}
                  disabled={verify2faMutation.isPending || twoFactorCode.length !== 6}
                >
                  {verify2faMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable'
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={show2faDisable} onOpenChange={setShow2faDisable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make your account less secure. Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={disable2faMutation.isPending}
              onClick={() => setDisablePassword('')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable2fa}
              disabled={disable2faMutation.isPending || !disablePassword}
              className="bg-destructive hover:bg-destructive/90"
            >
              {disable2faMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
