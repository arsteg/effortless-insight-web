import { apiClient } from './client'
import type {
  ApiResponse,
  Comment,
  CreateCommentRequest,
} from '@/types'

export const commentsApi = {
  // Get comments for a notice
  async getByNotice(noticeId: string): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<Comment[]>>(
      `/notices/${noticeId}/comments`
    )
    return response.data.data
  },

  // Create comment
  async create(noticeId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/notices/${noticeId}/comments`,
      data
    )
    return response.data.data
  },

  // Delete comment
  async delete(noticeId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/notices/${noticeId}/comments/${commentId}`)
  },

  // Reply to comment
  async reply(noticeId: string, parentId: string, content: string, isInternal?: boolean): Promise<Comment> {
    return this.create(noticeId, {
      content,
      parentId,
      isInternal,
    })
  },
}
