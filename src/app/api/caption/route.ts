import { NextRequest, NextResponse } from 'next/server';
import exifr from 'exifr';

// Brand-focused hashtag sets
const HASHTAG_SETS = {
  general: ['#branding', '#marketing', '#digitalmarketing', '#contentmarketing', '#socialmedia'],
  tech: ['#tech', '#innovation', '#digital', '#technology', '#future'],
  lifestyle: ['#lifestyle', '#inspiration', '#motivation', '#success', '#mindset'],
  business: ['#business', '#entrepreneur', '#startup', '#leadership', '#growth'],
  creative: ['#creative', '#design', '#art', '#visual', '#aesthetic'],
};

// Platform-specific limits
const LIMITS = {
  telegram: 4096,
  x: 280,
  linkedin: 3000,
};

function generateHashtags(metadata: Record<string, any>, fileName?: string): string[] {
  const tags: string[] = [];
  
  // Detect category from metadata or filename
  const text = `${metadata.ImageDescription || ''} ${fileName || ''}`.toLowerCase();
  
  if (text.match(/tech|code|app|software|ai|digital/)) {
    tags.push(...HASHTAG_SETS.tech.slice(0, 3));
  } else if (text.match(/business|work|office|meeting|professional/)) {
    tags.push(...HASHTAG_SETS.business.slice(0, 3));
  } else if (text.match(/design|art|creative|color|photo/)) {
    tags.push(...HASHTAG_SETS.creative.slice(0, 3));
  } else if (text.match(/life|style|travel|food|fitness/)) {
    tags.push(...HASHTAG_SETS.lifestyle.slice(0, 3));
  } else {
    tags.push(...HASHTAG_SETS.general.slice(0, 3));
  }
  
  // Always add some engagement hashtags
  tags.push('#content', '#pixeldrop');
  
  return tags;
}

function generateSEOKeywords(metadata: Record<string, any>, fileName?: string): string {
  const keywords: string[] = [];
  
  if (metadata.Make || metadata.Model) {
    keywords.push(`${metadata.Make || ''} ${metadata.Model || ''}`.trim());
  }
  
  if (metadata.ImageWidth && metadata.ImageHeight) {
    keywords.push('high quality', 'professional photography');
  }
  
  if (fileName) {
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    keywords.push(cleanName);
  }
  
  return keywords.join(', ');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, fileName, platform = 'all' } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    let metadata: Record<string, any> = {};

    // Try to extract EXIF data
    try {
      metadata = await exifr.parse(imageUrl, {
        exif: true,
        gps: true,
        iptc: true,
      }) || {};
    } catch {
      // Ignore EXIF errors
    }

    const hashtags = generateHashtags(metadata, fileName);
    const seoKeywords = generateSEOKeywords(metadata, fileName);
    
    // Build base content elements
    const date = metadata.DateTimeOriginal || metadata.CreateDate 
      ? new Date(metadata.DateTimeOriginal || metadata.CreateDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })
      : null;
    
    const camera = metadata.Make || metadata.Model 
      ? `Shot on ${[metadata.Make, metadata.Model].filter(Boolean).join(' ')}`
      : null;
    
    const location = metadata.latitude && metadata.longitude
      ? `📍 Location: ${metadata.latitude.toFixed(4)}, ${metadata.longitude.toFixed(4)}`
      : null;

    // Generate platform-specific captions
    const captions: Record<string, string> = {};
    
    // TELEGRAM (Full version)
    const telegramParts: string[] = [];
    if (date) telegramParts.push(`📅 ${date}`);
    telegramParts.push('✨ New content drop!');
    if (camera) telegramParts.push(camera);
    if (location) telegramParts.push(location);
    telegramParts.push('', ...hashtags);
    captions.telegram = telegramParts.join('\n');

    // X (Twitter) - Short, punchy
    const xParts: string[] = [];
    xParts.push('✨ Fresh drop!');
    if (camera) xParts.push(camera);
    xParts.push(hashtags.slice(0, 2).join(' '));
    let xCaption = xParts.join('\n\n');
    // Ensure under 280 chars
    if (xCaption.length > 250) {
      xCaption = `✨ Fresh content!\n\n${hashtags.slice(0, 2).join(' ')}`;
    }
    captions.x = xCaption;

    // LINKEDIN - Professional, longer
    const linkedinParts: string[] = [];
    linkedinParts.push('✨ New visual content ready to share!');
    linkedinParts.push('');
    if (date) linkedinParts.push(`Captured on ${date}`);
    if (camera) linkedinParts.push(camera);
    linkedinParts.push('');
    linkedinParts.push('Quality content drives engagement. What do you think? 👇');
    linkedinParts.push('');
    linkedinParts.push(hashtags.join(' '));
    captions.linkedin = linkedinParts.join('\n');

    // Default/FULL version
    captions.full = captions.telegram;

    // Clean filename for alt text
    const altText = fileName
      ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      : 'Visual content';

    return NextResponse.json({ 
      captions,
      activePlatform: platform === 'all' ? 'full' : platform,
      metadata: {
        hasExif: Object.keys(metadata).length > 0,
        camera: camera,
        date: date,
        location: location,
        seoKeywords,
      },
      altText,
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    
    // Fallback captions
    const fallbackHashtags = '#content #marketing #branding #pixeldrop';
    return NextResponse.json({ 
      captions: {
        full: `✨ New content drop!\n\n${fallbackHashtags}`,
        telegram: `✨ New content drop!\n\n${fallbackHashtags}`,
        x: `✨ Fresh drop!\n\n#content #pixeldrop`,
        linkedin: `✨ New visual content ready to share!\n\nQuality content drives engagement. What do you think? 👇\n\n${fallbackHashtags}`,
      },
      activePlatform: 'full',
      metadata: { hasExif: false, seoKeywords: 'content, marketing, branding' },
      altText: 'Visual content',
    });
  }
}