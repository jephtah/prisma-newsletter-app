import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNewsletterForPost } from '@/lib/email'

export async function POST() {
  try {
    const now = new Date()
    
    const scheduledPosts = await prisma.post.findMany({
      where: {
        published: true,
        scheduledAt: {
          lte: now, 
        },
        publishedAt: null, 
      }
    })

    console.log(`
      Found ${scheduledPosts.length} scheduled posts ready to be published
      `)

    const results = []

    for (const post of scheduledPosts) {
      try {
        const publishedPost = await prisma.post.update({
          where: { id: post.id },
          data: {
            publishedAt: now,
            scheduledAt: null,
          }
        })

        console.log(`Published scheduled post: ${publishedPost.title}`)
       
        try {
          const emailResults = await sendNewsletterForPost(publishedPost)
          console.log(
            `
            Newsletter sent for "${publishedPost.title}": ${emailResults.sent} sent, ${emailResults.failed} failed
            `
          )
          
          results.push({
            postId: publishedPost.id,
            title: publishedPost.title,
            status: 'success',
            emailResults
          })
        } catch (emailError) {
          console.error(`Email failed for "${publishedPost.title}":`, emailError)
          results.push({
            postId: publishedPost.id,
            title: publishedPost.title,
            status: 'published_but_email_failed',
            error: emailError instanceof Error ? emailError.message : 'Unknown email error'
          })
        }
      } catch (error) {
        console.error(`Failed to publish scheduled post ${post.id}:`, error)
        results.push({
          postId: post.id,
          title: post.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${scheduledPosts.length} scheduled posts`,
      results
    })

  } catch (error) {
    console.error('Error processing scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const now = new Date()
    
    const scheduledPosts = await prisma.post.findMany({
      where: {
        published: true,
        scheduledAt: {
          lte: now,
        },
        publishedAt: null,
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: `Found ${scheduledPosts.length} posts ready to be published`,
      posts: scheduledPosts
    })

  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }
}