'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentRequestList } from './document-request-list'
import { useMyPendingDocumentRequests } from '@/hooks/use-collaboration'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentRequestCard } from './document-request-card'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Upload,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocumentRequest } from '@/types/collaboration'

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface DocumentRequestPanelProps {
  noticeId: string
  noticeType?: string
  availableMembers?: OrganizationMember[]
  className?: string
}

export function DocumentRequestPanel({
  noticeId,
  noticeType,
  availableMembers = [],
  className,
}: DocumentRequestPanelProps) {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn('space-y-4', className)}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All Requests</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="review">Needs Review</TabsTrigger>
        <TabsTrigger value="my">My Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <DocumentRequestList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <DocumentRequestList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>

      <TabsContent value="review" className="mt-4">
        <DocumentRequestList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>

      <TabsContent value="my" className="mt-4">
        <MyPendingRequestsView />
      </TabsContent>
    </Tabs>
  )
}

function MyPendingRequestsView() {
  const { data: requests, isLoading } = useMyPendingDocumentRequests()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No pending document requests assigned to you</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group requests by urgency
  const requestGroups = {
    overdue: requests.filter((r) => r.isOverdue),
    dueSoon: requests.filter(
      (r) => !r.isOverdue && r.daysRemaining <= 3 && r.daysRemaining > 0
    ),
    resubmitNeeded: requests.filter((r) => r.status === 'resubmit_needed' && !r.isOverdue),
    pending: requests.filter(
      (r) =>
        r.status === 'pending' &&
        !r.isOverdue &&
        r.daysRemaining > 3
    ),
  }

  return (
    <div className="space-y-6">
      {/* Overdue Section */}
      {requestGroups.overdue.length > 0 && (
        <RequestGroupCard
          title="Overdue"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-red-500"
          badgeColor="bg-red-100 text-red-800"
          requests={requestGroups.overdue}
        />
      )}

      {/* Due Soon Section */}
      {requestGroups.dueSoon.length > 0 && (
        <RequestGroupCard
          title="Due Soon"
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-amber-500"
          badgeColor="bg-amber-100 text-amber-800"
          requests={requestGroups.dueSoon}
        />
      )}

      {/* Resubmit Needed Section */}
      {requestGroups.resubmitNeeded.length > 0 && (
        <RequestGroupCard
          title="Resubmit Needed"
          icon={<RotateCcw className="h-5 w-5" />}
          iconColor="text-orange-500"
          badgeColor="bg-orange-100 text-orange-800"
          requests={requestGroups.resubmitNeeded}
        />
      )}

      {/* Pending Section */}
      {requestGroups.pending.length > 0 && (
        <RequestGroupCard
          title="Pending"
          icon={<FileText className="h-5 w-5" />}
          iconColor="text-gray-500"
          badgeColor="bg-gray-100 text-gray-800"
          requests={requestGroups.pending}
        />
      )}
    </div>
  )
}

interface RequestGroupCardProps {
  title: string
  icon: React.ReactNode
  iconColor: string
  badgeColor: string
  requests: DocumentRequest[]
}

function RequestGroupCard({
  title,
  icon,
  iconColor,
  badgeColor,
  requests,
}: RequestGroupCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge className={badgeColor}>{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {requests.map((request) => (
            <DocumentRequestCard key={request.id} request={request} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { DocumentRequestList } from './document-request-list'
export { DocumentRequestForm } from './document-request-form'
export { DocumentRequestCard } from './document-request-card'
