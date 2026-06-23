'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type MyTasksParams, type MyTasksResponse } from '@/lib/api/tasks'
import { useToast } from '@/hooks/use-toast'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types'

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  myTasks: (params?: MyTasksParams) => [...taskKeys.all, 'my', params] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (noticeId: string) => [...taskKeys.lists(), noticeId] as const,
}

// Get my tasks across all notices
export function useMyTasks(params?: MyTasksParams) {
  return useQuery<MyTasksResponse>({
    queryKey: taskKeys.myTasks(params),
    queryFn: () => tasksApi.getMyTasks(params),
  })
}

// Get tasks for a notice
export function useTasks(noticeId: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.list(noticeId),
    queryFn: () => tasksApi.getByNotice(noticeId),
    enabled: !!noticeId,
  })
}

// Create task
export function useCreateTask(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(noticeId) })
      toast({
        title: 'Task created',
        description: 'The task has been created successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to create task',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Update task
export function useUpdateTask(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      tasksApi.update(noticeId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(noticeId) })
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to update task',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Delete task
export function useDeleteTask(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(noticeId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(noticeId) })
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to delete task',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Toggle task completion
export function useToggleTaskComplete(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      completed
        ? tasksApi.complete(noticeId, taskId)
        : tasksApi.reopen(noticeId, taskId),
    onSuccess: (_, { completed }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(noticeId) })
      toast({
        title: completed ? 'Task completed' : 'Task reopened',
        description: completed
          ? 'The task has been marked as complete.'
          : 'The task has been reopened.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to update task',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
