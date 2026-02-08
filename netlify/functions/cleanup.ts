import { Handler, schedule } from '@netlify/functions';
import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

const handler: Handler = async (event, context) => {
  // Accept both GET and POST for cron-job.org compatibility
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
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
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await prisma.$disconnect();
  }
};

// Export for Netlify scheduled functions (requires paid plan)
export const scheduledHandler = schedule('0 0 * * 0', handler);

// Also export as default for HTTP requests (for cron-job.org)
export { handler as default };
