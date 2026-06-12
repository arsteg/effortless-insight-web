import { api } from '@/lib/api'
import type {
  Task,
  TaskDetail,
  TaskListResponse,
  MyTasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskTemplate,
  CreateTaskTemplateRequest,
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  ReactionResponse,
  AddReactionRequest,
  DocumentRequest,
  DocumentRequestListResponse,
  CreateDocumentRequestRequest,
  UpdateDocumentRequestRequest,
  DocumentReviewRequest,
  DocumentRequestTemplate,
  CreateDocumentRequestTemplateRequest,
  ActivityFeedResponse,
  FileListResponse,
  CreateFolderRequest,
  FileFolder,
  TaskStatus,
  TaskPriority,
} from '@/types/collaboration'

// =============================================================================
// TASK API
// =============================================================================

export const taskApi = {
  // Get tasks for a notice
  getTasksForNotice: async (
    noticeId: string,
    params?: {
      status?: TaskStatus
      assignee?: string
      priority?: TaskPriority
      includeSubtasks?: boolean
    }
  ): Promise<TaskListResponse> => {
    const response = await api.get(`/notices/${noticeId}/tasks`, { params })
    return response.data
  },

  // Create a task
  createTask: async (noticeId: string, data: CreateTaskRequest): Promise<TaskDetail> => {
    const response = await api.post(`/notices/${noticeId}/tasks`, data)
    return response.data
  },

  // Get a task by ID
  getTaskById: async (taskId: string): Promise<TaskDetail> => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  // Update a task
  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<TaskDetail> => {
    const response = await api.patch(`/tasks/${taskId}`, data)
    return response.data
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`)
  },

  // Get my tasks
  getMyTasks: async (params?: {
    status?: TaskStatus
    priority?: TaskPriority
    dueWithin?: 'today' | 'week' | 'month'
    page?: number
    pageSize?: number
  }): Promise<MyTasksResponse> => {
    const response = await api.get('/tasks/my', { params })
    return response.data
  },

  // Complete a task
  completeTask: async (
    taskId: string,
    data?: { actualHours?: number; completionNote?: string }
  ): Promise<TaskDetail> => {
    const response = await api.patch(`/tasks/${taskId}`, {
      status: 'done',
      ...data,
    })
    return response.data
  },

  // Assign task
  assignTask: async (taskId: string, assignees: string[]): Promise<TaskDetail> => {
    const response = await api.patch(`/tasks/${taskId}`, { assignees })
    return response.data
  },
}

// =============================================================================
// TASK TEMPLATE API
// =============================================================================

export const taskTemplateApi = {
  // Get task templates
  getTemplates: async (noticeType?: string): Promise<TaskTemplate[]> => {
    const response = await api.get('/task-templates', {
      params: { noticeType },
    })
    return response.data
  },

  // Create a task template
  createTemplate: async (data: CreateTaskTemplateRequest): Promise<TaskTemplate> => {
    const response = await api.post('/task-templates', data)
    return response.data
  },

  // Delete a task template
  deleteTemplate: async (templateId: string): Promise<void> => {
    await api.delete(`/task-templates/${templateId}`)
  },
}

// =============================================================================
// COMMENT API
// =============================================================================

export const commentApi = {
  // Get comments for a notice
  getCommentsForNotice: async (
    noticeId: string,
    params?: {
      visibility?: 'all' | 'internal'
      includeReplies?: boolean
      sortOrder?: 'asc' | 'desc'
      page?: number
      pageSize?: number
    }
  ): Promise<CommentListResponse> => {
    const response = await api.get(`/notices/${noticeId}/comments`, { params })
    return response.data
  },

  // Create a comment
  createComment: async (noticeId: string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post(`/notices/${noticeId}/comments`, data)
    return response.data
  },

  // Reply to a comment
  replyToComment: async (commentId: string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post(`/comments/${commentId}/replies`, data)
    return response.data
  },

  // Update a comment
  updateComment: async (commentId: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.patch(`/comments/${commentId}`, data)
    return response.data
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`)
  },

  // Add a reaction
  addReaction: async (commentId: string, data: AddReactionRequest): Promise<ReactionResponse> => {
    const response = await api.post(`/comments/${commentId}/reactions`, data)
    return response.data
  },

  // Remove a reaction
  removeReaction: async (commentId: string, emoji: string): Promise<ReactionResponse> => {
    const encodedEmoji = encodeURIComponent(emoji)
    const response = await api.delete(`/comments/${commentId}/reactions/${encodedEmoji}`)
    return response.data
  },
}

// =============================================================================
// DOCUMENT REQUEST API
// =============================================================================

