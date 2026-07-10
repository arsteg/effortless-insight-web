'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Import,
  Loader2,
  User,
} from 'lucide-react'
import { useImportGstNotices } from '@/hooks/use-gst-sync'
import { useMembers } from '@/hooks/use-team'
import type { GstNoticeRaw, ImportNoticesResponse } from '@/types/gst-sync'

interface ImportNoticesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedNotices: GstNoticeRaw[]
  onImportComplete: () => void
}

type ImportState = 'idle' | 'importing' | 'completed' | 'error'

export function ImportNoticesDialog({
  open,
  onOpenChange,
  selectedNotices,
  onImportComplete,
}: ImportNoticesDialogProps) {
  const [importState, setImportState] = useState<ImportState>('idle')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [importResult, setImportResult] = useState<ImportNoticesResponse | null>(null)
  const [progress, setProgress] = useState(0)

  const importMutation = useImportGstNotices()
  const { data: membersData } = useMembers()
  const teamMembers = membersData?.members ?? []

  const handleImport = async () => {
    if (selectedNotices.length === 0) return

    setImportState('importing')
    setProgress(10)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await importMutation.mutateAsync({
        noticeIds: selectedNotices.map((n) => n.id),
        assignToUserId: assigneeId || undefined,
      })

      clearInterval(progressInterval)
      setProgress(100)
      setImportResult(result)
      setImportState('completed')
    } catch (error) {
      setImportState('error')
      setImportResult({
        imported: 0,
        alreadyImported: 0,
        failed: selectedNotices.length,
        importedNotices: [],
        errors: [(error as Error).message || 'Import failed'],
      })
    }
  }

  const handleClose = () => {
    if (importState === 'completed') {
      onImportComplete()
    }
    // Reset state when closing
    setImportState('idle')
    setProgress(0)
    setImportResult(null)
    setAssigneeId('')
    onOpenChange(false)
  }

  const totalDemandAmount = selectedNotices.reduce(
    (sum, n) => sum + (n.demandAmount ?? 0),
    0
  )

  const noticeTypes = [...new Set(selectedNotices.map((n) => n.noticeType))]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {importState === 'completed' ? 'Import Complete' : 'Import Notices'}
          </DialogTitle>
          <DialogDescription>
            {importState === 'idle' &&
              `Import ${selectedNotices.length} notice(s) to your main notices list.`}
            {importState === 'importing' && 'Importing notices...'}
            {importState === 'completed' && 'Import has been completed.'}
            {importState === 'error' && 'There was an error during import.'}
          </DialogDescription>
        </DialogHeader>

        {importState === 'idle' && (
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notices to import</span>
                <span className="font-medium">{selectedNotices.length}</span>
              </div>
              {totalDemandAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total demand amount</span>
                  <span className="font-medium">
                    ₹{totalDemandAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Types:</span>
                {noticeTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Assignee Selection */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="assignee" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assign to team member (optional)
                </Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Leave unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user.name} ({member.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {importState === 'importing' && (
          <div className="py-8 space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Importing {selectedNotices.length} notice(s)...
            </p>
          </div>
        )}

        {(importState === 'completed' || importState === 'error') && importResult && (
          <div className="py-4 space-y-4">
            {/* Results Summary */}
            <div className="rounded-lg border p-4 space-y-3">
              {importResult.imported > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{importResult.imported} notice(s) imported successfully</span>
                </div>
              )}
              {importResult.alreadyImported > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>{importResult.alreadyImported} notice(s) already imported</span>
                </div>
              )}
              {importResult.failed > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span>{importResult.failed} notice(s) failed to import</span>
                </div>
              )}
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center gap-2 mb-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Errors:</span>
                </div>
                <ul className="text-sm space-y-1 text-destructive">
                  {importResult.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {importState === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                <Import className="mr-2 h-4 w-4" />
                Import {selectedNotices.length} Notice(s)
              </Button>
            </>
          )}
          {importState === 'importing' && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </Button>
          )}
          {(importState === 'completed' || importState === 'error') && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportNoticesDialog
