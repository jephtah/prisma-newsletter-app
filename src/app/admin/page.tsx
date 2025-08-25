'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Post } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?includeUnpublished=true')
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete post')
      
      fetchPosts()
    } catch (err) {
      alert('Failed to delete post')
    }
  }

  const getPostStatus = (post: Post) => {
    if (!post.published) return { text: 'Draft', color: 'bg-gray-100 text-gray-800' }
    if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
      return { text: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { text: 'Published', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchPosts}
          className="btn-brown"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
        <Link
          href="/admin/new"
          className="btn-brown"
        >
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">No posts found</div>
          <Link
            href="/admin/new"
            className="btn-brown"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => {
              const status = getPostStatus(post)
              return (
                <li key={post.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color} mr-3`}
                          >
                            {status.text}
                          </span>
                          <span>Created: {formatDateTime(post.createdAt)}</span>
                          {post.scheduledAt && (
                            <span className="ml-4">
                              Scheduled: {formatDateTime(post.scheduledAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {post.published && (
                          <Link
                            href={`/posts/${post.slug}`}
                            className="text-amber-700 hover:text-amber-800 text-sm font-medium"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/edit/${post.id}`}
                          className="text-amber-700 hover:text-amber-800 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}