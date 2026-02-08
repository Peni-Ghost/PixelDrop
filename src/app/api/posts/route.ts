import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

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
