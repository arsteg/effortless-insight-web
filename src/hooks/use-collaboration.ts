import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  taskApi,
  taskTemplateApi,
  commentApi,
  documentRequestApi,
  documentRequestTemplateApi,
  activityApi,
  fileApi,
  timeTrackingApi,
} from '@/services/collaboration'
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskTemplateRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateDocumentRequestRequest,
  UpdateDocumentRequestRequest,
  DocumentReviewRequest,
  CreateDocumentRequestTemplateRequest,
  CreateFolderRequest,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TaskStatus,
  TaskPriority,
} from '@/types/collaboration'

// =============================================================================
// TASK HOOKS
// =============================================================================

export function useTasks(
  noticeId: string,
  params?: {
    status?: TaskStatus
    assignee?: string
    priority?: TaskPriority
    includeSubtasks?: boolean
  }
) {
  return useQuery({
    queryKey: ['tasks', noticeId, params],
    queryFn: () => taskApi.getTasksForNotice(noticeId, params),
    enabled: !!noticeId,
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getTaskById(taskId),
    enabled: !!taskId,
  })
}

export function useMyTasks(params?: {
  status?: TaskStatus
  priority?: TaskPriority
  dueWithin?: 'today' | 'week' | 'month'
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['myTasks', params],
    queryFn: () => taskApi.getMyTasks(params),
  })
}

export function useCreateTask(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskApi.createTask(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useUpdateTask(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      taskApi.updateTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useDeleteTask(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
    },
  })
}

export function useCompleteTask(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string
      data?: { actualHours?: number; completionNote?: string }
    }) => taskApi.completeTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

// =============================================================================
// TASK TEMPLATE HOOKS
// =============================================================================

export function useTaskTemplates(noticeType?: string) {
  return useQuery({
    queryKey: ['taskTemplates', noticeType],
    queryFn: () => taskTemplateApi.getTemplates(noticeType),
  })
}

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskTemplateRequest) => taskTemplateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] })
    },
  })
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => taskTemplateApi.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] })
    },
  })
}

// =============================================================================
// COMMENT HOOKS
// =============================================================================

export function useComments(
  noticeId: string,
  params?: {
    visibility?: 'all' | 'internal'
    includeReplies?: boolean
    sortOrder?: 'asc' | 'desc'
    page?: number
    pageSize?: number
  }
) {
  return useQuery({
    queryKey: ['comments', noticeId, params],
    queryFn: () => commentApi.getCommentsForNotice(noticeId, params),
    enabled: !!noticeId,
  })
}

export function useCreateComment(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentApi.createComment(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useReplyToComment(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: CreateCommentRequest }) =>
      commentApi.replyToComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useUpdateComment(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      commentApi.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
    },
  })
}

export function useDeleteComment(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
    },
  })
}

export function useAddReaction(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      commentApi.addReaction(commentId, { emoji }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
    },
  })
}

export function useRemoveReaction(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      commentApi.removeReaction(commentId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noticeId] })
    },
  })
}

// =============================================================================
// DOCUMENT REQUEST HOOKS
// =============================================================================

export function useDocumentRequests(noticeId: string, status?: string) {
  return useQuery({
    queryKey: ['documentRequests', noticeId, status],
    queryFn: () => documentRequestApi.getDocumentRequestsForNotice(noticeId, status),
    enabled: !!noticeId,
  })
}

export function useDocumentRequest(requestId: string) {
  return useQuery({
    queryKey: ['documentRequest', requestId],
    queryFn: () => documentRequestApi.getDocumentRequestById(requestId),
    enabled: !!requestId,
  })
}

export function useMyPendingDocumentRequests() {
  return useQuery({
    queryKey: ['myDocumentRequests'],
    queryFn: () => documentRequestApi.getMyPendingRequests(),
  })
}

export function useCreateDocumentRequest(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDocumentRequestRequest) =>
      documentRequestApi.createDocumentRequest(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useUpdateDocumentRequest(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      data: UpdateDocumentRequestRequest
    }) => documentRequestApi.updateDocumentRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
    },
  })
}

