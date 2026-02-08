import { Handler } from '@netlify/functions';
import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

const handler: Handler = async (event, context) => {
  // Accept both GET and POST for cron-job.org compatibility
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    // Get config for Telegram
    const config = await prisma.config.findFirst();
    
    if (!config?.telegramBotToken || !config?.telegramChannelId) {
      console.log('Telegram not configured');
      return { 
        statusCode: 200, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Telegram not configured' }) 
      };
    }

    // Find oldest PENDING post
    const post = await prisma.post.findFirst({
      where: { status: PostStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    if (!post) {
      console.log('No pending posts to send');
      return { 
        statusCode: 200, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No pending posts' }) 
      };
    }

    // Send to Telegram
    const botToken = config.telegramBotToken;
    const channelId = config.telegramChannelId;
    
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        photo: post.imageUrl,
        caption: post.caption || '',
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    // Update post status to SENT
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.SENT,
        sentAt: new Date(),
      },
    });

    console.log(`Posted ${post.id} to Telegram`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        postId: post.id,
        sentAt: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    console.error('Daily post error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await prisma.$disconnect();
  }
};

export { handler as default };
