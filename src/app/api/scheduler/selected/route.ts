import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    // Get only pending posts that match the IDs
    const posts = await prisma.post.findMany({
      where: { 
        id: { in: ids },
        status: 'PENDING'
      },
      orderBy: { createdAt: 'asc' },
    });

    if (posts.length === 0) {
      return NextResponse.json({ error: 'No pending posts found for selected IDs' }, { status: 400 });
    }

    // Get config
    const dbConfig = await prisma.config.findFirst();
    const botToken = dbConfig?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const channelId = dbConfig?.telegramChannelId || process.env.TELEGRAM_CHANNEL_ID || '5987629480';
    
    if (!botToken) {
      return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 400 });
    }
    
    if (!channelId) {
      return NextResponse.json({ error: 'Telegram channel ID not configured' }, { status: 400 });
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Post each selected image
    for (const post of posts) {
      try {
        await sendTelegramMessage({
          botToken,
          chatId: channelId,
          imageUrl: post.imageUrl,
          caption: post.caption,
        });

        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        results.success.push(post.id);
        
        if (posts.length > 1) {
          await delay(350);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({ id: post.id, error: errorMessage });
      }
    }

    return NextResponse.json({ 
      success: true, 
      posted: results.success.length,
      failed: results.failed.length,
      results 
    });
  } catch (error) {
    console.error('Post selected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send posts';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}