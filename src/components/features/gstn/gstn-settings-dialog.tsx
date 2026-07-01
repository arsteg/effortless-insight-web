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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateSettings } from '@/hooks/use-gstn';
import type { GstnConnection } from '@/types/gstn';

interface GstnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: GstnConnection;
}

const SYNC_INTERVAL_OPTIONS = [
  { value: 1, label: 'Every hour' },
  { value: 2, label: 'Every 2 hours' },
  { value: 4, label: 'Every 4 hours' },
  { value: 6, label: 'Every 6 hours' },
  { value: 8, label: 'Every 8 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Once daily' },
];

export function GstnSettingsDialog({
  open,
  onOpenChange,
  connection,
}: GstnSettingsDialogProps) {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(connection.autoSyncEnabled);
  const [syncIntervalHours, setSyncIntervalHours] = useState(connection.syncIntervalHours);

  const updateSettings = useUpdateSettings();

  // Reset form when connection changes
  useEffect(() => {
    setAutoSyncEnabled(connection.autoSyncEnabled);
    setSyncIntervalHours(connection.syncIntervalHours);
  }, [connection]);

  const hasChanges =
    autoSyncEnabled !== connection.autoSyncEnabled ||
    syncIntervalHours !== connection.syncIntervalHours;

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        gstinId: connection.organizationGstinId,
        settings: {
          autoSyncEnabled,
          syncIntervalHours,
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
                Configure automatic sync for {connection.gstin}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically fetch new notices on a schedule
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
              disabled={updateSettings.isPending}
            />
          </div>

          {/* Sync Interval */}
          <div className="space-y-2">
            <Label htmlFor="sync-interval">Sync Frequency</Label>
            <Select
              value={syncIntervalHours.toString()}
              onValueChange={(value) => setSyncIntervalHours(parseInt(value, 10))}
              disabled={!autoSyncEnabled || updateSettings.isPending}
            >
              <SelectTrigger id="sync-interval" aria-label="Sync frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYNC_INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How often to check for new notices from the GST Portal
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
