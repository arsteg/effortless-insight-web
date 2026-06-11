'use client'

import { ArrowLeft, CreditCard, Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganization } from '@/hooks/use-settings'

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusVariant(status?: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'trial':
      return 'secondary'
    case 'suspended':
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function BillingSettingsPage() {
  const { data: organization, isLoading } = useOrganization()
  const subscription = organization?.subscription

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
          <CardContent>
            <Skeleton className="h-32 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods.
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {subscription?.planName || 'Free Plan'}
                  </h3>
                  <Badge variant={getStatusVariant(subscription?.status)}>
                    {subscription?.status || 'No subscription'}
                  </Badge>
                </div>

                {subscription?.status === 'trial' && subscription.trialEndsAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Trial ends: {formatDate(subscription.trialEndsAt)}
                  </div>
                )}

                {subscription?.status === 'active' && subscription.currentPeriodEnd && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Next billing: {formatDate(subscription.currentPeriodEnd)}
                  </div>
                )}
              </div>

              <Button variant="outline">Change Plan</Button>
            </div>

            {/* Plan Features */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-4">Plan Features</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Unlimited notices',
                  'AI-powered analysis',
                  'Team collaboration',
                  'Document management',
                  'Email notifications',
                  'Priority support',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for subscription billing.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No payment methods added yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Payment method management will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              No billing history available.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Invoices will appear here once you start a paid subscription.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