export const documentRequestApi = {
  // Get document requests for a notice
  getDocumentRequestsForNotice: async (
    noticeId: string,
    status?: string
  ): Promise<DocumentRequestListResponse> => {
    const response = await api.get(`/notices/${noticeId}/document-requests`, {
      params: { status },
    })
    return response.data
  },

  // Create a document request
  createDocumentRequest: async (
    noticeId: string,
    data: CreateDocumentRequestRequest
  ): Promise<DocumentRequest> => {
    const response = await api.post(`/notices/${noticeId}/document-requests`, data)
    return response.data
  },

  // Get a document request by ID
  getDocumentRequestById: async (requestId: string): Promise<DocumentRequest> => {
    const response = await api.get(`/document-requests/${requestId}`)
    return response.data
  },

  // Update a document request
  updateDocumentRequest: async (
    requestId: string,
    data: UpdateDocumentRequestRequest
  ): Promise<DocumentRequest> => {
    const response = await api.patch(`/document-requests/${requestId}`, data)
    return response.data
  },

  // Delete a document request
  deleteDocumentRequest: async (requestId: string): Promise<void> => {
    await api.delete(`/document-requests/${requestId}`)
  },

  // Fulfill a document request (upload file)
  fulfillDocumentRequest: async (
    requestId: string,
    file: File,
    note?: string
  ): Promise<DocumentRequest> => {
    const formData = new FormData()
    formData.append('file', file)
    if (note) {
      formData.append('note', note)
    }
    const response = await api.post(`/document-requests/${requestId}/fulfill`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Mark as fulfilled without file upload
  markAsFulfilled: async (requestId: string, note?: string): Promise<DocumentRequest> => {
    const response = await api.post(`/document-requests/${requestId}/mark-fulfilled`, { note })
    return response.data
  },

  // Review a submitted document
  reviewDocumentRequest: async (
    requestId: string,
    data: DocumentReviewRequest
  ): Promise<DocumentRequest> => {
    const response = await api.post(`/document-requests/${requestId}/review`, data)
    return response.data
  },

  // Send a reminder
  sendReminder: async (requestId: string): Promise<void> => {
    await api.post(`/document-requests/${requestId}/remind`)
  },

  // Get my pending requests
  getMyPendingRequests: async (): Promise<DocumentRequest[]> => {
    const response = await api.get('/document-requests/my')
    return response.data
  },
}

// =============================================================================
// DOCUMENT REQUEST TEMPLATE API
// =============================================================================

export const documentRequestTemplateApi = {
  // Get templates
  getTemplates: async (noticeType?: string): Promise<DocumentRequestTemplate[]> => {
    const response = await api.get('/document-request-templates', {
      params: { noticeType },
    })
    return response.data
  },

  // Create a template
  createTemplate: async (
    data: CreateDocumentRequestTemplateRequest
  ): Promise<DocumentRequestTemplate> => {
    const response = await api.post('/document-request-templates', data)
    return response.data
  },

  // Delete a template
  deleteTemplate: async (templateId: string): Promise<void> => {
    await api.delete(`/document-request-templates/${templateId}`)
  },
}

// =============================================================================
// ACTIVITY API
// =============================================================================

export const activityApi = {
  // Get activity feed for a notice
  getActivityFeedForNotice: async (
    noticeId: string,
    params?: {
      types?: string
      since?: string
      limit?: number
    }
  ): Promise<ActivityFeedResponse> => {
    const response = await api.get(`/notices/${noticeId}/activity`, { params })
    return response.data
  },

  // Get activity feed for organization
  getActivityFeed: async (params?: {
    types?: string
    since?: string
    limit?: number
  }): Promise<ActivityFeedResponse> => {
    const response = await api.get('/activity', { params })
    return response.data
  },
}

// =============================================================================
// FILE API
// =============================================================================

export const fileApi = {
  // Get files for a notice
  getFilesForNotice: async (
    noticeId: string,
    params?: {
      folderId?: string
      page?: number
      pageSize?: number
    }
  ): Promise<FileListResponse> => {
    const response = await api.get(`/notices/${noticeId}/files`, { params })
    return response.data
  },

  // Create a folder
  createFolder: async (noticeId: string, data: CreateFolderRequest): Promise<FileFolder> => {
    const response = await api.post(`/notices/${noticeId}/folders`, data)
    return response.data
  },

  // Upload a file
  uploadFile: async (
    noticeId: string,
    file: File,
    folderId?: string
  ): Promise<{ id: string; url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) {
      formData.append('folderId', folderId)
    }
    const response = await api.post(`/notices/${noticeId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Delete a file
  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`)
  },

  // Get download URL
  getDownloadUrl: async (fileId: string): Promise<string> => {
    const response = await api.get(`/files/${fileId}/download-url`)
    return response.data.url
  },
}
