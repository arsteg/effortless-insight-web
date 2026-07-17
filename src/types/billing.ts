// ============================================================================
// Plan Types
// ============================================================================

export interface Plan {
  id: string
  code: string
  name: string
  displayName: string
  description?: string
  pricing: PlanPricing
  limits: PlanLimits
  features: string[]
  isPopular: boolean
  trialDays: number
  contactSales: boolean
}

export interface PlanPricing {
  monthly?: number
  annually?: number
  currency: string
  annualDiscount?: number
  perSeat?: PerSeatPricing
}

export interface PerSeatPricing {
  monthly?: number
  annually?: number
}

export interface PlanLimits {
  noticesPerMonth: number
  users: number
  storageGb: number
  organizationsCount: number
  additionalUsersAllowed: boolean
  apiCalls: number
  apiCallsPerMonth?: number
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  period: string
}

export interface PlansListResponse {
  plans: Plan[]
  addOns?: AddOn[]
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface CurrentSubscriptionResponse {
  subscription: Subscription
  usage: Usage
}

export interface Subscription {
  id: string
  planCode: string
  planName: string
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  isTrialing: boolean
  trialDaysRemaining?: number
  seats: Seats
  pricing: SubscriptionPricing
  nextBillingDate: string
  paymentMethod?: PaymentMethodSummary
  razorpaySubscriptionId?: string
  scheduledChange?: ScheduledChange
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused'
export type BillingCycle = 'monthly' | 'annually'

export interface Seats {
  included: number
  additional: number
  used: number
}

export interface SubscriptionPricing {
  baseAmount: number
  additionalSeatsAmount: number
  subtotal: number
  gstRate: number
  gstAmount: number
  total: number
  currency: string
}

export interface PaymentMethodSummary {
  type: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  upiId?: string
}

export interface ScheduledChange {
  planCode: string
  billingCycle?: string
  effectiveDate: string
}

export interface Usage {
  period: UsagePeriod
  notices: UsageMetric
  users: UsageMetric
  storage: StorageUsage
  apiCalls?: UsageMetric
  alerts?: UsageAlert[]
}

export interface UsagePeriod {
  start: string
  end: string
}

export interface UsageMetric {
  used: number
  limit: number
  percentage: number
  remaining: number
}

export interface StorageUsage {
  usedBytes: number
  usedGb: number
  limitGb: number
  percentage: number
  remainingGb: number
}

export interface UsageAlert {
  type: string
  level: 'warning' | 'critical'
  message: string
}

// ============================================================================
// Create Subscription Types
// ============================================================================

export interface CreateSubscriptionRequest {
  planCode: string
  billingCycle: BillingCycle
  additionalSeats: number
  billingDetails: BillingDetailsRequest
  couponCode?: string
  autoRenew: boolean
}

export interface StartTrialRequest {
  planCode: string
  billingCycle: BillingCycle
}

export interface BillingDetailsRequest {
  organizationName: string
  gstin?: string
  address: string
  addressLine2?: string
  city?: string
  state: string
  pincode: string
  email?: string
  phone?: string
}

export interface CreateSubscriptionResponse {
  subscriptionId: string
  razorpayOrder: RazorpayOrder
  checkoutOptions: CheckoutOptions
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  key: string
}

export interface CheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  orderId: string
  prefill: CheckoutPrefill
  theme: CheckoutTheme
}

export interface CheckoutPrefill {
  name?: string
  email?: string
  contact?: string
}

export interface CheckoutTheme {
  color: string
}

// ============================================================================
// Verify Payment Types
// ============================================================================

export interface VerifyPaymentRequest {
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  success: boolean
  subscription: SubscriptionActivated
  invoice?: InvoiceSummary
}

export interface SubscriptionActivated {
  id: string
  status: string
  planCode: string
  activatedAt: string
}

export interface InvoiceSummary {
  id: string
  number: string
  downloadUrl: string
}

// ============================================================================
// Plan Change Types
// ============================================================================

export interface ChangePlanRequest {
  newPlanCode: string
  billingCycle: BillingCycle
  additionalSeats?: number
  effectiveDate: 'immediate' | 'period_end'
}

export interface ChangePlanResponse {
  type: 'upgrade' | 'downgrade'
  prorationAmount?: number
  newPlanAmount?: number
  totalDue?: number
  effectiveImmediately: boolean
  razorpayOrder?: RazorpayOrder
  scheduledPlanCode?: string
  effectiveDate?: string
  message?: string
}

// ============================================================================
// Cancel Subscription Types
// ============================================================================

export interface CancelSubscriptionRequest {
  reason: string
  feedback?: string
  cancelImmediately: boolean
}

export interface CancelSubscriptionResponse {
  subscription: SubscriptionCancelled
  message: string
}

export interface SubscriptionCancelled {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  cancellationDate?: string
}

// ============================================================================
// Pause/Resume Subscription Types
// ============================================================================

export interface PauseSubscriptionRequest {
  reason: string
  resumeAt?: string
}

export interface PauseSubscriptionResponse {
  subscriptionId: string
  status: string
  pausedAt?: string
  scheduledResumeAt?: string
}

export interface ResumeSubscriptionResponse {
  subscriptionId: string
  status: string
  currentPeriodEnd: string
}

// ============================================================================
// Add Seats Types
// ============================================================================

export interface AddSeatsRequest {
  additionalSeats: number
}

export interface AddSeatsResponse {
  totalSeats: number
  prorationAmount: number
  razorpayOrder?: RazorpayOrder
}

// ============================================================================
// Invoice Types
// ============================================================================

export interface InvoiceListResponse {
  invoices: Invoice[]
  pagination: BillingPagination
}

export interface Invoice {
  id: string
  number: string
  invoiceNumber: string
  date: string
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
  description?: string
  pdfUrl: string
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'void' | 'refunded'

export interface InvoiceDetail extends Invoice {
  discountDescription?: string
  taxRate: number
  taxAmount: number
  cgstAmount?: number
  sgstAmount?: number
  igstAmount?: number
  amountPaid: number
  amountDue: number
  hsnCode: string
  placeOfSupply?: string
  isInterState: boolean
  billingDetails: InvoiceBillingDetails
  lineItems: InvoiceLineItem[]
  notes?: string
  paidAt?: string
}

export interface InvoiceBillingDetails {
  organizationName: string
  gstin?: string
  address: string
  city?: string
  state: string
  stateCode?: string
  pincode: string
  country: string
  email?: string
  phone?: string
}

export interface InvoiceLineItem {
  type: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  hsnCode?: string
  periodStart?: string
  periodEnd?: string
}

export interface BillingPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================================================
// Coupon Types
// ============================================================================

export interface ValidateCouponRequest {
  code?: string
  couponCode?: string
  planCode: string
  billingCycle: BillingCycle
}

export interface ValidateCouponResponse {
  isValid: boolean
  errorMessage?: string
  coupon?: CouponDetails
}

export interface CouponDetails {
  code: string
  description?: string
  discountType: 'percent' | 'fixed' | 'percentage'
  discountValue: number
  maxDiscountAmount?: number
  calculatedDiscount: number
}

// Alias for component compatibility
export interface CouponValidation {
  valid: boolean
  couponCode?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  maxDiscountAmount?: number
  message?: string
}

// ============================================================================
// Payment Method Types
// ============================================================================

export interface PaymentMethodListResponse {
  paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
  id: string
  type: string
  isDefault: boolean
  cardLast4?: string
  cardBrand?: string
  cardExpiryMonth?: number
  cardExpiryYear?: number
  cardName?: string
  upiId?: string
  lastUsedAt?: string
}

// ============================================================================
// Usage Check Types
// ============================================================================

export interface UsageCheckResponse {
  canPerform: boolean
  reason?: string
}

// ============================================================================
// Razorpay Window Types
// ============================================================================

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  handler: (response: RazorpayPaymentResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayInstance {
  open: () => void
  close: () => void
}
