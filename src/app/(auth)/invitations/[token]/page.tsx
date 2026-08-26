'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, UserPlus, XCircle } from 'lucide-react'

import { organizationsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type InvitationState = 'loading' | 'ready' | 'accepting' | 'declining' | 'accepted' | 'declined' | 'error'

interface ErrorInfo {
  code: string
  message: string
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuthStore()

  const [state, setState] = useState<InvitationState>('loading')
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [organizationName, setOrganizationName] = useState<string>('')

  const token = params.token as string

  // Wait for auth to initialize, then check if user is authenticated
  useEffect(() => {
    // Wait for auth store to be initialized (hydrated from localStorage)
    if (!isInitialized || authLoading) return

    if (!isAuthenticated) {
      // Store the invitation URL to redirect back after login
      const currentUrl = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // User is authenticated, show the accept/decline UI
    setState('ready')
  }, [authLoading, isAuthenticated, isInitialized, router])

  const handleAccept = async () => {
    setState('accepting')
    setError(null)

    try {
      const result = await organizationsApi.acceptInvitation(token)
      setOrganizationName(result.organization.name)
      setState('accepted')

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: unknown) {
      // API client transforms errors to flat ApiError structure
      const apiError = err as { code?: string; message?: string }
      const code = apiError.code || 'UNKNOWN_ERROR'
      const message = getErrorMessage(code)
      setError({ code, message })
      setState('error')
    }
  }

  const handleDecline = async () => {
    setState('declining')
    setError(null)

    try {
      await organizationsApi.declineInvitation(token)
      setState('declined')
    } catch (err: unknown) {
      // API client transforms errors to flat ApiError structure
      const apiError = err as { code?: string; message?: string }
      const code = apiError.code || 'UNKNOWN_ERROR'
      const message = getErrorMessage(code)
      setError({ code, message })
      setState('error')
    }
  }

  // Loading state (auth loading, not initialized, or initial state)
  if (state === 'loading' || authLoading || !isInitialized) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Loading invitation...
          </CardTitle>
          <CardDescription className="text-base">
            Please wait while we verify your invitation.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Ready state - show accept/decline options
  if (state === 'ready') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Organization Invitation
          </CardTitle>
          <CardDescription className="text-base">
            You have been invited to join an organization on EffortlessInsight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Would you like to accept this invitation and join the organization?
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleAccept} className="w-full">
              Accept Invitation
            </Button>
            <Button variant="outline" onClick={handleDecline} className="w-full">
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Accepting state
  if (state === 'accepting') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Accepting invitation...
          </CardTitle>
          <CardDescription className="text-base">
            Please wait while we add you to the organization.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Declining state
  if (state === 'declining') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Declining invitation...
          </CardTitle>
          <CardDescription className="text-base">
            Please wait.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Accepted state
  if (state === 'accepted') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to the team!
          </CardTitle>
          <CardDescription className="text-base">
            You have successfully joined {organizationName || 'the organization'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Declined state
  if (state === 'declined') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Invitation Declined
          </CardTitle>
          <CardDescription className="text-base">
            You have declined this invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            If you change your mind, you can ask the organization to send you a new invitation.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Error state
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Invitation Error
        </CardTitle>
        <CardDescription className="text-base">
          {error?.message || 'Something went wrong with this invitation.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {getErrorHelp(error?.code)}
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in with different account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(code: string): string {
  // Handle codes that may include additional info after colon
  const baseCode = code.split(':')[0].trim()

  switch (baseCode) {
    case 'INVALID_INVITATION':
      return 'This invitation link is invalid or has already been used.'
    case 'INVITATION_EXPIRED':
      return 'This invitation has expired.'
    case 'INVITATION_CANCELLED':
      return 'This invitation has been cancelled.'
    case 'INVITATION_DECLINED':
      return 'This invitation has already been declined.'
    case 'INVITATION_ACCEPTED':
      return 'This invitation has already been accepted.'
    case 'EMAIL_MISMATCH':
      return 'Your email address does not match the invitation.'
    case 'ALREADY_MEMBER':
      return 'You are already a member of this organization.'
    case 'USER_LIMIT_EXCEEDED':
    case 'ADDITIONAL_USERS_NOT_ALLOWED':
      return 'The organization has reached its member limit.'
    case 'INTERNAL_ERROR':
      return 'A server error occurred. Please try again or contact support.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

function getErrorHelp(code?: string): string {
  // Handle codes that may include additional info after colon
  const baseCode = code?.split(':')[0].trim()

  switch (baseCode) {
    case 'INVALID_INVITATION':
      return 'Please ask the organization to send you a new invitation.'
    case 'INVITATION_EXPIRED':
      return 'Please ask the organization to resend the invitation.'
    case 'EMAIL_MISMATCH':
      return 'Please sign in with the email address that received the invitation, or ask for a new invitation to be sent to your current email.'
    case 'ALREADY_MEMBER':
      return 'You can access the organization from your dashboard.'
    case 'USER_LIMIT_EXCEEDED':
    case 'ADDITIONAL_USERS_NOT_ALLOWED':
      return 'The organization needs to upgrade their plan or remove existing members before you can join.'
    default:
      return 'If the problem persists, please contact support.'
  }
}
