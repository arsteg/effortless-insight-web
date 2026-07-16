'use client'

import Link from 'next/link'
import { FileSearch, RefreshCw, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from './status-badge'
import { useSimilarNotices } from '@/hooks/use-notices'
import { cn } from '@/lib/utils'

interface SimilarNoticesProps {
  noticeId: string
}

export function SimilarNotices({ noticeId }: SimilarNoticesProps) {
  const { data: similarNotices, isLoading, error, refetch, isRefetching } = useSimilarNotices(noticeId)

  if (isLoading) {
    return <SimilarNoticesSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileSearch className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Similar Notices</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            We encountered an error while finding similar notices. Please try again.
          </p>
          <Button onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!similarNotices || similarNotices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Similar Notices Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI couldn&apos;t find any similar notices in your organization.
            Similar notices are identified based on content, notice type, and context.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSearch className="h-5 w-5" />
            Similar Notices ({similarNotices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These notices have been identified by AI as similar based on content, notice type, and context.
            Use them for precedent research and reference.
          </p>
          <div className="space-y-4">
            {similarNotices.map((notice) => (
              <SimilarNoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SimilarNoticeCardProps {
  notice: {
    id: string
    noticeNumber?: string
    noticeType?: string
    status: string
    similarityScore: number
    summary?: string
    responseDeadline?: string
  }
}

function SimilarNoticeCard({ notice }: SimilarNoticeCardProps) {
  const similarityPercent = Math.round(notice.similarityScore * 100)

  return (
    <Link href={`/notices/${notice.id}`}>
      <div
        className={cn(
          'flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50',
          'cursor-pointer'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">
                {notice.noticeNumber || 'Notice'}
              </span>
              {notice.noticeType && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {notice.noticeType}
                </Badge>
              )}
              <StatusBadge status={notice.status as Parameters<typeof StatusBadge>[0]['status']} />
            </div>
            {notice.summary && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {notice.summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Similarity</span>
              <span className={cn(
                'font-medium',
                similarityPercent >= 80 && 'text-green-600',
                similarityPercent >= 60 && similarityPercent < 80 && 'text-yellow-600',
                similarityPercent < 60 && 'text-muted-foreground'
              )}>
                {similarityPercent}%
              </span>
            </div>
            <Progress
              value={similarityPercent}
              className="h-1.5"
            />
          </div>
          {notice.responseDeadline && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Due: {new Date(notice.responseDeadline).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

function SimilarNoticesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Skeleton className="h-1.5 w-full" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
