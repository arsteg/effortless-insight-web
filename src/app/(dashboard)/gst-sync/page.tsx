'use client'

import { useState } from 'react'
import {
  Plus,
  RefreshCw,
  Download,
  Settings2,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  GstClientList,
  GstSyncedNotices,
  GstSyncHistory,
  AddGstClientDialog,
  ExtensionSetupGuide,
} from '@/components/features/gst-sync'
import { useGstSyncStatistics, useGstClients } from '@/hooks/use-gst-sync'

export default function GstSyncPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('clients')

  const { data: statistics, isLoading: statsLoading } = useGstSyncStatistics()
  const { data: clientsData } = useGstClients({ pageSize: 100 })

  const hasClients = (clientsData?.items?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GST Notice Sync</h1>
          <p className="text-muted-foreground">
            Automatically capture and sync GST notices from the portal using our Chrome extension.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a
              href="https://chrome.google.com/webstore/detail/gst-notice-guard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Get Extension
            </a>
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add GSTIN
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active GSTINs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.activeClients ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {statistics?.totalClients ?? 0} total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notices Synced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.totalNoticesSynced ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{statistics?.noticesSyncedToday ?? 0} today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Import</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.pendingImports ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  awaiting review
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statistics?.lastSyncTime
                    ? formatRelativeTime(new Date(statistics.lastSyncTime))
                    : 'Never'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.lastSyncTime
                    ? new Date(statistics.lastSyncTime).toLocaleDateString()
                    : 'No syncs yet'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extension Setup Guide (shown when no clients) */}
      {!hasClients && !statsLoading && (
        <ExtensionSetupGuide onAddClient={() => setShowAddDialog(true)} />
      )}

      {/* Main Content Tabs */}
      {hasClients && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">
              Connected GSTINs
              {clientsData?.items && (
                <Badge variant="secondary" className="ml-2">
                  {clientsData.items.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notices">
              Synced Notices
              {statistics?.pendingImports && statistics.pendingImports > 0 && (
                <Badge variant="default" className="ml-2">
                  {statistics.pendingImports} new
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <GstClientList onAddNew={() => setShowAddDialog(true)} />
          </TabsContent>

          <TabsContent value="notices" className="space-y-4">
            <GstSyncedNotices />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <GstSyncHistory />
          </TabsContent>
        </Tabs>
      )}

      {/* Add GSTIN Dialog */}
      <AddGstClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
