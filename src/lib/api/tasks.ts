import { apiClient } from './client'
import type {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types'

export interface MyTasksParams {
  status?: string
  priority?: string
  dueWithin?: string
  page?: number
  pageSize?: number
}

export interface MyTasksResponse {
  items: MyTask[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  summary: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
}

export interface MyTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  noticeId: string
  noticeTitle: string
  noticeNumber: string
  noticeType: string
}

export const tasksApi = {
  // Get my tasks across all notices
  async getMyTasks(params?: MyTasksParams): Promise<MyTasksResponse> {
    const response = await apiClient.get<ApiResponse<MyTasksResponse>>(
      '/tasks/my',
      { params }
    )
    return response.data.data
  },
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
