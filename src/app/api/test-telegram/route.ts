import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken: providedToken, chatId: providedChatId } = body;

    // Use provided token or fall back to stored config/env
    let botToken = providedToken;
    if (!botToken || botToken.startsWith('•')) {
      const dbConfig = await prisma.config.findFirst();
      botToken = dbConfig?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '';
    }

    // Use provided chat ID or fall back to stored config/env/default
    let chatId = providedChatId;
    if (!chatId) {
      const dbConfig = await prisma.config.findFirst();
      chatId = dbConfig?.telegramChannelId || process.env.TELEGRAM_CHANNEL_ID || '5987629480';
    }

    if (!botToken) {
      return NextResponse.json({ success: false, message: 'No bot token configured' });
    }

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'No channel ID configured' });
    }

    // Test the bot token
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Invalid bot token' });
    }

    const data = await response.json();
    
    if (!data.ok) {
      return NextResponse.json({ success: false, message: 'Bot token validation failed' });
    }

    // Also try to get chat info to verify channel access
    try {
      const chatUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`;
      const chatResponse = await fetch(chatUrl);
      const chatData = await chatResponse.json();
      
      if (chatData.ok) {
        return NextResponse.json({ 
          success: true, 
          message: `Connected as @${data.result.username}. Can access: ${chatData.result.title || chatId}` 
        });
      } else {
        // Check if it's a "chat not found" error (user hasn't started bot)
        const isUserId = /^\d+$/.test(chatId);
        const isChatNotFound = chatData.description?.includes('chat not found') || chatData.description?.includes('user not found');
        
        if (isUserId && isChatNotFound) {
          return NextResponse.json({ 
            success: true, 
            message: `Connected as @${data.result.username}. ⚠️ You need to START the bot first! Open @${data.result.username} in Telegram and click START.` 
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Connected as @${data.result.username}. Warning: Cannot access - ${chatData.description}` 
        });
      }
    } catch {
      return NextResponse.json({ 
        success: true, 
        message: `Connected as @${data.result.username}` 
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Connection test failed' });
  }
}