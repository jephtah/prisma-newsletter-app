'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PostEditor from '@/components/PostEditor'
import { Post } from '@/types'

export default function EditPostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        throw new Error('Post not found')
      }
      const postData = await response.json()
      setPost(postData)
    } catch (err) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Post not found'}</div>
        <a
          href="/admin"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Admin
        </a>
      </div>
    )
  }

  return <PostEditor post={post} isEditing={true} />
}