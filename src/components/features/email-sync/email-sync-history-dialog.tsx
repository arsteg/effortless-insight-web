'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Timer,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmailSyncHistory } from '@/hooks/use-email-sync';
import type { EmailAccount, EmailSyncLogEntry } from '@/types/email-sync';

/**
 * Format duration in human-readable form
 */
function formatDuration(ms: number | undefined | null): string | null {
  if (ms === undefined || ms === null) return null;
  if (ms === 0) return '< 1ms';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Sanitize error message to prevent XSS
 */
function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .substring(0, 300);
}

/**
 * Safely format a date string
 */
function safeFormatDate(dateString: string, formatString: string): string {
  try {
    return format(new Date(dateString), formatString);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get trigger source label
 */
function getTriggerSourceLabel(source: string): string {
  switch (source) {
    case 'manual':
      return 'Manual';
    case 'scheduled':
      return 'Scheduled';
    case 'initial':
      return 'Initial';
    default:
      return source;
  }
}

interface EmailSyncHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: EmailAccount;
}

function SyncStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'completed_with_warnings':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Warnings
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          In Progress
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SyncLogEntry({ log }: { log: EmailSyncLogEntry }) {
  const duration = formatDuration(log.durationMs);

  return (
    <div className="p-4 border rounded-lg space-y-3" role="listitem">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SyncStatusBadge status={log.status} />
            <Badge variant="outline" className="text-xs">
              {getTriggerSourceLabel(log.triggerSource)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {safeFormatDate(log.startedAt, 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        {duration && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Timer className="h-3 w-3 mr-1" aria-hidden="true" />
            <span aria-label={`Duration: ${duration}`}>{duration}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-sm" role="group" aria-label="Sync statistics">
        <div className="text-center p-2 bg-muted rounded">
          <p className="font-semibold">{log.emailsScanned ?? 0}</p>
          <p className="text-xs text-muted-foreground">Scanned</p>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <p className="font-semibold text-green-600">{log.noticesImported ?? 0}</p>
          <p className="text-xs text-muted-foreground">Imported</p>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <p className="font-semibold text-gray-600">{log.duplicatesSkipped ?? 0}</p>
          <p className="text-xs text-muted-foreground">Duplicates</p>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <p className="font-semibold text-red-600">{log.noticesFailed ?? 0}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {log.importedNoticeIds?.map((id, index) => (
        <Link key={id} href={`/notices/${id}`} className="block text-sm text-primary underline">View imported notice {index + 1}</Link>
      ))}
      {/* AI Usage */}
      {log.aiDetectionUsed > 0 && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
          AI detection used for {log.aiDetectionUsed} email{log.aiDetectionUsed > 1 ? 's' : ''}
        </div>
      )}

      {/* Error Message */}
      {log.errorMessage && (
        <div
          className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-destructive text-sm"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="break-words">{sanitizeErrorMessage(log.errorMessage)}</p>
        </div>
      )}

      {/* Triggered By */}
      {log.triggeredByName && (
        <div className="flex items-center text-xs text-muted-foreground">
          <User className="h-3 w-3 mr-1" aria-hidden="true" />
          Triggered by {log.triggeredByName}
        </div>
      )}
    </div>
  );
}

export function EmailSyncHistoryDialog({
  open,
  onOpenChange,
  account,
}: EmailSyncHistoryDialogProps) {
  const { data, isLoading, error } = useEmailSyncHistory(account.id, 20);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Sync History</DialogTitle>
              <DialogDescription>
                Recent syncs for {account.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load sync history</p>
              </div>
            ) : data?.logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No sync history yet</p>
                <p className="text-sm">
                  Sync history will appear here after the first sync
                </p>
              </div>
            ) : (
              data?.logs.map((log) => <SyncLogEntry key={log.id} log={log} />)
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
