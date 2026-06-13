'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Subscription } from '@/types/billing'

interface CancelSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  onConfirm: (reason: string, feedback?: string, immediate?: boolean) => void
  isLoading?: boolean
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using the service enough' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'switching_competitor', label: 'Switching to a competitor' },
  { value: 'temporary', label: 'Only needed it temporarily' },
  { value: 'other', label: 'Other reason' },
]

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  subscription,
  onConfirm,
  isLoading,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<'reason' | 'confirm'>('reason')
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [immediate, setImmediate] = useState(false)

  const handleBack = () => {
    setStep('reason')
  }

  const handleNext = () => {
    if (reason) {
      setStep('confirm')
    }
  }

  const handleConfirm = () => {
    onConfirm(reason, feedback, immediate)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep('reason')
      setReason('')
      setFeedback('')
      setImmediate(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            {step === 'reason'
              ? 'We\'re sorry to see you go. Please let us know why you\'re cancelling.'
              : 'Please confirm your cancellation'}
          </DialogDescription>
        </DialogHeader>

        {step === 'reason' ? (
          <div className="space-y-6 py-4">
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="space-y-3">
                {CANCELLATION_REASONS.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center space-x-3"
                  >
                    <RadioGroupItem value={item.value} id={item.value} />
                    <Label htmlFor={item.value} className="cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional feedback (optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Are you sure?</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  {immediate ? (
                    <>
                      Your subscription will be cancelled immediately and you will
                      lose access to premium features.
                    </>
                  ) : (
                    <>
                      Your subscription will remain active until{' '}
                      <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
                      You can continue using all features until then.
                    </>
                  )}
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">What you&apos;ll lose:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Access to {subscription.planName} features</li>
                <li>• Priority customer support</li>
                <li>• Advanced AI analysis capabilities</li>
                <li>• Custom workflow automation</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="immediate-cancel"
                checked={immediate}
                onChange={(e) => setImmediate(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="immediate-cancel" className="text-sm">
                Cancel immediately (no refund will be issued)
              </Label>
            </div>

            <div className="p-4 border rounded-lg bg-background">
              <p className="text-sm">
                <strong>Note:</strong> You can reactivate your subscription within
                30 days of cancellation without losing your data.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'reason' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleNext}
                disabled={!reason}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
