'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react'

import {
  caOnboardingSchema,
  type CaOnboardingFormData,
  industryOptions,
  stateOptions,
} from '@/lib/validations/onboarding'
import { caApi, organizationsApi } from '@/lib/api'
import { useAuthStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

function CaOnboardingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingGstin, setIsValidatingGstin] = useState(false)
  const [gstinValidation, setGstinValidation] = useState<{
    isValid: boolean
    stateName?: string
    errorMessage?: string
  } | null>(null)

  const form = useForm<CaOnboardingFormData>({
    resolver: zodResolver(caOnboardingSchema),
    defaultValues: {
      name: '',
      legalName: '',
      gstin: '',
      industry: '',
      state: '',
      city: '',
    },
  })

  // Redirect to dashboard if user already has an organization
  useEffect(() => {
    if (user?.organization || (user?.organizations && user.organizations.length > 0)) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Redirect non-CA users to regular onboarding
  useEffect(() => {
    if (user && !user.isCa) {
      router.push('/onboarding')
    }
  }, [user, router])

  // Validate GSTIN when it changes (optional for CA)
  const validateGstin = async (gstin: string) => {
    // Clear validation if empty (GSTIN is optional for CA)
    if (!gstin || gstin.length === 0) {
      setGstinValidation(null)
      return
    }

    if (gstin.length !== 15) {
      setGstinValidation(null)
      return
    }

    setIsValidatingGstin(true)
    try {
      const result = await organizationsApi.validateGstin(gstin)
      setGstinValidation({
        isValid: result.isValid,
        stateName: result.stateName,
        errorMessage: result.errorMessage,
      })

      // Auto-fill state if available
      if (result.isValid && result.stateName) {
        const stateMatch = stateOptions.find(
          (s) => s.label.toLowerCase() === result.stateName?.toLowerCase() ||
                 s.value.toLowerCase() === result.stateName?.toLowerCase()
        )
        if (stateMatch) {
          form.setValue('state', stateMatch.value)
        }
      }
    } catch {
      setGstinValidation({
        isValid: false,
        errorMessage: 'Failed to validate GSTIN',
      })
    } finally {
      setIsValidatingGstin(false)
    }
  }

  const onSubmit = async (data: CaOnboardingFormData) => {
    setIsLoading(true)
    try {
      await caApi.createOrganization({
        name: data.name,
        legalName: data.legalName || undefined,
        gstin: data.gstin || undefined,
        industry: data.industry || undefined,
        state: data.state,
        city: data.city || undefined,
      })

      // Refresh user to get updated organization info
      await refreshUser()

      toast({
        title: 'Organization created!',
        description: 'Welcome to EffortlessInsight. Your CA practice is ready to go.',
        variant: 'success',
      })

      router.push('/dashboard')
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Failed to create organization. Please try again.'

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if GSTIN is provided and invalid
  const gstinValue = form.watch('gstin')
  const hasInvalidGstin = gstinValue && gstinValue.length > 0 && gstinValidation !== null && !gstinValidation.isValid

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Set up your CA practice</CardTitle>
        <CardDescription className="text-base">
          Create your organization to start managing client GST notices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization / Firm Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your CA Firm Name"
                      autoComplete="organization"
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
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Legal Name{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Registered legal name"
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
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    GSTIN{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="22AAAAA0000A1Z5"
                        autoComplete="off"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          field.onChange(value)
                          validateGstin(value)
                        }}
                        className={
                          gstinValidation
                            ? gstinValidation.isValid
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }
                      />
                      {isValidatingGstin && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {gstinValidation && !isValidatingGstin && (
                        gstinValidation.isValid ? (
                          <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
                        )
                      )}
                    </div>
                  </FormControl>
                  {gstinValidation?.isValid && gstinValidation.stateName && (
                    <FormDescription className="text-green-600">
                      State: {gstinValidation.stateName}
                    </FormDescription>
                  )}
                  {gstinValidation && !gstinValidation.isValid && gstinValidation.errorMessage && (
                    <FormDescription className="text-red-500">
                      {gstinValidation.errorMessage}
                    </FormDescription>
                  )}
                  <FormDescription>
                    You can add your firm&apos;s GSTIN later if you don&apos;t have one now.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stateOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City{' '}
                      <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Industry{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertDescription className="text-sm">
                By creating an organization, you agree to our Terms of Service and Privacy Policy.
                You will be the owner of this organization.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || hasInvalidGstin}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating organization...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function CaOnboardingLoading() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Set up your CA practice</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function CaOnboardingPage() {
  return (
    <Suspense fallback={<CaOnboardingLoading />}>
      <CaOnboardingForm />
    </Suspense>
  )
}
