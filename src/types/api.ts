// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  success: false
  code: string
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// Pagination params
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDesc?: boolean
}
