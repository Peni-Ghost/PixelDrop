import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    // Delete all posts in a single transaction
    const result = await prisma.post.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ 
      success: true, 
      deleted: result.count 
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
  }
}