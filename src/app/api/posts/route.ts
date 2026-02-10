import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, caption } = body;

    const post = await prisma.post.create({
      data: {
        imageUrl,
        caption,
        status: PostStatus.PENDING,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
