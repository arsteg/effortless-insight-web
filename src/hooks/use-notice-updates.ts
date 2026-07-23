'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { noticeUpdateService, NoticeStatusEvent } from '@/services/notice-updates'
import { noticeKeys } from '@/hooks/use-notices'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook that establishes a SignalR connection to receive real-time notice status updates.
 * When a notice finishes processing, the UI automatically updates without requiring a manual refresh.
 */
export function useNoticeUpdates() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const { toast } = useToast()

  useEffect(() => {
    const organizationId = user?.organization?.id
    if (!organizationId) return

    // Connect to NoticeHub
    noticeUpdateService.connect(organizationId).catch(console.error)

    // Subscribe to updates
    const unsubscribe = noticeUpdateService.subscribe((event: NoticeStatusEvent) => {
      // Invalidate notice queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(event.noticeId) })
      queryClient.invalidateQueries({ queryKey: noticeKeys.statistics() })

      // Show toast notification
      if (event.status === 'analyzed') {
        toast({
          title: 'Notice processed',
          description: `Notice has been analyzed. Risk: ${event.riskLevel || 'Unknown'}`,
          variant: 'success',
        })
      } else if (event.status === 'failed') {
        toast({
          title: 'Processing failed',
          description: 'Notice processing failed. You can retry from the notice details.',
          variant: 'destructive',
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user?.organization?.id, queryClient, toast])
}
