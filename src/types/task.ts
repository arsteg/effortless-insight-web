// Task types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: TaskPriority
  status: TaskStatus
  assignedToId?: string
  assignedToName?: string
  createdById: string
  createdByName?: string
  completedAt?: string
  completedById?: string
  createdAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  assignedToId?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  status?: TaskStatus
  assignedToId?: string
}
