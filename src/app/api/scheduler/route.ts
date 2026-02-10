import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

// Delay helper to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    // Check for cron secret if configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ALL pending posts
    const posts = await prisma.post.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (posts.length === 0) {
      return NextResponse.json({ message: 'No pending posts' });
    }

    // Get config (DB first, then env vars, then default)
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

    // Post each pending image with delay to avoid rate limits
    for (const post of posts) {
      try {
        await sendTelegramMessage({
          botToken,
          chatId: channelId,
          imageUrl: post.imageUrl,
          caption: post.caption,
        });

        // Update post status
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        results.success.push(post.id);
        
        // Small delay between posts to avoid Telegram rate limits (350ms)
        if (posts.length > 1) {
          await delay(350);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({ id: post.id, error: errorMessage });
        console.error(`Failed to send post ${post.id}:`, errorMessage);
      }
    }

    return NextResponse.json({ 
      success: true, 
      posted: results.success.length,
      failed: results.failed.length,
      results 
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send posts';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
