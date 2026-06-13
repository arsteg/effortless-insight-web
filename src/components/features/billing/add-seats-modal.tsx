'use client'

import { useState } from 'react'
import { Minus, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatAmount } from '@/lib/api/billing'
import type { Subscription } from '@/types/billing'

interface AddSeatsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  pricePerSeat: number
  onConfirm: (quantity: number) => void
  isLoading?: boolean
}

export function AddSeatsModal({
  open,
  onOpenChange,
  subscription,
  pricePerSeat,
  onConfirm,
  isLoading,
}: AddSeatsModalProps) {
  const [quantity, setQuantity] = useState(1)

  const currentSeats = subscription.seats.included + subscription.seats.additional
  const usedSeats = subscription.seats.used
  const minSeats = 1
  const maxSeats = 100

  const handleIncrement = () => {
    if (quantity < maxSeats) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > minSeats) {
      setQuantity(quantity - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= minSeats && value <= maxSeats) {
      setQuantity(value)
    }
  }

  const totalPrice = quantity * pricePerSeat
  const isAnnual = subscription.billingCycle === 'annually'

  const handleConfirm = () => {
    onConfirm(quantity)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Seats</DialogTitle>
          <DialogDescription>
            Add more seats to your subscription for additional team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Seats Info */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Current Seats</p>
              <p className="text-sm text-muted-foreground">
                {usedSeats} of {currentSeats} seats in use
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Number of seats to add</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= minSeats}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                min={minSeats}
                max={maxSeats}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= maxSeats}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Price per seat</span>
              <span>
                {formatAmount(pricePerSeat)} / {isAnnual ? 'year' : 'month'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quantity</span>
              <span>x {quantity}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span>
                {formatAmount(totalPrice)} / {isAnnual ? 'year' : 'month'}
              </span>
            </div>
          </div>

          {/* Proration Note */}
          <p className="text-sm text-muted-foreground">
            You will be charged a prorated amount for the remainder of your
            current billing period. The full amount will be charged on your next
            billing date.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : `Add ${quantity} Seat${quantity > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
