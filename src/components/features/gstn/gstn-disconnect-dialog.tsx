'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDisconnect } from '@/hooks/use-gstn';
import type { GstnConnection } from '@/types/gstn';

interface GstnDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: GstnConnection;
}

export function GstnDisconnectDialog({
  open,
  onOpenChange,
  connection,
}: GstnDisconnectDialogProps) {
  const [reason, setReason] = useState('');
  const disconnect = useDisconnect();

  const handleDisconnect = async () => {
    await disconnect.mutateAsync({
      gstinId: connection.organizationGstinId,
      reason: reason || undefined,
    });
    setReason('');
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
              <DialogTitle>Disconnect GSTIN</DialogTitle>
              <DialogDescription>
                Disconnect {connection.gstin} from the GST Portal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Are you sure?</p>
              <p className="mt-1 text-yellow-700">
                Disconnecting will stop automatic notice fetching. You can reconnect
                at any time by verifying with a new OTP.
              </p>
            </div>
          </div>

          {/* Reason (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you disconnecting?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
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
