'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CreditCard, Clock, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SubscriptionRequiredPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState<{
    error: string | null
    status: string | null
  }>({
    error: null,
    status: null,
  })

  useEffect(() => {
    setErrorDetails({
      error: searchParams.get('error'),
      status: searchParams.get('status'),
    })
  }, [searchParams])

  const getErrorMessage = () => {
    if (errorDetails.error === 'TRIAL_EXPIRED') {
      return {
        icon: Clock,
        variant: 'default' as const,
        title: 'Your free trial has expired',
        description:
          'Your trial period has ended. Upgrade to a paid plan to continue using EffortlessInsight and access all your data.',
      }
    }

    if (errorDetails.error === 'SUBSCRIPTION_REQUIRED' || errorDetails.status === 'none') {
      return {
        icon: CreditCard,
        variant: 'default' as const,
        title: 'Subscription required',
        description:
          'You need an active subscription to access this feature. Choose a plan that works for you and start your free trial today.',
      }
    }

    if (errorDetails.status === 'expired') {
      return {
        icon: XCircle,
        variant: 'destructive' as const,
        title: 'Subscription expired',
        description:
          'Your subscription has expired. Renew your subscription to regain access to all features.',
      }
    }

    if (errorDetails.status === 'cancelled') {
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        title: 'Subscription cancelled',
        description:
          'Your subscription was cancelled. Reactivate or choose a new plan to continue using EffortlessInsight.',
      }
    }

    return {
      icon: AlertCircle,
      variant: 'default' as const,
      title: 'Access restricted',
      description:
        'Your current subscription status does not allow access to this feature. Please upgrade your plan.',
    }
  }

  const errorInfo = getErrorMessage()
  const Icon = errorInfo.icon

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`h-16 w-16 rounded-full ${
              errorInfo.variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
            } flex items-center justify-center`}>
              <Icon className={`h-8 w-8 ${
                errorInfo.variant === 'destructive' ? 'text-destructive' : 'text-primary'
              }`} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
          <CardDescription className="text-base">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorDetails.status && (
            <Alert variant={errorInfo.variant}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Current Status</AlertTitle>
              <AlertDescription>
                Your subscription status is: <strong className="capitalize">{errorDetails.status}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold text-sm">What you'll get with a subscription:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Full access to all features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Unlimited GST notice management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>AI-powered analysis and insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Priority support and updates</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">View Plans & Pricing</Link>
          </Button>

          {errorDetails.status === 'expired' || errorDetails.status === 'cancelled' ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/billing">Manage Subscription</Link>
            </Button>
          ) : null}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-2">
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
