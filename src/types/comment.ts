// Comment types
export interface Comment {
  id: string
  content: string
  isInternal: boolean
  parentId?: string
  userId: string
  userName?: string
  replies: Comment[]
  createdAt: string
}

export interface CreateCommentRequest {
  content: string
  isInternal?: boolean
  parentId?: string
}
