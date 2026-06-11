'use client'

import Link from 'next/link'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { DuplicateWarning as DuplicateWarningType } from '@/types'

interface DuplicateWarningProps {
  warning: DuplicateWarningType
  onContinue: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function DuplicateWarning({
  warning,
  onContinue,
  onCancel,
  isLoading = false,
}: DuplicateWarningProps) {
  if (!warning.isPotentialDuplicate) {
    return null
  }

  const similarityPercent = Math.round(warning.similarityScore * 100)

  return (
    <Card className="border-yellow-500 dark:border-yellow-600">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-5 w-5" />
          Potential Duplicate Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This notice appears to be similar to an existing notice in your account.
          Please review before continuing.
        </p>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {warning.similarNoticeNumber || 'Existing Notice'}
              </p>
              {warning.uploadedAt && (
                <p className="text-sm text-muted-foreground">
                  Uploaded: {formatDate(warning.uploadedAt)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Similarity: {similarityPercent}%
              </p>
            </div>
            {warning.similarNoticeId && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/notices/${warning.similarNoticeId}`}
                  target="_blank"
                >
                  View
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel Upload
          </Button>
          <Button
            onClick={onContinue}
            disabled={isLoading}
            className="flex-1"
          >
            Upload Anyway
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
