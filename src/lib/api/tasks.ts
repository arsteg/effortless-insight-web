import { apiClient } from './client'
import type {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types'

export const tasksApi = {
  // Get tasks for a notice
  async getByNotice(noticeId: string): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/notices/${noticeId}/tasks`
    )
    return response.data.data
  },

  // Create task
  async create(noticeId: string, data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/notices/${noticeId}/tasks`,
      data
    )
    return response.data.data
  },

  // Update task
  async update(noticeId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<ApiResponse<Task>>(
      `/notices/${noticeId}/tasks/${taskId}`,
      data
    )
    return response.data.data
  },

  // Delete task
  async delete(noticeId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/notices/${noticeId}/tasks/${taskId}`)
  },

  // Complete task
  async complete(noticeId: string, taskId: string): Promise<Task> {
    return this.update(noticeId, taskId, { status: 'completed' })
  },

  // Reopen task
  async reopen(noticeId: string, taskId: string): Promise<Task> {
    return this.update(noticeId, taskId, { status: 'pending' })
  },
}
