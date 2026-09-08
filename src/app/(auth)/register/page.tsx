'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { authApi } from '@/lib/api'
import type { ApiError } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { OAuthButtons } from '@/components/auth'
import { Skeleton } from '@/components/ui/skeleton'

function RegisterLoading() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Mobile OTP verification state. The backend rejects signups without a
  // verification token, so the form can't be submitted until otpState is
  // 'verified'. Changing the mobile number resets the whole flow.
  const [otpState, setOtpState] = useState<'idle' | 'sent' | 'verified'>('idle')
  const [otpValue, setOtpValue] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpInfo, setOtpInfo] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  // The mobile number the current OTP flow is bound to
  const otpMobileRef = useRef<string | null>(null)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      acceptTerms: false,
    },
  })

  const watchedMobile = form.watch('mobile')

  // Reset verification if the user edits the mobile number after sending/verifying
  useEffect(() => {
    if (otpState !== 'idle' && watchedMobile !== otpMobileRef.current) {
      setOtpState('idle')
      setOtpValue('')
      setOtpError(null)
      setOtpInfo(null)
      setResendIn(0)
      setVerificationToken(null)
      otpMobileRef.current = null
    }
  }, [watchedMobile, otpState])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const resetOtpFlow = () => {
    setOtpState('idle')
    setOtpValue('')
    setResendIn(0)
    setVerificationToken(null)
    otpMobileRef.current = null
  }

  const handleSendOtp = async () => {
    setOtpError(null)
    setOtpInfo(null)
    const valid = await form.trigger('mobile')
    if (!valid) return

    const mobile = form.getValues('mobile')
    setOtpSending(true)
    try {
      const result = await authApi.requestSignupOtp(mobile)
      otpMobileRef.current = mobile
      setOtpState('sent')
      setOtpValue('')
      setResendIn(result.retryAfter || 60)
      setOtpInfo(`OTP sent to ${result.maskedMobile}`)
    } catch (error: unknown) {
      const apiError =
        error && typeof error === 'object' && 'code' in error ? (error as ApiError) : null
      if (apiError?.code === 'MOBILE_EXISTS') {
        form.setError('mobile', {
          type: 'server',
          message: 'This mobile number is already registered. Try signing in instead.',
        })
      } else if (apiError?.code === 'RATE_LIMIT_EXCEEDED') {
        setOtpError(apiError.message || 'Too many OTP requests. Please try again later.')
      } else {
        setOtpError(apiError?.message || 'Could not send OTP. Please try again.')
      }
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpValue.length < 4) {
      setOtpError('Please enter the OTP sent to your mobile')
      return
    }
    setOtpError(null)
    setOtpVerifying(true)
    try {
      const result = await authApi.verifySignupOtp(otpMobileRef.current ?? '', otpValue)
      setVerificationToken(result.verificationToken)
      setOtpState('verified')
      setOtpInfo(null)
    } catch (error: unknown) {
      const apiError =
        error && typeof error === 'object' && 'code' in error ? (error as ApiError) : null
      if (apiError?.code === 'MAX_ATTEMPTS_EXCEEDED') {
        setOtpError('Too many incorrect attempts. Please request a new OTP.')
        setOtpValue('')
      } else {
        setOtpError('Incorrect OTP. Please check and try again.')
      }
    } finally {
      setOtpVerifying(false)
    }
  }

  // Server-side validation errors come back keyed by DTO property name
  // (e.g. "Password"); map them onto the matching form fields.
  const serverFieldMap: Record<string, keyof RegisterFormData> = {
    name: 'name',
    email: 'email',
    password: 'password',
    mobile: 'mobile',
    acceptterms: 'acceptTerms',
  }

  const applyServerErrors = (error: ApiError): void => {
    const unmappedMessages: string[] = []
    let firstErrorField: keyof RegisterFormData | null = null

    for (const [key, messages] of Object.entries(error.errors ?? {})) {
      if (messages.length === 0) continue
      const field = serverFieldMap[key.toLowerCase().replace(/^request\./, '')]
      if (field) {
        form.setError(field, { type: 'server', message: messages.join(' ') })
        firstErrorField = firstErrorField ?? field
      } else {
        unmappedMessages.push(...messages)
      }
    }

    if (error.code === 'EMAIL_EXISTS') {
      form.setError('email', {
        type: 'server',
        message: 'This email is already registered. Try signing in instead.',
      })
      firstErrorField = firstErrorField ?? 'email'
    } else if (error.code === 'MOBILE_EXISTS') {
      form.setError('mobile', {
        type: 'server',
        message: 'This mobile number is already registered.',
      })
      firstErrorField = firstErrorField ?? 'mobile'
    } else if (error.code === 'MOBILE_NOT_VERIFIED' || error.code === 'MOBILE_REQUIRED') {
      // Verification token expired or was consumed — restart the OTP flow
      resetOtpFlow()
      form.setError('mobile', {
        type: 'server',
        message: 'Mobile verification expired. Please verify your number again.',
      })
      firstErrorField = firstErrorField ?? 'mobile'
    }

    if (firstErrorField) {
      setServerError(unmappedMessages.length > 0 ? unmappedMessages.join(' ') : null)
      form.setFocus(firstErrorField)
    } else {
      setServerError(
        [error.message || 'Registration failed. Please try again.', ...unmappedMessages].join(' ')
      )
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (otpState !== 'verified' || !verificationToken) {
      form.setError('mobile', {
        type: 'manual',
        message: 'Please verify your mobile number with OTP before creating your account.',
      })
      form.setFocus('mobile')
      return
    }

    setIsLoading(true)
    setServerError(null)
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
        acceptTerms: data.acceptTerms,
        mobileVerificationToken: verificationToken,
      })

      setIsSuccess(true)
      toast({
        title: 'Registration successful!',
        description: 'Please check your email to verify your account.',
        variant: 'success',
      })
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        applyServerErrors(error as ApiError)
      } else {
        setServerError('Registration failed. Please check your connection and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-foreground">
              {form.getValues('email')}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account and get started.
            The link will expire in 24 hours.
          </p>
          <div className="pt-4">
            <Button variant="outline" asChild>
              <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}>
                Back to login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details to get started with EffortlessInsight
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        autoComplete="tel"
                        maxLength={10}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    {otpState !== 'verified' && (
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
                        ) : otpState === 'sent' ? (
                          'Resend OTP'
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    )}
                  </div>
                  {otpState === 'verified' ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <ShieldCheck className="h-4 w-4" />
                      Mobile number verified
                    </p>
                  ) : (
                    <FormDescription>
                      We&apos;ll send an OTP to verify your number
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpState === 'sent' && (
              <div className="space-y-2 rounded-md border bg-muted/40 p-3">
                {otpInfo && (
                  <p className="text-sm text-muted-foreground">{otpInfo}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) =>
                      setOtpValue(e.target.value.replace(/\D/g, ''))
                    }
                    disabled={isLoading || otpVerifying}
                    autoComplete="one-time-code"
                  />
                  <Button
                    type="button"
                    className="shrink-0"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpVerifying || otpValue.length < 4}
                  >
                    {otpVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </div>
                {otpError && (
                  <p className="text-sm font-medium text-destructive">{otpError}</p>
                )}
              </div>
            )}
            {otpState !== 'sent' && otpError && (
              <p className="text-sm font-medium text-destructive">{otpError}</p>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    At least 8 characters with uppercase, lowercase, number,
                    and special character
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
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
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                      >
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
              disabled={isLoading || otpState !== 'verified'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : otpState !== 'verified' ? (
                'Verify mobile to continue'
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </Form>

        <OAuthButtons mode="register" disabled={isLoading} redirectTo={redirectTo || undefined} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
