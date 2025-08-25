import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Post } from "@/generated/prisma";

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required'),
  published: z.boolean().optional().default(false),
  scheduledAt: z.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const posts = await prisma.post.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
        publishedAt: true,
        scheduledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData = PostSchema.parse(body);
    
    if (!parsedData.slug) {
      parsedData.slug = parsedData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const postData: Partial<Post> = {
      title: parsedData.title,
      content: parsedData.content,
      slug: parsedData.slug,
      published: parsedData.published,
      scheduledAt: parsedData.scheduledAt,
    };

    if (parsedData.scheduledAt) {
      postData.scheduledAt = new Date(parsedData.scheduledAt)
    }

    if (parsedData.published && !parsedData.scheduledAt) {
      postData.publishedAt = new Date()
    }

    const newPost = await prisma.post.create({
      data: {
        title: parsedData.title,
        content: parsedData.content,
        slug: parsedData.slug,
        published: parsedData.published
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
