import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPhotoToTelegram } from '@/lib/telegram';

// Cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  // Verify cron secret if set
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get next available asset
    const asset = await prisma.asset.findFirst({
      where: { status: 'available' },
      orderBy: { createdAt: 'asc' },
    });

    if (!asset) {
      return NextResponse.json({ message: 'No assets available to post' });
    }

    // Send to Telegram
    await sendPhotoToTelegram(asset.url, asset.caption || undefined);

    // Mark as posted
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        status: 'posted',
        postedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      postedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Daily post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post' },
      { status: 500 }
    );
  }
}

// Also support GET for simple cron jobs (with secret as query param)
export async function GET(req: NextRequest) {
  // Verify cron secret if set (via query param for GET)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get next available asset
    const asset = await prisma.asset.findFirst({
      where: { status: 'available' },
      orderBy: { createdAt: 'asc' },
    });

    if (!asset) {
      return NextResponse.json({ message: 'No assets available to post' });
    }

    // Send to Telegram
    await sendPhotoToTelegram(asset.url, asset.caption || undefined);

    // Mark as posted
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        status: 'posted',
        postedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      postedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Daily post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post' },
      { status: 500 }
    );
  }
}
