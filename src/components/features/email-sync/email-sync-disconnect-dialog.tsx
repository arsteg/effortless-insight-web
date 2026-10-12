'use client';

import { Loader2, Link2Off, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDisconnectEmail } from '@/hooks/use-email-sync';
import type { EmailAccount } from '@/types/email-sync';
import { getProviderLabel } from '@/types/email-sync';

interface EmailSyncDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: EmailAccount;
}

export function EmailSyncDisconnectDialog({
  open,
  onOpenChange,
  account,
}: EmailSyncDisconnectDialogProps) {
  const disconnect = useDisconnectEmail();

  const handleDisconnect = async () => {
    await disconnect.mutateAsync(account.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Link2Off className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Disconnect Email</DialogTitle>
              <DialogDescription>
                Disconnect {account.email} from email sync
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Are you sure?</p>
              <p className="mt-1 text-amber-700">
                Disconnecting will stop automatic GST notice detection from this email.
                Previously imported notices will not be affected. You can reconnect
                at any time.
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-3 rounded-lg bg-muted text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{account.email}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{getProviderLabel(account.provider)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={disconnect.isPending}
          >
            {disconnect.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
