'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useBulkCreateGstClients } from '@/hooks/use-gst-sync'
import type { BulkCreateGstClientItem, BulkCreateGstClientResult } from '@/types/gst-sync'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/

interface BulkAddGstClientsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Paste-a-list onboarding for CA firms: one client per line,
 * "GSTIN" or "GSTIN, Client Name". Invalid lines are shown before submitting.
 */
export function BulkAddGstClientsDialog({ open, onOpenChange }: BulkAddGstClientsDialogProps) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<BulkCreateGstClientResult | null>(null)
  const bulkMutation = useBulkCreateGstClients()

  const parsed = useMemo(() => {
    const items: BulkCreateGstClientItem[] = []
    const invalid: string[] = []

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim()
      if (!line) continue

      const [gstinPart, ...nameParts] = line.split(',')
      const gstin = gstinPart.trim().toUpperCase()
      const tradeName = nameParts.join(',').trim() || undefined

      if (GSTIN_REGEX.test(gstin)) {
        items.push({ gstin, tradeName })
      } else {
        invalid.push(line)
      }
    }
    return { items, invalid }
  }, [text])

  const handleSubmit = async () => {
    if (parsed.items.length === 0) return
    try {
      const res = await bulkMutation.mutateAsync(parsed.items)
      setResult(res)
      setText('')
    } catch {
      // Toast handled by the mutation
    }
  }

  const handleClose = () => {
    if (bulkMutation.isPending) return
    setText('')
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Multiple GSTINs</DialogTitle>
          <DialogDescription>
            One client per line: <span className="font-mono">GSTIN</span> or{' '}
            <span className="font-mono">GSTIN, Client Name</span>. Notices sync automatically
            once you log into each client&apos;s GST portal.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-semibold text-green-600">{result.created} added</span>
              {', '}
              <span className="text-muted-foreground">{result.skipped} skipped</span>
              {result.failed > 0 && (
                <>
                  {', '}
                  <span className="font-semibold text-destructive">{result.failed} failed</span>
                </>
              )}
            </p>
            {result.items.filter((i) => i.status !== 'created').length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2 text-xs">
                {result.items
                  .filter((i) => i.status !== 'created')
                  .map((item) => (
                    <p key={item.gstin} className="font-mono">
                      {item.gstin} — {item.error || item.status}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'06ACAFA7813K1ZG, ARSTEG Foods\n27AABCU9603R1ZM, Umbrella Corp'}
              rows={8}
              className="font-mono text-sm"
              disabled={bulkMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {parsed.items.length} valid GSTIN{parsed.items.length === 1 ? '' : 's'}
              {parsed.invalid.length > 0 && (
                <span className="text-destructive">
                  {' '}
                  · {parsed.invalid.length} invalid line{parsed.invalid.length === 1 ? '' : 's'} will
                  be ignored
                </span>
              )}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={bulkMutation.isPending}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleSubmit}
              disabled={bulkMutation.isPending || parsed.items.length === 0}
            >
              {bulkMutation.isPending
                ? 'Adding...'
                : `Add ${parsed.items.length} GSTIN${parsed.items.length === 1 ? '' : 's'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkAddGstClientsDialog
