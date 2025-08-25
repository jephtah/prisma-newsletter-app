import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNewsletterForPost } from '@/lib/email'
import { z } from 'zod'
import { UpdatePostData } from '@/types'

const PostUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  published: z.boolean().optional(),
  scheduledAt: z.date().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = PostUpdateSchema.parse(body)

    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const updateData: UpdatePostData = { ...validatedData }

    const isBeingPublished = validatedData.published && !existingPost.published
    if (isBeingPublished) {
      updateData.publishedAt = new Date()
    }

    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt)
    } else if (validatedData.scheduledAt === null) {
      updateData.scheduledAt = null
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    })

    if (isBeingPublished && !post.scheduledAt) {
      try {
        console.log('📧 Triggering newsletter email for published post:', post.title)
        sendNewsletterForPost(post).catch(error => {
          console.error('Newsletter email failed:', error)
        })
      } catch (error) {
        console.error('Error triggering newsletter email:', error)
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}