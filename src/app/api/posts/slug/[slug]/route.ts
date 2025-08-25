import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{slug: string}> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({
      where: { slug: slug, published: true},
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}