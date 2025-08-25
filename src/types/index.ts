export interface Post {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  scheduledAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Subscriber {
  id: string
  email: string
  name: string | null
  createdAt: Date
  isActive: boolean
}

export interface CreatePostData {
  title: string
  content: string
  slug?: string
  published?: boolean
  scheduledAt?: string
}

export interface UpdatePostData {
  title?: string
  content?: string
  slug?: string
  published?: boolean
  publishedAt?: Date | null
  scheduledAt?: Date | null
}

export interface CreateSubscriberData {
  email: string
  name?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: unknown[]
}