'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Link2, Settings2, History, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGstnConnections } from '@/hooks/use-gstn';
import { GstnConnectionCard } from '@/components/features/gstn/gstn-connection-card';
import { GstnOtpDialog } from '@/components/features/gstn/gstn-otp-dialog';
import { GstnSettingsDialog } from '@/components/features/gstn/gstn-settings-dialog';
import { GstnSyncHistoryDialog } from '@/components/features/gstn/gstn-sync-history-dialog';
import { GstnDisconnectDialog } from '@/components/features/gstn/gstn-disconnect-dialog';
import type { GstnConnection } from '@/types/gstn';

export default function IntegrationsPage() {
  const { data, isLoading, error, refetch } = useGstnConnections();

  // Dialog states
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<GstnConnection | null>(null);
  const [pendingGstinId, setPendingGstinId] = useState<string | null>(null);
  const [pendingGstin, setPendingGstin] = useState<string>('');
  const [otpDestination, setOtpDestination] = useState<string>('');

  const handleConnectInitiated = (gstinId: string, destination: string) => {
    // Find the connection to get the GSTIN number
    const connection = data?.connections.find(c => c.organizationGstinId === gstinId);
    setPendingGstinId(gstinId);
    setPendingGstin(connection?.gstin || '');
    setOtpDestination(destination);
    setOtpDialogOpen(true);
  };

  const handleSettings = (connection: GstnConnection) => {
    setSelectedConnection(connection);
    setSettingsDialogOpen(true);
  };

  const handleHistory = (connection: GstnConnection) => {
    setSelectedConnection(connection);
    setHistoryDialogOpen(true);
  };

  const handleDisconnect = (connection: GstnConnection) => {
    setSelectedConnection(connection);
    setDisconnectDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your GSTINs to the GST Portal for automatic notice fetching
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">GST Portal Integration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your GSTINs to automatically fetch notices from the GST Portal.
            You&apos;ll need to verify each connection using an OTP sent to your registered
            mobile number or email. Once connected, notices will be fetched automatically
            based on your sync schedule.
          </p>
        </CardContent>
      </Card>

      {/* Connections List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your GSTINs</h2>
          {data && (
            <Badge variant="secondary">
              {data.connections.filter(c => c.isConnected).length} of {data.total} connected
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
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
                Failed to load connections. Please try again.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : data?.connections.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No GSTINs found. Add GSTINs to your organization first.
              </p>
              <Link href="/settings/organization">
                <Button variant="outline" className="mt-4">
                  Manage Organization
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.connections.map((connection) => (
              <GstnConnectionCard
                key={connection.organizationGstinId}
                connection={connection}
                onConnectInitiated={handleConnectInitiated}
                onSettings={handleSettings}
                onHistory={handleHistory}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <GstnOtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        gstinId={pendingGstinId}
        gstin={pendingGstin}
        otpDestination={otpDestination}
      />

      {/* Settings Dialog */}
      {selectedConnection && (
        <GstnSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          connection={selectedConnection}
        />
      )}

      {/* Sync History Dialog */}
      {selectedConnection && (
        <GstnSyncHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          connection={selectedConnection}
        />
      )}

      {/* Disconnect Dialog */}
      {selectedConnection && (
        <GstnDisconnectDialog
          open={disconnectDialogOpen}
          onOpenChange={setDisconnectDialogOpen}
          connection={selectedConnection}
        />
      )}
    </div>
  );
}
