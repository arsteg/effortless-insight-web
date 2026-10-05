'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, AlertCircle, Building2, XCircle } from 'lucide-react'

import {
  acceptCaClientInvitationSchema,
  type AcceptCaClientInvitationFormData,
  industryOptions,
  stateOptions,
  turnoverOptions,
} from '@/lib/validations/onboarding'
import {
  useCaClientInvitationDetails,
  useCaClientInvitationDetailsWithContext,
  useDeclineCaClientInvitation,
  useLinkCaClientInvitation,
} from '@/hooks/use-ca-clients'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { caClientsApi, organizationsApi, authApi } from '@/lib/api'
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

type MutationState = 'idle' | 'accepting' | 'declining' | 'accepted' | 'declined'

interface ErrorInfo {
  code: string
  message: string
}

export default function AcceptCaClientInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, isInitialized, refreshUser } = useAuthStore()
  const token = params.token as string

  const [mutationState, setMutationState] = useState<MutationState>('idle')
  const [mutationError, setMutationError] = useState<ErrorInfo | null>(null)
  const [resultOrgName, setResultOrgName] = useState<string>('')
  const [noticeCounts, setNoticeCounts] = useState<{ merged: number; new: number } | null>(null)

  // Use the anonymous endpoint for initial load, then switch to the context-aware
  // endpoint once authenticated to detect existing organizations
  const { data: basicInvitation, isLoading: basicInvitationLoading, error: basicInvitationError } =
    useCaClientInvitationDetails(token)
  const { data: contextInvitation, isLoading: contextInvitationLoading, error: contextInvitationError } =
    useCaClientInvitationDetailsWithContext(token, isAuthenticated)

  // Use context-aware data when authenticated, fall back to basic
  const invitation = isAuthenticated ? contextInvitation : basicInvitation
  const invitationLoading = isAuthenticated ? contextInvitationLoading : basicInvitationLoading
  const invitationError = isAuthenticated ? contextInvitationError : basicInvitationError

  const declineMutation = useDeclineCaClientInvitation()
  const linkMutation = useLinkCaClientInvitation()

  const form = useForm<AcceptCaClientInvitationFormData>({
    resolver: zodResolver(acceptCaClientInvitationSchema),
    defaultValues: {
      name: '',
      legalName: '',
      industry: '',
      state: '',
      city: '',
      annualTurnoverRange: '',
    },
  })

  // Wait for auth to initialize, then require login (same pattern as the
  // existing organization-invitation accept page) before showing the form.
  // This is the only real side effect on this page (a navigation); the
  // ready/loading/error UI below is derived directly from query state instead
  // of being copied into local state.
  useEffect(() => {
    if (!isInitialized || authLoading) return

    if (!isAuthenticated) {
      const currentUrl = window.location.pathname
      localStorage.setItem('pendingInvitationUrl', currentUrl)
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [authLoading, isAuthenticated, isInitialized, router])

  // Pre-fill an organization name suggestion from the CA's own label for this
  // client, once the invitation loads.
  useEffect(() => {
    if (invitation?.clientDisplayName) {
      form.setValue('name', invitation.clientDisplayName)
    }
    // form is a stable react-hook-form object; omitting it avoids re-running on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation])

  const selectOrganization = async (organizationId: string) => {
    await authApi.switchOrganization({ organizationId })
    const { organizations } = await organizationsApi.list()
    const organization = organizations.find((org) => org.id === organizationId)
    if (!organization) throw new Error('Organization not found')
    useOrganizationStore.getState().setCurrentOrganization(organization)
    await refreshUser()
  }

  const activatePlan = async (organizationId: string) => {
    localStorage.setItem('pendingInvitationUrl', `/ca-invitations/${token}`)
    await selectOrganization(organizationId)
    router.push('/select-plan')
  }

  const handleAccept = async (data: AcceptCaClientInvitationFormData) => {
    setMutationState('accepting')
    setMutationError(null)
    try {
      const result = await caClientsApi.prepareOrganization(token, {
        organizationName: data.name,
        legalName: data.legalName || undefined,
        industry: data.industry || undefined,
        state: data.state,
        city: data.city || undefined,
        annualTurnoverRange: data.annualTurnoverRange || undefined,
      })
      await activatePlan(result.organizationId)
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string }
      setMutationError({ code: apiError.code || 'UNKNOWN_ERROR', message: apiError.message || 'Unable to prepare your organization.' })
      setMutationState('idle')
    }
  }

  const handleDecline = async () => {
    setMutationState('declining')
    setMutationError(null)

    try {
      await declineMutation.mutateAsync(token)
      setMutationState('declined')
      localStorage.removeItem('pendingInvitationUrl')
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string }
      const code = apiError.code || 'UNKNOWN_ERROR'
      setMutationError({ code, message: getErrorMessage(code) })
      setMutationState('idle')
    }
  }

  const handleLink = async () => {
    const existingOrg = (invitation as { existingOrganization?: { organizationId: string } })?.existingOrganization
    if (!existingOrg) return

    setMutationState('accepting')
    setMutationError(null)

    try {
      const result = await linkMutation.mutateAsync({
        token,
        data: { existingOrganizationId: existingOrg.organizationId },
      })

      setResultOrgName(result.organizationName)
      setNoticeCounts({ merged: result.mergedNoticeCount, new: result.newNoticeCount })
      setMutationState('accepted')

      await selectOrganization(result.organizationId)

      localStorage.removeItem('pendingInvitationUrl')
      await refreshUser()

      setTimeout(() => {
        router.push('/dashboard')
      }, 2500)
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string }
      const code = apiError.code || 'UNKNOWN_ERROR'
      if (code === 'SUBSCRIPTION_REQUIRED') {
        try { await activatePlan(existingOrg.organizationId); return }
        catch { setMutationError({ code, message: 'Unable to open plan selection. Please try again.' }) }
      } else {
        setMutationError({ code, message: apiError.message || getErrorMessage(code) })
      }
      setMutationState('idle')
    }
  }

  // Derive the invitation-fetch error directly from query state - no local
  // state copy needed.
  const invitationErrorInfo: ErrorInfo | null = invitationError
    ? (() => {
        const apiError = invitationError as unknown as { code?: string; message?: string }
        const code = apiError.code || 'INVALID_INVITATION'
        return { code, message: getErrorMessage(code) }
      })()
    : null

  const error = mutationError ?? invitationErrorInfo

  if (!isInitialized || authLoading || !isAuthenticated) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Loading invitation...</CardTitle>
          <CardDescription className="text-base">
            Please wait while we verify your invitation.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (mutationState === 'idle' && invitationLoading) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Loading invitation...</CardTitle>
          <CardDescription className="text-base">
            Please wait while we verify your invitation.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (mutationState === 'idle' && invitation && !mutationError) {
    // Check if the user already has an organization with this GSTIN
    const existingOrg = (invitation as { existingOrganization?: { organizationId: string; organizationName: string; role: string } })?.existingOrganization

    // Simplified "Grant Access" UI when linking to existing organization
    if (existingOrg) {
      return (
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Accept invitation</CardTitle>
            <CardDescription className="text-base">
              <strong>{invitation.caOrganizationName}</strong> is requesting access to help manage
              GST notices for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation.message && (
              <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3">
                <p className="text-sm italic text-muted-foreground">&ldquo;{invitation.message}&rdquo;</p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Organization</span>
                <span className="font-medium">{existingOrg.organizationName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GSTIN</span>
                <span className="font-mono text-sm">{invitation.gstin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CA Firm</span>
                <span className="font-medium">{invitation.caOrganizationName}</span>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                Granting access will allow {invitation.caOrganizationName} to view and help manage
                GST notices for this GSTIN. Existing CA-managed notices and related work will become owned by your organization. An active plan is required; you can activate one before accepting.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button onClick={handleLink} className="w-full">
                Accept and transfer existing work
              </Button>
              <Button type="button" variant="outline" onClick={handleDecline} className="w-full">
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Standard "Set up your organization" form when no existing org
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Set up your organization</CardTitle>
          <CardDescription className="text-base">
            <strong>{invitation.caOrganizationName}</strong> has invited you to manage GST
            notices for GSTIN <strong>{invitation.gstin}</strong> on EffortlessInsight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitation.message && (
            <div className="mb-4 rounded-md border-l-4 border-primary bg-muted/50 p-3">
              <p className="text-sm italic text-muted-foreground">&ldquo;{invitation.message}&rdquo;</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAccept)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" autoComplete="organization" {...field} />
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
                      <Input placeholder="Registered legal name" {...field} />
                    </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        <Input placeholder="City" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="annualTurnoverRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Annual Turnover{' '}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select turnover range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {turnoverOptions.map((option) => (
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
                  You will be the owner of this organization, its GSTIN, its data, and its
                  subscription. {invitation.caOrganizationName} will have permission-based
                  access after you activate a plan and accept the invitation. Your CA can continue working while you complete setup.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  Create organization and choose a plan
                </Button>
                <Button type="button" variant="outline" onClick={handleDecline} className="w-full">
                  Decline Invitation
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  if (mutationState === 'accepting') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Setting up your organization...</CardTitle>
          <CardDescription className="text-base">Please wait.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (mutationState === 'declining') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Declining invitation...</CardTitle>
          <CardDescription className="text-base">Please wait.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (mutationState === 'accepted') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-mint-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Organization created!</CardTitle>
          <CardDescription className="text-base">
            {resultOrgName || 'Your organization'} is ready.
            {noticeCounts && (noticeCounts.merged + noticeCounts.new) > 0 && (
              <>
                {' '}
                {noticeCounts.merged + noticeCounts.new} notice
                {noticeCounts.merged + noticeCounts.new === 1 ? '' : 's'} your CA already synced
                {noticeCounts.merged > 0 ? ' have' : ' has'} been imported.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mutationState === 'declined') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Invitation Declined</CardTitle>
          <CardDescription className="text-base">You have declined this invitation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Invitation Error</CardTitle>
        <CardDescription className="text-base">
          {error?.message || 'Something went wrong with this invitation.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{getErrorHelp(error?.code)}</p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in with different account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(code: string): string {
  const baseCode = code.split(':')[0].trim()

  switch (baseCode) {
    case 'INVALID_INVITATION':
      return 'This invitation link is invalid or has already been used.'
    case 'INVITATION_EXPIRED':
      return 'This invitation has expired.'
    case 'INVITATION_CANCELLED':
      return 'This invitation has been cancelled.'
    case 'INVITATION_DECLINED':
      return 'This invitation has already been declined.'
    case 'INVITATION_ACCEPTED':
      return 'This invitation has already been accepted.'
    case 'EMAIL_MISMATCH':
      return 'Your email address does not match the invitation.'
    case 'GSTIN_ALREADY_CLAIMED':
    case 'GSTIN_EXISTS':
      return 'This GSTIN is already registered with another organization.'
    case 'ORGANIZATION_NOT_FOUND_OR_NOT_AUTHORIZED':
      return 'Organization not found or you do not have permission.'
    case 'GSTIN_MISMATCH':
      return 'The organization GSTIN does not match the invitation.'
    case 'CA_ALREADY_MEMBER':
      return 'This CA is already a member of your organization.'
    case 'INTERNAL_ERROR':
      return 'A server error occurred. Please try again or contact support.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

function getErrorHelp(code?: string): string {
  const baseCode = code?.split(':')[0].trim()

  switch (baseCode) {
    case 'INVALID_INVITATION':
      return 'Please ask your CA to send you a new invitation.'
    case 'INVITATION_EXPIRED':
      return 'Please ask your CA to resend the invitation.'
    case 'EMAIL_MISMATCH':
      return 'Please sign in with the email address that received the invitation.'
    case 'GSTIN_ALREADY_CLAIMED':
    case 'GSTIN_EXISTS':
      return 'If you believe this is a mistake, please contact your CA or support.'
    case 'CA_ALREADY_MEMBER':
      return 'This CA already has access to your organization.'
    case 'ORGANIZATION_NOT_FOUND_OR_NOT_AUTHORIZED':
    case 'GSTIN_MISMATCH':
      return 'Please contact support if you believe this is an error.'
    default:
      return 'If the problem persists, please contact support.'
  }
}
