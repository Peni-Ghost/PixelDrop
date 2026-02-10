import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import exifr from 'exifr';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Brand-focused templates by category
const TEMPLATES = {
  celebration: {
    telegram: (context: string) => `🎉 ${context}\n\nCelebrating the moment!\n\n#celebration #branding #content`,
    x: (context: string) => `🎉 ${context}\n\n#celebration #branding #content`,
    linkedin: (context: string) => `✨ ${context}\n\nCelebrating milestones and moments that matter. What's worth celebrating in your world today?\n\n#celebration #branding #contentmarketing`,
  },
  promotion: {
    telegram: (context: string) => `📢 ${context}\n\nDon't miss out!\n\n#promo #branding #marketing`,
    x: (context: string) => `📢 ${context}\n\nLimited time! #promo #branding`,
    linkedin: (context: string) => `📢 ${context}\n\nExciting news to share! Stay tuned for more updates.\n\n#announcement #branding #marketing`,
  },
  seasonal: {
    telegram: (context: string) => `🌟 ${context}\n\nNew month, new beginnings!\n\n#newmonth #seasonal #branding`,
    x: (context: string) => `🌟 ${context}\n\n#newmonth #goals #branding`,
    linkedin: (context: string) => `🌟 ${context}\n\nWelcoming new opportunities and fresh starts. What are your goals this month?\n\n#newmonth #professionalgrowth #branding`,
  },
  lifestyle: {
    telegram: (context: string) => `✨ ${context}\n\nLiving the moment!\n\n#lifestyle #branding #content`,
    x: (context: string) => `✨ ${context}\n\n#lifestyle #moments #branding`,
    linkedin: (context: string) => `✨ ${context}\n\nFinding balance and inspiration in everyday moments.\n\n#lifestyle #wellness #branding`,
  },
  default: {
    telegram: (context: string) => `✨ ${context}\n\nFresh content drop!\n\n#content #branding #pixeldrop`,
    x: (context: string) => `✨ ${context}\n\n#content #branding #pixeldrop`,
    linkedin: (context: string) => `✨ ${context}\n\nQuality content that resonates. What's your take?\n\n#contentmarketing #branding #pixeldrop`,
  },
};

// Detect category from text/context
function detectCategory(text: string): keyof typeof TEMPLATES {
  const lower = text.toLowerCase();
  if (lower.match(/new month|february|january|march|april|may|june|july|august|september|october|november|december|new year|holiday|season/)) return 'seasonal';
  if (lower.match(/celebrate|congrat|happy|joy|party|anniversary/)) return 'celebration';
  if (lower.match(/sale|promo|discount|offer|deal|launch|announce/)) return 'promotion';
  if (lower.match(/life|lifestyle|moment|experience|journey/)) return 'lifestyle';
  return 'default';
}

// Extract context from filename
function extractContext(fileName?: string): string {
  if (!fileName) return 'New visual content';
  
  // Remove extension and clean up
  const clean = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Convert to title case
  return clean.replace(/\b\w/g, (l: string) => l.toUpperCase());
}

// Analyze image using Cloudinary (if available)
async function analyzeImage(imageUrl: string): Promise<{ tags: string[]; context: string }> {
  try {
    // Extract public ID from Cloudinary URL
    const match = imageUrl.match(/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
    if (!match) return { tags: [] as string[], context: '' };
    
    const publicId = match[1];
    
    // Get image details from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      tags: true,
      context: true,
    });
    
    return {
      tags: (result.tags || []) as string[],
      context: result.context?.custom?.caption || '',
    };
  } catch {
    return { tags: [] as string[], context: '' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, fileName, platform = 'all' } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    let metadata: Record<string, any> = {};
  let cloudinaryData: { tags: string[]; context: string } = { tags: [], context: '' };

    // Try to get EXIF data
    try {
      metadata = await exifr.parse(imageUrl, { exif: true, gps: true }) || {};
    } catch {
      // Ignore
    }

    // Try to get Cloudinary tags/context
    try {
      cloudinaryData = await analyzeImage(imageUrl);
    } catch {
      // Ignore
    }

    // Build context from all sources
    const fileContext = extractContext(fileName);
    const detectedCategory = detectCategory(fileContext + ' ' + cloudinaryData.tags.join(' '));
    const templates = TEMPLATES[detectedCategory];
    
    // Get date if available
    const date = metadata.DateTimeOriginal 
      ? new Date(metadata.DateTimeOriginal).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    // Build context string
    let mainContext = fileContext;
    if (cloudinaryData.context) {
      mainContext = cloudinaryData.context;
    }
    
    // Add date for seasonal content
    if (detectedCategory === 'seasonal') {
      mainContext = `${mainContext} - ${date}`;
    }

    // Generate platform-specific captions
    const captions: Record<string, string> = {
      full: templates.telegram(mainContext),
      telegram: templates.telegram(mainContext),
      x: templates.x(mainContext),
      linkedin: templates.linkedin(mainContext),
    };

    // SEO keywords
    const seoKeywords = [
      detectedCategory,
      'branding',
      'content',
      fileContext.toLowerCase().split(' ').slice(0, 3).join(', '),
    ].join(', ');

    return NextResponse.json({
      captions,
      activePlatform: platform === 'all' ? 'full' : platform,
      metadata: {
        category: detectedCategory,
        hasExif: Object.keys(metadata).length > 0,
        camera: metadata.Make ? `${metadata.Make} ${metadata.Model || ''}` : null,
        date,
        seoKeywords,
        cloudinaryTags: cloudinaryData.tags,
      },
    });
  } catch (error) {
    console.error('Caption error:', error);
    
    const fallback = 'Fresh content drop!';
    return NextResponse.json({
      captions: {
        full: `✨ ${fallback}\n\n#content #branding`,
        telegram: `✨ ${fallback}\n\n#content #branding`,
        x: `✨ ${fallback}\n\n#content #branding`,
        linkedin: `✨ ${fallback}\n\nQuality content that resonates.\n\n#content #branding`,
      },
      activePlatform: 'full',
      metadata: { category: 'default', seoKeywords: 'content, branding' },
    });
  }
}