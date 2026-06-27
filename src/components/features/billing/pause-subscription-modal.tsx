'use client'

import { useState } from 'react'
import { PauseCircle } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import type { Subscription } from '@/types/billing'

interface PauseSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
  onConfirm: (reason: string, resumeAt?: string) => void
  isLoading?: boolean
}

const PAUSE_REASONS = [
  { value: 'temporary_break', label: 'Taking a temporary break' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'not_using', label: 'Not using the service currently' },
  { value: 'seasonal', label: 'Seasonal business needs' },
  { value: 'other', label: 'Other reason' },
]

export function PauseSubscriptionModal({
  open,
  onOpenChange,
  subscription,
  onConfirm,
  isLoading,
}: PauseSubscriptionModalProps) {
  const [reason, setReason] = useState('')
  const [resumeDate, setResumeDate] = useState('')
  const [showResumeDate, setShowResumeDate] = useState(false)

  const handleConfirm = () => {
    onConfirm(reason, showResumeDate && resumeDate ? resumeDate : undefined)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('')
      setResumeDate('')
      setShowResumeDate(false)
    }
    onOpenChange(open)
  }

  // Calculate minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  // Calculate maximum date (90 days from now)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 90)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PauseCircle className="h-5 w-5" />
            Pause Subscription
          </DialogTitle>
          <DialogDescription>
            Temporarily pause your subscription. Your data will be preserved and you can resume anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertTitle>What happens when you pause?</AlertTitle>
            <AlertDescription className="space-y-2">
              <ul className="text-sm space-y-1 mt-2">
                <li>Your access to premium features will be suspended</li>
                <li>Your data and settings will be preserved</li>
                <li>No charges will be made during the pause period</li>
                <li>You can resume your subscription anytime</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Label>Why are you pausing?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="space-y-3">
                {PAUSE_REASONS.map((item) => (
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="schedule-resume"
                checked={showResumeDate}
                onChange={(e) => setShowResumeDate(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="schedule-resume" className="text-sm">
                Schedule automatic resume date
              </Label>
            </div>

            {showResumeDate && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="resume-date">Resume on</Label>
                <Input
                  id="resume-date"
                  type="date"
                  value={resumeDate}
                  onChange={(e) => setResumeDate(e.target.value)}
                  min={minDateStr}
                  max={maxDateStr}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum pause duration is 90 days
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm">
              <strong>Current plan:</strong> {subscription.planName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              When you resume, you&apos;ll continue with the same plan and billing cycle.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason || isLoading}
          >
            {isLoading ? 'Pausing...' : 'Pause Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
