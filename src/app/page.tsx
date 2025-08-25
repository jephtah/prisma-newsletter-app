import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate, truncateText } from '@/lib/utils'
import NewsletterSignup from '@/components/NewsletterSignup'

async function getPublishedPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        published: true,
        publishedAt: true,
        createdAt: true,
      },
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function Homepage() {
  const posts = await getPublishedPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Code & Groovy Letters</h1>
              <p className="text-gray-600">Thoughts, insights, and updates</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Posts</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-4">No posts published yet.</div>
              <Link
                href="/admin/new"
                className="btn-brown"
              >
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <time className="text-sm text-gray-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </time>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:text-amber-800 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-700 mb-4">
                    {truncateText(post.content, 200)}
                  </p>
                  
                  <Link
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium"
                  >
                    Read more
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
        
        <section className="bg-white rounded-lg shadow-sm p-6 mt-12 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-4">
            Get the latest posts delivered directly to your inbox.
          </p>
          <NewsletterSignup />
        </section>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Personal Newsletter. Built with Next.js and Prisma.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}