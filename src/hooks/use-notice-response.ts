import { useQuery } from '@tanstack/react-query'
import { noticesApi } from '@/lib/api'

// Both editors share one response record and must handle load errors identically.
export function useNoticeResponse(noticeId: string) {
  return useQuery({
    queryKey: ['notices', noticeId, 'response'],
    queryFn: async () => {
      try { return await noticesApi.getLatestResponse(noticeId) }
      catch (error) {
        const value = error as { code?: string; response?: { status?: number; data?: { code?: string } } }
        if (value?.code === 'NOT_FOUND' || value?.response?.status === 404 || value?.response?.data?.code === 'NOT_FOUND') return null
        throw error
      }
    },
  })
}
