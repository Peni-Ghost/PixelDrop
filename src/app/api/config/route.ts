import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.config.findFirst();
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramBotToken, telegramChannelId, postTime } = body;

    const existing = await prisma.config.findFirst();
    
    let config;
    if (existing) {
      config = await prisma.config.update({
        where: { id: existing.id },
        data: {
          telegramBotToken,
          telegramChannelId,
          postTime,
        },
      });
    } else {
      config = await prisma.config.create({
        data: {
          telegramBotToken,
          telegramChannelId,
          postTime: postTime || '09:00',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
