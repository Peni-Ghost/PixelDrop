import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicId, url, format, width, height } = body;

    const asset = await prisma.asset.create({
      data: {
        publicId,
        url,
        format,
        width,
        height,
        status: 'available'
      }
    });

    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}
