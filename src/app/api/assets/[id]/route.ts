import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { caption, status } = body;

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (status !== undefined) updateData.status = status;

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
