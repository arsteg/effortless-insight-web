'use client'

import { useState } from 'react'
import { CreditCard, MoreVertical, Trash2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaymentMethod } from '@/types/billing'

interface PaymentMethodsProps {
  paymentMethods?: PaymentMethod[]
  isLoading?: boolean
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
  isSettingDefault?: boolean
  isDeleting?: boolean
}

export function PaymentMethods({
  paymentMethods,
  isLoading,
  onSetDefault,
  onDelete,
  isSettingDefault,
  isDeleting,
}: PaymentMethodsProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {!paymentMethods || paymentMethods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment methods saved</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment methods will appear here after your first purchase
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <PaymentMethodItem
                  key={method.id}
                  method={method}
                  onSetDefault={() => onSetDefault(method.id)}
                  onDelete={() => setDeleteId(method.id)}
                  isSettingDefault={isSettingDefault}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface PaymentMethodItemProps {
  method: PaymentMethod
  onSetDefault: () => void
  onDelete: () => void
  isSettingDefault?: boolean
}

function PaymentMethodItem({
  method,
  onSetDefault,
  onDelete,
  isSettingDefault,
}: PaymentMethodItemProps) {
  const getIcon = () => {
    switch (method.type) {
      case 'card':
        return <CreditCard className="h-6 w-6" />
      case 'upi':
        return (
          <div className="h-6 w-6 flex items-center justify-center text-xs font-bold">
            UPI
          </div>
        )
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getDescription = () => {
    if (method.type === 'card') {
      const brand = method.cardBrand?.charAt(0).toUpperCase() + (method.cardBrand?.slice(1) || '')
      const expiry = method.cardExpiryMonth && method.cardExpiryYear
        ? `${String(method.cardExpiryMonth).padStart(2, '0')}/${method.cardExpiryYear}`
        : ''
      return (
        <>
          <span className="font-medium">
            {brand} ending in {method.cardLast4}
          </span>
          {expiry && <span className="text-muted-foreground"> · Expires {expiry}</span>}
        </>
      )
    }
    if (method.type === 'upi') {
      return <span className="font-medium">{method.upiId}</span>
    }
    return <span className="font-medium">{method.type}</span>
  }

  const isExpiringSoon = () => {
    if (method.type !== 'card' || !method.cardExpiryMonth || !method.cardExpiryYear) {
      return false
    }
    const now = new Date()
    const expiryDate = new Date(method.cardExpiryYear, method.cardExpiryMonth - 1)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    return expiryDate <= threeMonthsFromNow && expiryDate >= now
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {getIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            {getDescription()}
            {method.isDefault && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isExpiringSoon() && (
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                Expiring soon
              </span>
            )}
            {method.lastUsedAt && (
              <span className="text-xs text-muted-foreground">
                Last used {new Date(method.lastUsedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!method.isDefault && (
            <DropdownMenuItem
              onClick={onSetDefault}
              disabled={isSettingDefault}
            >
              <Check className="mr-2 h-4 w-4" />
              Set as default
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
            disabled={method.isDefault}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
