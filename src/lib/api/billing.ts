import { apiClient } from './client'
import type {
  PlansListResponse,
  Plan,
  CurrentSubscriptionResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  StartTrialRequest,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  PauseSubscriptionRequest,
  PauseSubscriptionResponse,
  ResumeSubscriptionResponse,
  AddSeatsRequest,
  AddSeatsResponse,
  Subscription,
  InvoiceListResponse,
  InvoiceDetail,
  ValidateCouponRequest,
  ValidateCouponResponse,
  Usage,
  UsageCheckResponse,
  PaymentMethodListResponse,
  PaymentMethod,
} from '@/types/billing'

/**
 * Billing API client
 */
export const billingApi = {
  // ============================================================================
  // Plans
  // ============================================================================

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<PlansListResponse> {
    const response = await apiClient.get<{ data: PlansListResponse }>('/plans')
    return response.data.data
  },

  /**
   * Get a specific plan by code
   */
  async getPlanByCode(code: string): Promise<Plan> {
    const response = await apiClient.get<{ data: Plan }>(`/plans/${code}`)
    return response.data.data
  },

  // ============================================================================
  // Subscriptions
  // ============================================================================

  /**
   * Get current organization's subscription
   */
  async getCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
    const response = await apiClient.get<{ data: CurrentSubscriptionResponse }>(
      '/subscriptions/current'
    )
    return response.data.data
  },

  /**
   * Create a new subscription (initiate checkout)
   */
  async createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post<{ data: CreateSubscriptionResponse }>(
      '/subscriptions',
      data
    )
    return response.data.data
  },

  /**
   * Start a free trial for a plan
   */
  async startTrial(data: StartTrialRequest): Promise<Subscription> {
    const response = await apiClient.post<{ data: Subscription }>(
      '/subscriptions/trial',
      data
    )
    return response.data.data
  },

  /**
   * Verify payment and activate subscription
   */
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post<{ data: VerifyPaymentResponse }>(
      '/subscriptions/verify',
      data
    )
    return response.data.data
  },

  /**
   * Change subscription plan (upgrade/downgrade)
   */
  async changePlan(data: ChangePlanRequest): Promise<ChangePlanResponse> {
    const response = await apiClient.put<{ data: ChangePlanResponse }>(
      '/subscriptions/current/plan',
      data
    )
    return response.data.data
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    data: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.delete<{ data: CancelSubscriptionResponse }>(
      '/subscriptions/current',
      { data }
    )
    return response.data.data
  },

  /**
   * Add additional seats to subscription
   */
  async addSeats(data: AddSeatsRequest): Promise<AddSeatsResponse> {
    const response = await apiClient.post<{ data: AddSeatsResponse }>(
      '/subscriptions/current/seats',
      data
    )
    return response.data.data
  },

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(): Promise<Subscription> {
    const response = await apiClient.post<{ data: Subscription }>(
      '/subscriptions/current/reactivate'
    )
    return response.data.data
  },

  /**
   * Pause subscription
   */
  async pauseSubscription(
    data: PauseSubscriptionRequest
  ): Promise<PauseSubscriptionResponse> {
    const response = await apiClient.post<{ data: PauseSubscriptionResponse }>(
      '/subscriptions/current/pause',
      data
    )
    return response.data.data
  },

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(): Promise<ResumeSubscriptionResponse> {
    const response = await apiClient.post<{ data: ResumeSubscriptionResponse }>(
      '/subscriptions/current/resume'
    )
    return response.data.data
  },

  // ============================================================================
  // Invoices
  // ============================================================================

  /**
   * Get organization's invoices
   */
  async getInvoices(page = 1, limit = 10): Promise<InvoiceListResponse> {
    const response = await apiClient.get<{ data: InvoiceListResponse }>(
      '/invoices',
      { params: { page, limit } }
    )
    return response.data.data
  },

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<InvoiceDetail> {
    const response = await apiClient.get<{ data: InvoiceDetail }>(
      `/invoices/${invoiceId}`
    )
    return response.data.data
  },

  /**
   * Download invoice PDF
   */
  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    const response = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  // ============================================================================
  // Usage
  // ============================================================================

  /**
   * Get current usage for the organization
   */
  async getUsage(): Promise<Usage> {
    const response = await apiClient.get<{ data: Usage }>('/usage')
    return response.data.data
  },

  /**
   * Check if a specific action can be performed
   */
  async checkUsage(action: string): Promise<UsageCheckResponse> {
    const response = await apiClient.get<{ data: UsageCheckResponse }>(
      `/usage/check/${action}`
    )
    return response.data.data
  },

  /**
   * Get usage percentage for a specific metric
   */
  async getUsagePercentage(metric: string): Promise<number> {
    const response = await apiClient.get<{ data: { percentage: number } }>(
      `/usage/percentage/${metric}`
    )
    return response.data.data.percentage
  },

  // ============================================================================
  // Coupons
  // ============================================================================

  /**
   * Validate a coupon code
   */
  async validateCoupon(data: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    const response = await apiClient.post<{ data: ValidateCouponResponse }>(
      '/coupons/validate',
      data
    )
    return response.data.data
  },

  // ============================================================================
  // Payment Methods
  // ============================================================================

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethodListResponse> {
    const response = await apiClient.get<{ data: PaymentMethodListResponse }>(
      '/payment-methods'
    )
    return response.data.data
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await apiClient.post<{ data: PaymentMethod }>(
      `/payment-methods/${paymentMethodId}/set-default`
    )
    return response.data.data
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiClient.delete(`/payment-methods/${paymentMethodId}`)
  },
}

/**
 * Format amount from paise to INR string
 */
export function formatAmount(amountInPaise: number, currency = 'INR'): string {
  const amount = amountInPaise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get billing cycle label
 */
export function getBillingCycleLabel(cycle: string): string {
  return cycle === 'annually' ? 'per year' : 'per month'
}

/**
 * Get subscription status badge variant
 */
export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'trialing':
      return 'secondary'
    case 'paused':
      return 'outline'
    case 'past_due':
    case 'cancelled':
    case 'expired':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Get invoice status badge variant
 */
export function getInvoiceStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default'
    case 'pending':
    case 'draft':
      return 'secondary'
    case 'void':
    case 'refunded':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Load Razorpay checkout script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
