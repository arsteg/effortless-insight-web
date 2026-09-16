'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Building2,
  Shield,
  User,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useAuthStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

function InvitationLoading() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function CaInvitationPage() {
  return (
    <Suspense fallback={<InvitationLoading />}>
      <CaInvitationContent />
    </Suspense>
  )
}

function CaInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isAuthenticated, isInitialized, user } = useAuthStore()

  const token = searchParams.get('token')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [actionComplete, setActionComplete] = useState<'accepted' | 'declined' | null>(null)

  // Fetch invitation details
  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ca-invitation-validate', token],
    queryFn: () => (token ? caApi.validateInvitationToken(token) : Promise.reject('No token')),
    enabled: !!token,
    retry: false,
  })

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: () => caApi.acceptInvitation({ token: token! }),
    onSuccess: (response) => {
      setActionComplete('accepted')
      toast({
        title: 'Invitation accepted',
        description: response.message,
        variant: 'success',
      })
      // Redirect based on whether org setup is required
      if (response.requiresOrganizationSetup) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to accept invitation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    },
  })

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: () => caApi.declineInvitation({ token: token! }),
    onSuccess: () => {
      setActionComplete('declined')
      toast({
        title: 'Invitation declined',
        description: 'You have declined the CA invitation.',
        variant: 'default',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to decline invitation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    },
  })

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(`/ca-invitation?token=${token}`)}`)
      return
    }
    setIsAccepting(true)
    try {
      await acceptMutation.mutateAsync()
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      await declineMutation.mutateAsync()
    } finally {
      setIsDeclining(false)
    }
  }

  // No token
  if (!token) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-lg">Invalid Invitation Link</CardTitle>
          <CardDescription className="text-center max-w-sm mt-2">
            This invitation link is invalid or incomplete. Please check the link and try again.
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading
  if (isLoading) {
    return <InvitationLoading />
  }

  // Error or invalid token
  if (error || !invitation) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-lg">Invalid or Expired Invitation</CardTitle>
          <CardDescription className="text-center max-w-sm mt-2">
            This invitation link is invalid or has expired. Please contact the CA who sent you this
            invitation.
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Action complete
  if (actionComplete) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          {actionComplete === 'accepted' ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-lg">Invitation Accepted!</CardTitle>
              <CardDescription className="text-center max-w-sm mt-2">
                You have successfully accepted the CA invitation. The CA can now help manage your
                GST notices.
              </CardDescription>
              <Button asChild className="mt-4">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="text-lg">Invitation Declined</CardTitle>
              <CardDescription className="text-center max-w-sm mt-2">
                You have declined this CA invitation. No access has been granted.
              </CardDescription>
              <Button asChild className="mt-4">
                <Link href="/">Go to Home</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Already responded
  if (invitation.status !== 'pending') {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg">
            Invitation Already {invitation.status === 'accepted' ? 'Accepted' : 'Responded'}
          </CardTitle>
          <CardDescription className="text-center max-w-sm mt-2">
            This invitation has already been {invitation.status}. No further action is needed.
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href={isAuthenticated ? '/dashboard' : '/login'}>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">CA Invitation</CardTitle>
        <CardDescription>
          You&apos;ve been invited to grant CA access to your GST notices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inviter Info */}
        {invitation.inviter && (
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{invitation.inviter.name}</p>
                  {invitation.inviter.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{invitation.inviter.email}</p>
                {invitation.inviter.firmName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {invitation.inviter.firmName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GSTIN Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">GSTIN to authorize</p>
          <p className="font-mono text-lg font-semibold">{invitation.gstin}</p>
        </div>

        {/* Message */}
        {invitation.message && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Message from CA</p>
            <p className="text-sm bg-muted/50 rounded-lg p-3">{invitation.message}</p>
          </div>
        )}

        <Separator />

        {/* What this means */}
        <div>
          <p className="text-sm font-medium mb-2">By accepting this invitation:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              - The CA will be able to view notices for GSTIN <code>{invitation.gstin}</code>
            </li>
            <li>- The CA can add comments and help draft responses</li>
            <li>- You can revoke access at any time from your settings</li>
          </ul>
        </div>

        {/* Auth check for accept */}
        {!isAuthenticated && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              You need to sign in or create an account to accept this invitation.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
          >
            {isDeclining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              'Decline'
            )}
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={isAccepting || isDeclining}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : isAuthenticated ? (
              'Accept Invitation'
            ) : (
              'Sign in to Accept'
            )}
          </Button>
        </div>

        {/* Expiry info */}
        <p className="text-xs text-center text-muted-foreground">
          This invitation expires on {new Date(invitation.expiresAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
