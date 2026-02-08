import { Handler, schedule } from '@netlify/functions';
import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

const handler: Handler = async (event, context) => {
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

// Schedule: Run every Sunday at 12:00 AM UTC
export const scheduledHandler = schedule('0 0 * * 0', handler);
