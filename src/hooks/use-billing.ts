'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi, loadRazorpayScript } from '@/lib/api/billing'
import { useToast } from './use-toast'
import type {
  CreateSubscriptionRequest,
  VerifyPaymentRequest,
  ChangePlanRequest,
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
  AddSeatsRequest,
  ValidateCouponRequest,
  RazorpayPaymentResponse,
} from '@/types/billing'

// ============================================================================
// Query Keys
// ============================================================================

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoicesList: (page: number, limit: number) =>
    [...billingKeys.invoices(), 'list', page, limit] as const,
  invoice: (id: string) => [...billingKeys.invoices(), id] as const,
  usage: () => [...billingKeys.all, 'usage'] as const,
  paymentMethods: () => [...billingKeys.all, 'paymentMethods'] as const,
}

// ============================================================================
// Plans Queries
// ============================================================================

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const response = await billingApi.getPlans()
      return response.plans
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

// ============================================================================
// Subscription Queries
// ============================================================================

export function useCurrentSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: async () => {
      const response = await billingApi.getCurrentSubscription()
      return response.subscription
    },
    retry: false,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) =>
      billingApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create subscription',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: VerifyPaymentRequest) => billingApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() })
      toast({
        title: 'Payment successful',
        description: 'Your subscription has been activated.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment verification failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: ChangePlanRequest) => billingApi.changePlan(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      if (data.message) {
        toast({
          title: 'Plan change processed',
          description: data.message,
          variant: 'default',
        })
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to change plan',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) =>
      billingApi.cancelSubscription(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast({
        title: 'Subscription cancelled',
        description: data.message,
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel subscription',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useAddSeats() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: AddSeatsRequest) => billingApi.addSeats(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast({
        title: 'Seats added',
        description: 'Additional seats have been added to your subscription.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add seats',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => billingApi.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been reactivated.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to reactivate subscription',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function usePauseSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: PauseSubscriptionRequest) =>
      billingApi.pauseSubscription(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast({
        title: 'Subscription paused',
        description: data.scheduledResumeAt
          ? `Your subscription will automatically resume on ${new Date(data.scheduledResumeAt).toLocaleDateString()}.`
          : 'Your subscription has been paused. You can resume it anytime.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to pause subscription',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useResumeSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => billingApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast({
        title: 'Subscription resumed',
        description: 'Your subscription is now active again.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resume subscription',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ============================================================================
// Invoice Queries
// ============================================================================

export function useInvoices(page = 1, limit = 10) {
  return useQuery({
    queryKey: billingKeys.invoicesList(page, limit),
    queryFn: () => billingApi.getInvoices(page, limit),
  })
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: billingKeys.invoice(invoiceId),
    queryFn: () => billingApi.getInvoice(invoiceId),
    enabled: !!invoiceId,
  })
}

export function useDownloadInvoice() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await billingApi.downloadInvoicePdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to download invoice',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ============================================================================
// Usage Queries
// ============================================================================

export function useUsage() {
  return useQuery({
    queryKey: billingKeys.usage(),
    queryFn: () => billingApi.getUsage(),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

// ============================================================================
// Coupon Mutations
// ============================================================================

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: ValidateCouponRequest) => billingApi.validateCoupon(data),
  })
}

// ============================================================================
// Payment Methods
// ============================================================================

export function usePaymentMethods() {
  return useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: async () => {
      const response = await billingApi.getPaymentMethods()
      return response.paymentMethods
    },
  })
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      billingApi.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      toast({
        title: 'Default payment method updated',
        description: 'Your default payment method has been changed.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update payment method',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      billingApi.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      toast({
        title: 'Payment method deleted',
        description: 'The payment method has been removed.',
        variant: 'default',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete payment method',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ============================================================================
// Razorpay Checkout Hook
// ============================================================================

export function useRazorpayCheckout() {
  const { toast } = useToast()

  const openCheckout = async (
    options: {
      key: string
      amount: number
      currency: string
      name: string
      description: string
      orderId: string
      prefill?: {
        name?: string
        email?: string
        contact?: string
      }
      theme?: {
        color?: string
      }
    },
    onSuccess: (response: RazorpayPaymentResponse) => void,
    onDismiss?: () => void
  ) => {
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast({
        title: 'Payment failed',
        description: 'Failed to load payment gateway. Please try again.',
        variant: 'destructive',
      })
      return
    }

    const razorpayOptions = {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      theme: options.theme,
      handler: (response: RazorpayPaymentResponse) => {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: () => {
          onDismiss?.()
        },
      },
    }

    const razorpay = new window.Razorpay!(razorpayOptions)
    razorpay.open()
  }

  return { openCheckout }
}