export function useDeleteDocumentRequest(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => documentRequestApi.deleteDocumentRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
    },
  })
}

export function useFulfillDocumentRequest(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, file, note }: { requestId: string; file: File; note?: string }) =>
      documentRequestApi.fulfillDocumentRequest(requestId, file, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['myDocumentRequests'] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useMarkDocumentRequestFulfilled(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      documentRequestApi.markAsFulfilled(requestId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
    },
  })
}

export function useReviewDocumentRequest(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: DocumentReviewRequest }) =>
      documentRequestApi.reviewDocumentRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useSendDocumentRequestReminder() {
  return useMutation({
    mutationFn: (requestId: string) => documentRequestApi.sendReminder(requestId),
  })
}

// =============================================================================
// DOCUMENT REQUEST TEMPLATE HOOKS
// =============================================================================

export function useDocumentRequestTemplates(noticeType?: string) {
  return useQuery({
    queryKey: ['documentRequestTemplates', noticeType],
    queryFn: () => documentRequestTemplateApi.getTemplates(noticeType),
  })
}

export function useCreateDocumentRequestTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDocumentRequestTemplateRequest) =>
      documentRequestTemplateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequestTemplates'] })
    },
  })
}

export function useDeleteDocumentRequestTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => documentRequestTemplateApi.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequestTemplates'] })
    },
  })
}

// =============================================================================
// ACTIVITY HOOKS
// =============================================================================

export function useActivityFeed(
  noticeId: string,
  params?: {
    types?: string
    since?: string
    limit?: number
  }
) {
  return useQuery({
    queryKey: ['activity', noticeId, params],
    queryFn: () => activityApi.getActivityFeedForNotice(noticeId, params),
    enabled: !!noticeId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  })
}

export function useOrganizationActivityFeed(params?: {
  types?: string
  since?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['organizationActivity', params],
    queryFn: () => activityApi.getActivityFeed(params),
  })
}

// =============================================================================
// FILE HOOKS
// =============================================================================

export function useFiles(
  noticeId: string,
  params?: {
    folderId?: string
    page?: number
    pageSize?: number
  }
) {
  return useQuery({
    queryKey: ['files', noticeId, params],
    queryFn: () => fileApi.getFilesForNotice(noticeId, params),
    enabled: !!noticeId,
  })
}

export function useCreateFolder(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFolderRequest) => fileApi.createFolder(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', noticeId] })
    },
  })
}

export function useUploadFile(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string }) =>
      fileApi.uploadFile(noticeId, file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['activity', noticeId] })
    },
  })
}

export function useDeleteFile(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => fileApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', noticeId] })
    },
  })
}

// =============================================================================
// TIME TRACKING HOOKS
// =============================================================================

export function useTimeEntries(taskId: string) {
  return useQuery({
    queryKey: ['timeEntries', taskId],
    queryFn: () => timeTrackingApi.getTimeEntries(taskId),
    enabled: !!taskId,
  })
}

export function useActiveTimer(taskId: string) {
  return useQuery({
    queryKey: ['activeTimer', taskId],
    queryFn: () => timeTrackingApi.getActiveTimer(taskId),
    enabled: !!taskId,
    refetchInterval: 1000, // Refetch every second to update timer display
  })
}

export function useLogTime(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTimeEntryRequest) => timeTrackingApi.logTime(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    },
  })
}

export function useStartTimer(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => timeTrackingApi.startTimer(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] })
      queryClient.invalidateQueries({ queryKey: ['activeTimer', taskId] })
    },
  })
}

export function useStopTimer(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entryId: string) => timeTrackingApi.stopTimer(taskId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] })
      queryClient.invalidateQueries({ queryKey: ['activeTimer', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    },
  })
}

export function useUpdateTimeEntry(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: UpdateTimeEntryRequest }) =>
      timeTrackingApi.updateTimeEntry(taskId, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] })
    },
  })
}

export function useDeleteTimeEntry(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entryId: string) => timeTrackingApi.deleteTimeEntry(taskId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    },
  })
}
