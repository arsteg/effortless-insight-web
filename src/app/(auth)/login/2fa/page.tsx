'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function TwoFactorLoading() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<TwoFactorLoading />}>
      <TwoFactorForm />
    </Suspense>
  )
}

function TwoFactorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const setUser = useAuthStore((state) => state.setUser)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const partialToken = searchParams.get('partialToken')

  // Redirect to login if no partialToken
  if (!partialToken) {
    router.replace('/login')
    return null
  }

  const onSubmit = async () => {
    if (code.length !== 6) return

    setIsLoading(true)
    try {
      // Complete 2FA login (stores tokens)
      await authApi.login2fa(partialToken, code)

      // Fetch user data and update auth store
      const user = await authApi.getMe()
      setUser(user)

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        variant: 'success',
      })

      // Check for stored OAuth redirect
      const redirectTo = sessionStorage.getItem('oauth_redirect') || '/dashboard'
      sessionStorage.removeItem('oauth_redirect')
      router.push(redirectTo)
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Invalid verification code. Please try again.'

      toast({
        title: 'Verification failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg font-mono tracking-widest"
            disabled={isLoading}
            autoFocus
          />
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Button
          onClick={onSubmit}
          className="w-full"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <Link href="/login">
          <Button variant="ghost" className="w-full" disabled={isLoading}>
            Back to login
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
