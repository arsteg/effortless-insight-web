'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Building2, Loader2, MapPin, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { useOrganization, useUpdateOrganization, useAddGstin, useRemoveGstin, useValidateGstin } from '@/hooks/use-settings'

const organizationFormSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  legalName: z.string().optional(),
  displayName: z.string().optional(),
  industry: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  pan: z.string().optional(),
})

type OrganizationFormValues = z.infer<typeof organizationFormSchema>

const gstinFormSchema = z.object({
  gstin: z.string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  isPrimary: z.boolean().optional(),
})

type GstinFormValues = z.infer<typeof gstinFormSchema>

const industryOptions = [
  'Manufacturing',
  'Trading',
  'Services',
  'IT & Software',
  'Healthcare',
  'Education',
  'Retail',
  'Construction',
  'Real Estate',
  'Finance',
  'Other',
]

export default function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganization()
  const updateMutation = useUpdateOrganization()
  const addGstinMutation = useAddGstin()
  const removeGstinMutation = useRemoveGstin()
  const validateGstinMutation = useValidateGstin()

  const [showAddGstinDialog, setShowAddGstinDialog] = useState(false)

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      legalName: '',
      displayName: '',
      industry: '',
      email: '',
      phone: '',
      website: '',
      pan: '',
    },
    values: organization
      ? {
          name: organization.name,
          legalName: organization.legalName || '',
          displayName: organization.displayName || '',
          industry: organization.industry || '',
          email: organization.email || '',
          phone: organization.phone || '',
          website: organization.website || '',
          pan: organization.pan || '',
        }
      : undefined,
  })

  const onSubmit = (data: OrganizationFormValues) => {
    updateMutation.mutate(data)
  }

  const gstinForm = useForm<GstinFormValues>({
    resolver: zodResolver(gstinFormSchema),
    defaultValues: {
      gstin: '',
      isPrimary: false,
    },
  })

  const onGstinSubmit = async (data: GstinFormValues) => {
    addGstinMutation.mutate(data, {
      onSuccess: () => {
        setShowAddGstinDialog(false)
        gstinForm.reset()
      },
    })
  }

  const handleRemoveGstin = (gstinId: string) => {
    if (confirm('Are you sure you want to remove this GSTIN?')) {
      removeGstinMutation.mutate(gstinId)
    }
  }

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
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-muted-foreground">
            Manage your organization details and GSTINs.
          </p>
        </div>
      </div>

      {/* Organization Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
          <CardDescription>
            Basic information about your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Company" {...field} />
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
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Company Pvt. Ltd." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryOptions.map((industry) => (
                            <SelectItem key={industry} value={industry.toLowerCase()}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 11 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input placeholder="AAAAA0000A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* GSTINs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered GSTINs</CardTitle>
              <CardDescription>
                GST identification numbers linked to this organization.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddGstinDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add GSTIN
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organization?.gstins && organization.gstins.length > 0 ? (
            <div className="space-y-4">
              {organization.gstins.map((gstin) => (
                <div
                  key={gstin.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{gstin.gstin}</span>
                      {gstin.isPrimary && <Badge variant="secondary">Primary</Badge>}
                      {gstin.isVerified && (
                        <Badge variant="outline" className="text-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {gstin.stateName}
                      {gstin.tradeName && <span>• {gstin.tradeName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={gstin.status === 'active' ? 'default' : 'secondary'}
                    >
                      {gstin.status}
                    </Badge>
                    {!gstin.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveGstin(gstin.id)}
                        disabled={removeGstinMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No GSTINs registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add GSTIN Dialog */}
      <Dialog open={showAddGstinDialog} onOpenChange={setShowAddGstinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add GSTIN</DialogTitle>
            <DialogDescription>
              Enter your GST Identification Number to link it to your organization.
            </DialogDescription>
          </DialogHeader>
          <Form {...gstinForm}>
            <form onSubmit={gstinForm.handleSubmit(onGstinSubmit)} className="space-y-4">
              <FormField
                control={gstinForm.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="22AAAAA0000A1Z5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={gstinForm.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as primary GSTIN</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddGstinDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addGstinMutation.isPending}>
                  {addGstinMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add GSTIN'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
