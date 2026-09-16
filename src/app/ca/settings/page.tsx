'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Building2, CheckCircle, Shield } from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const profileSchema = z.object({
  firmName: z.string().max(255, 'Firm name must be less than 255 characters').optional(),
  membershipNumber: z
    .string()
    .max(50, 'Membership number must be less than 50 characters')
    .optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function CaSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { profile, loadProfile, isLoadingProfile } = useCaStore()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firmName: profile?.firmName || '',
      membershipNumber: profile?.membershipNumber || '',
    },
  })

  // Update form when profile loads
  useState(() => {
    if (profile) {
      form.reset({
        firmName: profile.firmName || '',
        membershipNumber: profile.membershipNumber || '',
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      caApi.updateProfile({
        firmName: data.firmName || undefined,
        membershipNumber: data.membershipNumber || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ca-profile'] })
      loadProfile()
      toast({
        title: 'Profile updated',
        description: 'Your CA profile has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync(data)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingProfile || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CA Settings</h1>
        <p className="text-muted-foreground">Manage your CA profile and preferences</p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{profile.userName}</CardTitle>
                <CardDescription>{profile.userEmail}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.isVerified ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified CA
                </Badge>
              ) : (
                <Badge variant="secondary">Pending Verification</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{profile.activeClientCount}</p>
              <p className="text-sm text-muted-foreground">Active Clients</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{profile.pendingInvitationCount}</p>
              <p className="text-sm text-muted-foreground">Pending Invitations</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold capitalize">{profile.status}</p>
              <p className="text-sm text-muted-foreground">Account Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <CardDescription>
            Update your CA firm and membership information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your CA firm name"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of your CA practice or firm
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="membershipNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICAI Membership Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 123456"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your Institute of Chartered Accountants of India membership number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.isVerified ? (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Your CA account is verified
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Verified on {new Date(profile.verifiedAt!).toLocaleDateString()}. Your clients
                  will see a verified badge next to your name.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <Shield className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Verification pending
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  Your CA account is pending verification. Add your ICAI membership number to speed
                  up the verification process.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Profile ID</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{profile.id}</code>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">User ID</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{profile.userId}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
