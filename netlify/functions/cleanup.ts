import { Handler } from '@netlify/functions';
import { prisma } from '../../src/lib/prisma';
import { PostStatus } from '@prisma/client';

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
    // Delete all SENT posts
    const result = await prisma.post.deleteMany({
      where: { status: PostStatus.SENT },
    });

    console.log(`Cleaned up ${result.count} sent posts`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        deletedCount: result.count,
        message: `Deleted ${result.count} sent posts`,
      }),
    };
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler as default };
