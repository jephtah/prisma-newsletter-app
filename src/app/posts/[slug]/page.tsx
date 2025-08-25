import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import NewsletterSignup from '@/components/NewsletterSignup'

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { 
        slug: slug,
        published: true,
      },
    })
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-amber-800 hover:text-amber-900"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Newsletter
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm p-8 border">
          <div className="mb-6">
            <time className="text-sm text-gray-500">
              {formatDate(post.publishedAt || post.createdAt)}
            </time>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </article>

        <section className="bg-white rounded-lg shadow-sm p-6 mt-8 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Enjoyed this post?
          </h2>
          <p className="text-gray-600 mb-4">
            Subscribe to get notified when we publish new content.
          </p>
          <NewsletterSignup />
        </section>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            View all posts
          </Link>
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Personal Newsletter`,
    description: post.content.slice(0, 160) + '...',
  }
}