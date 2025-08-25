'use client'

import { useState, useEffect } from 'react'
import { Subscriber } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers')
      if (!response.ok) throw new Error('Failed to fetch subscribers')
      const data = await response.json()
      setSubscribers(data)
    } catch (err) {
      setError('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const processScheduledPosts = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/posts/process-scheduled', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to process scheduled posts')
      }
      
      const result = await response.json()
      alert(`Processed scheduled posts: ${result.message}`)
    } catch (error) {
      alert('Failed to process scheduled posts: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading subscribers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchSubscribers}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage your newsletter subscribers</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="text-2xl font-bold text-amber-800">{subscribers.length}</div>
            <div className="text-sm text-gray-600">Total Subscribers</div>
          </div>
          <button
            onClick={processScheduledPosts}
            disabled={processing}
            className="btn-brown disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Process Scheduled Posts'}
          </button>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 border">
            <div className="text-gray-600 mb-4">No subscribers yet</div>
            <p className="text-sm text-gray-500">
              Subscribers will appear here when people sign up for your newsletter.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {subscriber.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">{subscriber.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <span>Joined: {formatDateTime(subscriber.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email Service Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Email Service Status</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Currently using <strong>mock email service</strong> for development.</p>
              <p>Check the console logs to see email sending simulation.</p>
              <p>In production, replace with a real service like SendGrid, Postmark, or Mailgun.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}