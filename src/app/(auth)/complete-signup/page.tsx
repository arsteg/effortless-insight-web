'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'

import { completeSignupSchema, type CompleteSignupFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores'
import type { ApiError } from '@/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Google/Microsoft sign-ups land here (via auth-layout / dashboard-layout and the
// API's MOBILE_NOT_VERIFIED response) until they verify a mobile number with OTP.
export default function CompleteSignupPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, refreshUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpInfo, setOtpInfo] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  // The mobile number the current OTP was sent to
  const otpMobileRef = useRef<string | null>(null)

  const form = useForm<CompleteSignupFormData>({
    resolver: zodResolver(completeSignupSchema),
    defaultValues: { mobile: '', acceptTerms: false, isCA: false },
  })

  // This page needs a signed-in user
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

  // Pre-fill a number the account already has (older accounts with an unverified mobile)
  useEffect(() => {
    if (user?.mobile && !form.getValues('mobile')) {
      form.setValue('mobile', user.mobile.replace(/\D/g, '').slice(-10))
    }
  }, [user?.mobile, form])

  const watchedMobile = form.watch('mobile')

  // Editing the number after sending means a new OTP is needed
  useEffect(() => {
    if (otpSent && watchedMobile !== otpMobileRef.current) {
      setOtpSent(false)
      setOtpValue('')
      setOtpError(null)
      setOtpInfo(null)
      setResendIn(0)
      otpMobileRef.current = null
    }
  }, [watchedMobile, otpSent])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const getApiError = (error: unknown): ApiError | null =>
    error && typeof error === 'object' && 'code' in error ? (error as ApiError) : null

  const handleSendOtp = async () => {
    setOtpError(null)
    setOtpInfo(null)
    const valid = await form.trigger('mobile')
    if (!valid) return

    const mobile = form.getValues('mobile')
    setOtpSending(true)
    try {
      const result = await authApi.requestCompleteSignupOtp(mobile)
      otpMobileRef.current = mobile
      setOtpSent(true)
      setOtpValue('')
      setResendIn(result.retryAfter || 60)
      setOtpInfo(`OTP sent to ${result.maskedMobile}`)
    } catch (error: unknown) {
      const apiError = getApiError(error)
      if (apiError?.code === 'MOBILE_EXISTS') {
        form.setError('mobile', {
          type: 'server',
          message: 'This mobile number is already registered with another account.',
        })
      } else if (apiError?.code === 'ALREADY_VERIFIED') {
        await refreshUser()
      } else {
        setOtpError(apiError?.message || 'Could not send OTP. Please try again.')
      }
    } finally {
      setOtpSending(false)
    }
  }

  const onSubmit = async (data: CompleteSignupFormData) => {
    if (!otpSent || otpValue.length < 4) {
      setOtpError('Please enter the OTP sent to your mobile')
      return
    }

    setIsLoading(true)
    setServerError(null)
    setOtpError(null)
    try {
      await authApi.completeSignup({
        mobile: otpMobileRef.current ?? data.mobile,
        otp: otpValue,
        acceptTerms: data.acceptTerms,
        isCA: data.isCA,
      })
      // Once the profile says verified, auth-layout sends the user on to
      // onboarding, a pending invitation, or the dashboard
      await refreshUser()
    } catch (error: unknown) {
      const apiError = getApiError(error)
      if (apiError?.code === 'INVALID_OTP') {
        setOtpError('Incorrect OTP. Please check and try again.')
      } else if (apiError?.code === 'MAX_ATTEMPTS_EXCEEDED') {
        setOtpError('Too many incorrect attempts. Please request a new OTP.')
        setOtpValue('')
      } else if (apiError?.code === 'MOBILE_EXISTS') {
        form.setError('mobile', {
          type: 'server',
          message: 'This mobile number is already registered with another account.',
        })
      } else if (apiError?.code === 'ALREADY_VERIFIED') {
        await refreshUser()
      } else {
        setServerError(apiError?.message || 'Could not complete signup. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseDifferentAccount = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Complete your signup</CardTitle>
        <CardDescription>
          Verify your mobile number to start using EffortlessInsight
          {user?.email ? (
            <>
              {' '}as <span className="font-medium text-foreground">{user.email}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">
                          +91
                        </span>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          placeholder="9876543210"
                          autoComplete="tel"
                          maxLength={10}
                          disabled={isLoading}
                          className="pl-11"
                          {...field}
                          onChange={(e) => {
                            // Same normalisation as /register: bare 10 digits, no 91 / 0 prefix
                            let digits = e.target.value.replace(/\D/g, '')
                            if (digits.length > 10 && digits.startsWith('91')) {
                              digits = digits.slice(2)
                            }
                            if (digits.length > 10 && digits.startsWith('0')) {
                              digits = digits.slice(1)
                            }
                            field.onChange(digits.slice(0, 10))
                          }}
                        />
                      </div>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={handleSendOtp}
                      disabled={isLoading || otpSending || resendIn > 0}
                    >
                      {otpSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : resendIn > 0 ? (
                        `Resend in ${resendIn}s`
                      ) : otpSent ? (
                        'Resend OTP'
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  </div>
                  <FormDescription>We&apos;ll send an OTP to verify your number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpSent && (
              <div className="space-y-2 rounded-md border bg-muted/40 p-3">
                {otpInfo && <p className="text-sm text-muted-foreground">{otpInfo}</p>}
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                />
              </div>
            )}
            {otpError && <p className="text-sm font-medium text-destructive">{otpError}</p>}

            <FormField
              control={form.control}
              name="isCA"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="isCA"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="isCA"
                      className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I&apos;m a Chartered Accountant
                    </label>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline" target="_blank">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                        Privacy Policy
                      </Link>
                    </label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !otpSent || otpValue.length < 4}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify and continue'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground"
          onClick={handleUseDifferentAccount}
          disabled={isLoading}
        >
          Use a different account
        </Button>
      </CardFooter>
    </Card>
  )
}
