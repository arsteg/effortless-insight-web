'use client';

import { useState, useEffect } from 'react';
import { Loader2, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateEmailSettings } from '@/hooks/use-email-sync';
import type { EmailAccount } from '@/types/email-sync';
import { getProviderLabel } from '@/types/email-sync';

interface EmailSyncSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: EmailAccount;
}

export function EmailSyncSettingsDialog({
  open,
  onOpenChange,
  account,
}: EmailSyncSettingsDialogProps) {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(account.autoSyncEnabled);

  const updateSettings = useUpdateEmailSettings();

  // Reset form when account changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional form reset when a different account is shown
    setAutoSyncEnabled(account.autoSyncEnabled);
  }, [account]);

  const hasChanges = autoSyncEnabled !== account.autoSyncEnabled;

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        accountId: account.id,
        settings: {
          autoSyncEnabled,
        },
      });
      onOpenChange(false);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Sync Settings</DialogTitle>
              <DialogDescription>
                Configure email sync for {account.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium">{getProviderLabel(account.provider)}</span>
          </div>

          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically scan for GST notices daily
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
              disabled={updateSettings.isPending}
            />
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
            <p>
              When enabled, we scan your inbox daily for emails from GST authorities
              and automatically import any notices found.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
          >
            {updateSettings.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
