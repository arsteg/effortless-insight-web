'use client';

import { formatDistanceToNow, format } from 'date-fns';
import {
  Mail,
  Link2Off,
  RefreshCw,
  Settings2,
  History,
  AlertCircle,
  MoreVertical,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTriggerEmailSync } from '@/hooks/use-email-sync';
import type { EmailAccount } from '@/types/email-sync';
import {
  getSyncStatusLabel,
  getSyncStatusColor,
  getProviderLabel,
  canSync,
  needsReconnect,
} from '@/types/email-sync';

// Provider icons as simple SVGs
function GmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.352.228-.582.228h-8.547V7.106l4.666 3.027 4.462-2.926a.3.3 0 0 1 .15-.04c.118 0 .07.073.089.22zm-.006-1.387c0 .11-.03.18-.089.241l-5.143 3.379-4.129-2.682V2.5h8.78c.228 0 .422.076.58.228.159.152.238.346.238.575v2.697zM7.012 23.5c-1.958 0-3.63-.692-5.012-2.076C.667 20.04 0 18.367 0 16.407c0-1.96.667-3.632 2-5.017C3.333 10.005 5.005 9.312 7.012 9.312c1.958 0 3.63.693 5.012 2.078 1.382 1.385 2.073 3.057 2.073 5.017 0 1.96-.69 3.633-2.073 5.017-1.382 1.384-3.054 2.076-5.012 2.076zm0-2.5c1.26 0 2.337-.445 3.232-1.335.894-.89 1.342-1.963 1.342-3.22 0-1.258-.448-2.333-1.342-3.223-.895-.89-1.972-1.335-3.232-1.335-1.26 0-2.339.445-3.233 1.335-.894.89-1.342 1.965-1.342 3.223 0 1.257.448 2.33 1.342 3.22.894.89 1.972 1.335 3.233 1.335z" />
    </svg>
  );
}

function ProviderIcon({ provider, className }: { provider: string; className?: string }) {
  switch (provider) {
    case 'gmail':
      return <GmailIcon className={className} />;
    case 'outlook':
      return <OutlookIcon className={className} />;
    default:
      return <Mail className={className} />;
  }
}


interface EmailSyncConnectionCardProps {
  account: EmailAccount;
  onReconnect?: (account: EmailAccount) => void;
  onSettings?: (account: EmailAccount) => void;
  onHistory?: (account: EmailAccount) => void;
  onDisconnect?: (account: EmailAccount) => void;
}

export function EmailSyncConnectionCard({
  account,
  onReconnect,
  onSettings,
  onHistory,
  onDisconnect,
}: EmailSyncConnectionCardProps) {
  const triggerSync = useTriggerEmailSync();

  const handleSync = () => {
    triggerSync.mutate(account.id);
  };

  // Check if any dropdown actions are available
  const hasDropdownActions = !!onSettings || !!onHistory || !!onDisconnect;

  const isLoading = triggerSync.isPending;
  const showReconnect = needsReconnect(account.status);

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ProviderIcon provider={account.provider} className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">{account.displayName || account.email}</CardTitle>
              {account.displayName && (
                <CardDescription>{account.email}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSyncStatusColor(account)} variant="outline">
              {getSyncStatusLabel(account)}
            </Badge>
            {account.isConnected && hasDropdownActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onSettings && (
                    <DropdownMenuItem onClick={() => onSettings(account)}>
                      <Settings2 className="h-4 w-4 mr-2" />
                      Sync Settings
                    </DropdownMenuItem>
                  )}
                  {onHistory && (
                    <DropdownMenuItem onClick={() => onHistory(account)}>
                      <History className="h-4 w-4 mr-2" />
                      Sync History
                    </DropdownMenuItem>
                  )}
                  {onDisconnect && (onSettings || onHistory) && <DropdownMenuSeparator />}
                  {onDisconnect && (
                    <DropdownMenuItem
                      onClick={() => onDisconnect(account)}
                      className="text-destructive"
                    >
                      <Link2Off className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {account.isConnected && !showReconnect ? (
          <>
            {/* Connection Info */}
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{getProviderLabel(account.provider)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto-sync</span>
                <span className="font-medium">
                  {account.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {account.lastSyncAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last synced</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(account.lastSyncAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Last Sync Result */}
            {account.lastSyncResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold">{account.lastSyncResult.emailsScanned}</p>
                  <p className="text-xs text-muted-foreground">Scanned</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold text-green-600">{account.lastSyncResult.noticesImported}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold text-gray-600">{account.lastSyncResult.duplicatesSkipped + account.lastSyncResult.attachmentsSkipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold text-amber-600">{account.lastSyncResult.failedToProcess}</p>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </div>
              </div>
            )}

            {account.lastSyncResult?.emailsScanned === 0 && !account.lastSyncError && (
              <p className="text-sm text-muted-foreground">
                No new emails from approved GST senders were found in this scan. Recently received
                emails become eligible after 10 minutes. Older emails outside the initial scan
                period and emails scanned previously are not fetched again.
              </p>
            )}

            {/* Error State */}
            {account.lastSyncError && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${getSyncStatusLabel(account) === 'Sync failed' ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-800'}`}>
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {getSyncStatusLabel(account)}
                  </p>
                  <p className="text-xs opacity-80 break-words">
                    {account.lastSyncResult?.errorCode === 'no_gstin_match'
                      ? 'Some documents need attention because their GSTIN does not uniquely match this business.'
                      : getSyncStatusLabel(account) === 'Notice limit reached'
                        ? 'Your notice allowance has been reached. Upgrade your plan or retry after the monthly reset. Pending items are retained.'
                        : 'Review the sync details for pending items and next steps.'}
                  </p>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">View details</summary>
                    <p className="mt-1 break-words">{account.lastSyncError}</p>
                  </details>
                </div>
              </div>
            )}

            {/* Connected At Info */}
            {account.connectedAt && (
              <p className="text-xs text-muted-foreground">
                Connected on {format(new Date(account.connectedAt), 'MMM d, yyyy')}
              </p>
            )}

            {/* Sync Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSync}
              disabled={!canSync(account.status) || isLoading}
            >
              {triggerSync.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </>
        ) : (
          <>
            {/* Disconnected or Reconnect State Info */}
            <div className="text-sm text-muted-foreground">
              {showReconnect && (
                <p>Your email connection needs to be re-authorized. Please reconnect to continue syncing.</p>
              )}
              {account.status === 'sync_failed' && (
                <p>Sync failed after multiple attempts. Please try reconnecting your account.</p>
              )}
              {account.status === 'suspended' && (
                <p>Connection is paused. Reconnect to resume syncing.</p>
              )}
            </div>

            {/* Reconnect Button */}
            {showReconnect && onReconnect && (
              <Button
                className="w-full"
                onClick={() => onReconnect(account)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reconnect {getProviderLabel(account.provider)}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
