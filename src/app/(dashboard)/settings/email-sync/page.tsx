'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, EyeOff, RefreshCw, Mail, Zap, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEmailAccounts,
  useInitiateEmailConnection,
} from '@/hooks/use-email-sync';
import {
  EmailSyncConnectionCard,
  EmailSyncSettingsDialog,
  EmailSyncHistoryDialog,
  EmailSyncDisconnectDialog,
} from '@/components/features/email-sync';
import { usePermissions } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import type { EmailAccount } from '@/types/email-sync';
import { getEmailConnectionError } from '@/lib/email-sync-errors';

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

export default function EmailSyncPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useEmailAccounts();
  const { isAdmin } = usePermissions();
  const initiateConnection = useInitiateEmailConnection();

  // Non-admins have read-only access
  const canEdit = isAdmin;

  // Dialog states
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);

  const connectionResult = searchParams.get('email_sync');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const handledResult = useRef<string | null>(null);
  useEffect(() => {
    if (!connectionResult || handledResult.current === connectionResult) return;
    handledResult.current = connectionResult;
    const message = connectionResult === 'connected' ? null : getEmailConnectionError(connectionResult);
    setConnectionError(message);
    toast({ title: connectionResult === 'connected' ? 'Email connected' : 'Connection not completed',
      description: message ?? 'Your email is ready for daily GST notice sync.',
      variant: connectionResult === 'connected' ? 'default' : 'destructive' });
    router.replace('/settings/email-sync');
    void refetch();
  }, [connectionResult, router, toast, refetch]);

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setConnectionError(null);
      handledResult.current = null;
      const redirectUri = `${window.location.origin}/settings/email-sync`;
      const result = await initiateConnection.mutateAsync({
        provider,
        redirectUri,
      });

      if (result.success && result.authorizationUrl) {
        // Redirect to OAuth provider
        window.location.href = result.authorizationUrl;
      }
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleReconnect = (account: EmailAccount) => {
    handleConnect(account.provider);
  };

  const handleSettings = (account: EmailAccount) => {
    setSelectedAccount(account);
    setSettingsDialogOpen(true);
  };

  const handleHistory = (account: EmailAccount) => {
    setSelectedAccount(account);
    setHistoryDialogOpen(true);
  };

  const handleDisconnect = (account: EmailAccount) => {
    setSelectedAccount(account);
    setDisconnectDialogOpen(true);
  };

  const isConnecting = initiateConnection.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Email Sync</h1>
          <p className="text-muted-foreground">
            Connect your email to automatically detect and import GST notices
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {connectionError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Read-only banner for non-admins */}
      {!canEdit && (
        <Alert>
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            You have view-only access to email sync settings. Contact your administrator to make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* OAuth Processing */}
      {initiateConnection.isPending && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Completing connection... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* OAuth Error */}
      {initiateConnection.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to complete connection. Please try connecting again.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Automatic GST Notice Detection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your Gmail or Microsoft Outlook account to automatically scan for GST notices.
            We only read emails from known GST authorities and never access your other emails.
            Notices are detected and imported before they even appear on the GST Portal.
          </p>
        </CardContent>
      </Card>

      {/* Connect Buttons */}
      {canEdit && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-3"
                onClick={() => handleConnect('gmail')}
                disabled={isConnecting}
              >
                {initiateConnection.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <GmailIcon className="h-8 w-8 text-red-500" />
                )}
                <div className="text-center">
                  <p className="font-semibold">Connect Gmail</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Workspace or personal Gmail
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-3"
                onClick={() => handleConnect('outlook')}
                disabled={isConnecting}
              >
                {initiateConnection.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <OutlookIcon className="h-8 w-8 text-blue-500" />
                )}
                <div className="text-center">
                  <p className="font-semibold">Connect Microsoft</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Outlook, Microsoft 365, or Hotmail
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connected Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
          {data && (
            <Badge variant="secondary">
              {data.accounts.filter(a => a.isConnected).length} of {data.total} connected
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Failed to load connected accounts. Please try again.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : data?.accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No email accounts connected yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Connect your Gmail or Outlook account above to start automatically importing GST notices.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.accounts.map((account) => (
              <EmailSyncConnectionCard
                key={account.id}
                account={account}
                onReconnect={canEdit ? handleReconnect : undefined}
                onSettings={canEdit ? handleSettings : undefined}
                onHistory={handleHistory}
                onDisconnect={canEdit ? handleDisconnect : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <EyeOff className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Your privacy is protected</p>
              <p className="text-sm text-muted-foreground mt-1">
                We only access emails from verified GST authority addresses (@gst.gov.in, @icegate.gov.in).
                Your personal emails are never read or stored. You can disconnect at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      {selectedAccount && (
        <EmailSyncSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          account={selectedAccount}
        />
      )}

      {/* History Dialog */}
      {selectedAccount && (
        <EmailSyncHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          account={selectedAccount}
        />
      )}

      {/* Disconnect Dialog */}
      {selectedAccount && (
        <EmailSyncDisconnectDialog
          open={disconnectDialogOpen}
          onOpenChange={setDisconnectDialogOpen}
          account={selectedAccount}
        />
      )}
    </div>
  );
}
