import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mask token for display (show last 4 chars only)
function maskToken(token: string): string {
  if (!token || token.length < 8) return token;
  return '••••••••••••••••••••••••••';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeSecret = searchParams.get('secret') === 'true';
    
    const config = await prisma.config.findFirst();
    
    const botToken = config?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '';
    // Default to user's Telegram ID if no channel configured
    const channelId = config?.telegramChannelId || process.env.TELEGRAM_CHANNEL_ID || '5987629480';
    
    if (includeSecret) {
      // Return full token for server-side testing
      return NextResponse.json({
        telegramBotToken: botToken,
        telegramChannelId: channelId,
      });
    }
    
    // Return masked token for display, full channel ID
    return NextResponse.json({
      telegramBotToken: maskToken(botToken),
      telegramChannelId: channelId,
      hasToken: !!botToken, // Flag to show if token exists
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramBotToken, telegramChannelId } = body;

    const existing = await prisma.config.findFirst();
    
    let config;
    if (existing) {
      // Only update fields that are provided
      const updateData: { telegramBotToken?: string; telegramChannelId?: string } = {};
      if (telegramBotToken !== undefined) updateData.telegramBotToken = telegramBotToken;
      if (telegramChannelId !== undefined) updateData.telegramChannelId = telegramChannelId;
      
      config = await prisma.config.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      config = await prisma.config.create({
        data: { 
          telegramBotToken: telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
          telegramChannelId: telegramChannelId || process.env.TELEGRAM_CHANNEL_ID || '',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
