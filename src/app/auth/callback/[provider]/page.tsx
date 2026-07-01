'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  const provider = params.provider as string
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    const handleCallback = async () => {
      // Check for OAuth error from provider
      if (errorParam) {
        setError(errorDescription || `Authentication was denied by ${provider}`)
        setIsProcessing(false)
        return
      }

      // Check for authorization code
      if (!code) {
        setError('No authorization code received from provider')
        setIsProcessing(false)
        return
      }

      // State is required for CSRF protection
      if (!state) {
        setError('Missing security token. Please try signing in again.')
        setIsProcessing(false)
        return
      }

      try {
        const result = await authApi.handleOAuthCallback(provider, {
          code,
          state,
        })

        // Check if 2FA is required
        if ('requires2fa' in result && result.requires2fa) {
          toast({
            title: 'Two-factor authentication required',
            description: 'Please enter your verification code.',
          })
          router.push(`/login/2fa?partialToken=${result.partialToken}`)
          return
        }

        // Login successful - check if this is a mobile OAuth request
        if ('accessToken' in result) {
          // If there's a mobile redirect URI, redirect to the mobile app with tokens
          if ('mobileRedirectUri' in result && result.mobileRedirectUri) {
            const mobileUrl = new URL(result.mobileRedirectUri)
            mobileUrl.searchParams.set('accessToken', result.accessToken)
            mobileUrl.searchParams.set('refreshToken', result.refreshToken)
            mobileUrl.searchParams.set('expiresIn', String(result.expiresIn))
            // Redirect to mobile app
            window.location.href = mobileUrl.toString()
            return
          }

          // Web flow - fetch user profile and redirect to dashboard
          const user = await authApi.getMe()
          setUser(user)

          toast({
            title: 'Welcome!',
            description: `Successfully signed in with ${provider}.`,
            variant: 'success',
          })

          router.push('/dashboard')
        }
      } catch (err: unknown) {
        console.error('OAuth callback error:', err)
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : `Failed to complete ${provider} sign-in`
        setError(message)
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [code, state, errorParam, errorDescription, provider, router, setUser, toast])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">Authentication Failed</CardTitle>
            <CardDescription>
              There was a problem signing in with {provider}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push('/login')} variant="default">
                Back to Login
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Completing Sign In</CardTitle>
          <CardDescription>
            Please wait while we complete your {provider} sign-in...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  )
}
