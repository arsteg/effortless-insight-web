'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CurrentPlanCard,
  UsageWidget,
  BillingHistory,
  PaymentMethods,
  ChangePlanModal,
  CancelSubscriptionModal,
  PauseSubscriptionModal,
  AddSeatsModal,
} from '@/components/features/billing'
import {
  useCurrentSubscription,
  useUsage,
  useInvoices,
  usePlans,
  useChangePlan,
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useReactivateSubscription,
  useAddSeats,
  useDownloadInvoice,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/use-billing'
import type { BillingCycle } from '@/types/billing'

export default function BillingSettingsPage() {
  const router = useRouter()
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showAddSeatsModal, setShowAddSeatsModal] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1)

  // Queries
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription()
  const { data: usage, isLoading: isLoadingUsage } = useUsage()
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices(invoicePage, 10)
  const { data: plans, isLoading: isLoadingPlans } = usePlans()
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods()

  // Mutations
  const changePlan = useChangePlan()
  const cancelSubscription = useCancelSubscription()
  const pauseSubscription = usePauseSubscription()
  const resumeSubscription = useResumeSubscription()
  const reactivateSubscription = useReactivateSubscription()
  const addSeats = useAddSeats()
  const downloadInvoice = useDownloadInvoice()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  const isLoading = isLoadingSubscription || isLoadingPlans

  const handleUpgrade = () => {
    if (subscription) {
      setShowChangePlanModal(true)
    } else {
      router.push('/checkout')
    }
  }

  const handleManageBilling = () => {
    setShowAddSeatsModal(true)
  }

  const handleCancel = () => {
    setShowCancelModal(true)
  }

  const handlePause = () => {
    setShowPauseModal(true)
  }

  const handleResume = () => {
    resumeSubscription.mutate()
  }

  const handleReactivate = () => {
    reactivateSubscription.mutate()
  }

  const handleChangePlanConfirm = (
    planCode: string,
    billingCycle: BillingCycle,
    immediate: boolean
  ) => {
    changePlan.mutate(
      {
        newPlanCode: planCode,
        billingCycle,
        effectiveDate: immediate ? 'immediate' : 'period_end',
      },
      {
        onSuccess: () => {
          setShowChangePlanModal(false)
        },
      }
    )
  }

  const handleCancelConfirm = (
    reason: string,
    feedback?: string,
    immediate?: boolean
  ) => {
    cancelSubscription.mutate(
      { reason, feedback, cancelImmediately: immediate ?? false },
      {
        onSuccess: () => {
          setShowCancelModal(false)
        },
      }
    )
  }

  const handlePauseConfirm = (reason: string, resumeAt?: string) => {
    pauseSubscription.mutate(
      { reason, resumeAt },
      {
        onSuccess: () => {
          setShowPauseModal(false)
        },
      }
    )
  }

  const handleAddSeatsConfirm = (quantity: number) => {
    addSeats.mutate(
      { additionalSeats: quantity },
      {
        onSuccess: () => {
          setShowAddSeatsModal(false)
        },
      }
    )
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    downloadInvoice.mutate(invoiceId)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
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
      <CurrentPlanCard
        subscription={subscription}
        isLoading={isLoadingSubscription}
        onUpgrade={handleUpgrade}
        onManage={handleManageBilling}
        onCancel={handleCancel}
        onPause={handlePause}
        onResume={handleResume}
        onReactivate={handleReactivate}
      />

      {/* Usage */}
      <UsageWidget usage={usage} isLoading={isLoadingUsage} />

      {/* Payment Methods */}
      <PaymentMethods
        paymentMethods={paymentMethods}
        isLoading={isLoadingPaymentMethods}
        onSetDefault={(id) => setDefaultPaymentMethod.mutate(id)}
        onDelete={(id) => deletePaymentMethod.mutate(id)}
        isSettingDefault={setDefaultPaymentMethod.isPending}
        isDeleting={deletePaymentMethod.isPending}
      />

      {/* Billing History */}
      <BillingHistory
        invoices={invoicesData?.invoices}
        isLoading={isLoadingInvoices}
        page={invoicePage}
        totalPages={invoicesData?.pagination.totalPages}
        onPageChange={setInvoicePage}
        onDownload={handleDownloadInvoice}
        isDownloading={downloadInvoice.isPending}
      />

      {/* Change Plan Modal */}
      {subscription && plans && (
        <ChangePlanModal
          open={showChangePlanModal}
          onOpenChange={setShowChangePlanModal}
          plans={plans}
          currentSubscription={subscription}
          onConfirm={handleChangePlanConfirm}
          isLoading={changePlan.isPending}
        />
      )}

      {/* Cancel Subscription Modal */}
      {subscription && (
        <CancelSubscriptionModal
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          subscription={subscription}
          onConfirm={handleCancelConfirm}
          isLoading={cancelSubscription.isPending}
        />
      )}

      {/* Pause Subscription Modal */}
      {subscription && (
        <PauseSubscriptionModal
          open={showPauseModal}
          onOpenChange={setShowPauseModal}
          subscription={subscription}
          onConfirm={handlePauseConfirm}
          isLoading={pauseSubscription.isPending}
        />
      )}

      {/* Add Seats Modal */}
      {subscription && (
        <AddSeatsModal
          open={showAddSeatsModal}
          onOpenChange={setShowAddSeatsModal}
          subscription={subscription}
          pricePerSeat={1000}
          onConfirm={handleAddSeatsConfirm}
          isLoading={addSeats.isPending}
        />
      )}
    </div>
  )
}
