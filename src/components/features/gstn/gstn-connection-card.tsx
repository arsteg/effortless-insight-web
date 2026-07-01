'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Link2,
  Link2Off,
  RefreshCw,
  Settings2,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
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
import { useInitiateConnection, useTriggerSync } from '@/hooks/use-gstn';
import {
  GstnConnection,
  GstnConnectionStatus,
  getStatusLabel,
  getStatusColor,
  canConnect,
  canSync,
} from '@/types/gstn';

// Sanitize error messages to prevent XSS
function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove special chars
    .substring(0, 200); // Limit length
}

interface GstnConnectionCardProps {
  connection: GstnConnection;
  onConnectInitiated: (gstinId: string, destination: string) => void;
  onSettings: (connection: GstnConnection) => void;
  onHistory: (connection: GstnConnection) => void;
  onDisconnect: (connection: GstnConnection) => void;
}

export function GstnConnectionCard({
  connection,
  onConnectInitiated,
  onSettings,
  onHistory,
  onDisconnect,
}: GstnConnectionCardProps) {
  const initiateConnection = useInitiateConnection();
  const triggerSync = useTriggerSync();

  const handleConnect = async () => {
    try {
      const result = await initiateConnection.mutateAsync(connection.organizationGstinId);
      if (result.success && result.otpDestination) {
        onConnectInitiated(connection.organizationGstinId, result.otpDestination);
      }
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleSync = () => {
    triggerSync.mutate(connection.organizationGstinId);
  };

  const isLoading = initiateConnection.isPending || triggerSync.isPending;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-mono">{connection.gstin}</CardTitle>
            {connection.tradeName && (
              <CardDescription>{connection.tradeName}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(connection.status)} variant="outline">
              {getStatusLabel(connection.status)}
            </Badge>
            {connection.isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSettings(connection)}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Sync Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onHistory(connection)}>
                    <History className="h-4 w-4 mr-2" />
                    Sync History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDisconnect(connection)}
                    className="text-destructive"
                  >
                    <Link2Off className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection.isConnected ? (
          <>
            {/* Connection Info */}
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto-sync</span>
                <span className="font-medium">
                  {connection.autoSyncEnabled
                    ? `Every ${connection.syncIntervalHours}h`
                    : 'Disabled'}
                </span>
              </div>
              {connection.lastSyncAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last synced</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(connection.lastSyncAt), { addSuffix: true })}
                  </span>
                </div>
              )}
              {connection.nextScheduledSyncAt && connection.autoSyncEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next sync</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(connection.nextScheduledSyncAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Error State */}
            {connection.lastSyncError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Last sync failed</p>
                  <p className="text-xs opacity-80 break-words">
                    {sanitizeErrorMessage(connection.lastSyncError)}
                  </p>
                </div>
              </div>
            )}

            {/* Connected By Info */}
            {connection.connectedByName && connection.connectedAt && (
              <p className="text-xs text-muted-foreground">
                Connected by {connection.connectedByName} on{' '}
                {format(new Date(connection.connectedAt), 'MMM d, yyyy')}
              </p>
            )}

            {/* Sync Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSync}
              disabled={!canSync(connection.status) || isLoading}
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
            {/* Disconnected State Info */}
            <div className="text-sm text-muted-foreground">
              {connection.status === GstnConnectionStatus.TokenExpired && (
                <p>Your session has expired. Please reconnect to continue syncing.</p>
              )}
              {connection.status === GstnConnectionStatus.Suspended && (
                <p>
                  Connection suspended after {connection.consecutiveFailures} consecutive
                  failures. Please reconnect.
                </p>
              )}
              {connection.status === GstnConnectionStatus.Revoked && (
                <p>Access was revoked from the GST Portal. Please reconnect.</p>
              )}
              {connection.status === GstnConnectionStatus.Disconnected && (
                <p>
                  Connect to automatically fetch notices from the GST Portal.
                </p>
              )}
            </div>

            {/* Connect Button */}
            <Button
              className="w-full"
              onClick={handleConnect}
              disabled={!canConnect(connection.status) || isLoading}
            >
              {initiateConnection.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Connect to GST Portal
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
