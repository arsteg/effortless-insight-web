'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react'

import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type VerificationState = 'loading' | 'success' | 'error' | 'no-token'

interface VerificationResult {
  redirectUrl?: string
  isCa?: boolean
  needsOnboarding?: boolean
}

function VerifyEmailLoading() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Loading...
        </CardTitle>
        <CardDescription className="text-base">
          Please wait...
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({})

  // Track if we're on client (for SSR hydration)
  const [isClient, setIsClient] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- necessary for client-only localStorage access
  useEffect(() => { setIsClient(true) }, [])

  // Compute loginUrl - check localStorage only on client to avoid SSR mismatch
  // Use the redirect URL from API response if available (for CA onboarding)
  const loginUrl = isClient
    ? (() => {
        // If verification result has a redirect URL, encode it for the login redirect
        if (verificationResult.redirectUrl) {
          return `/login?redirect=${encodeURIComponent(verificationResult.redirectUrl)}`
        }
        const pendingInvitation = localStorage.getItem('pendingInvitationUrl')
        return pendingInvitation
          ? `/login?redirect=${encodeURIComponent(pendingInvitation)}`
          : '/login'
      })()
    : '/login'

  const token = searchParams.get('token')

  // A missing token is knowable at render time; only the async verification
  // result needs state.
  const viewState: VerificationState = token ? state : 'no-token'

  useEffect(() => {
    if (!token) {
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authApi.verifyEmail({ token })
        // Store verification result for redirect URL
        setVerificationResult({
          redirectUrl: result.redirectUrl,
          isCa: result.isCa,
          needsOnboarding: result.needsOnboarding,
        })
        setState('success')
      } catch (error: unknown) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Email verification failed. The link may have expired.'
        setErrorMessage(message)
        setState('error')
      }
    }

    verifyEmail()
  }, [token])

  // Loading state
  if (viewState === 'loading') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifying your email
          </CardTitle>
          <CardDescription className="text-base">
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // No token state
  if (viewState === 'no-token') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Required
          </CardTitle>
          <CardDescription className="text-base">
            Please check your email for a verification link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            If you haven&apos;t received the email, check your spam folder or
            request a new verification link.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (viewState === 'error') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Failed
          </CardTitle>
          <CardDescription className="text-base">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            The verification link may have expired or already been used. Please
            try logging in or request a new verification email.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create new account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state
  const successMessage = verificationResult.isCa && verificationResult.needsOnboarding
    ? 'You can now log in to set up your CA practice and start managing client notices.'
    : verificationResult.needsOnboarding
    ? 'You can now log in to set up your organization and start using EffortlessInsight.'
    : 'You can now log in to your account and start using EffortlessInsight.'

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
        <CardDescription className="text-base">
          Your email has been successfully verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {successMessage}
        </p>
        <Button asChild>
          <Link href={loginUrl}>Sign in to your account</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
