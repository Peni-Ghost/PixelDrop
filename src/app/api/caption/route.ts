import { NextRequest, NextResponse } from 'next/server';
import exifr from 'exifr';
import { TEMPLATE_LIBRARY, fillTemplate, getTemplatesByCategory } from '@/lib/caption-templates';

// Extract keywords from filename for template matching
function extractKeywords(fileName?: string): { 
  context: string; 
  category: string;
  placeholders: Record<string, string>;
} {
  if (!fileName) {
    return { 
      context: 'New visual content', 
      category: 'engagement',
      placeholders: { 
        QUESTION: 'What content would you like to see from us?',
      }
    };
  }
  
  const clean = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
  
  // Detect category and extract context
  let category = 'engagement';
  let template = TEMPLATE_LIBRARY[0]; // default
  let placeholders: Record<string, string> = {};
  
  // Product-related
  if (clean.match(/product|launch|new|feature|update/)) {
    category = 'product';
    const productName = clean.replace(/.*(product|launch|new)\s*/, '').trim() || 'Our latest product';
    placeholders = {
      PRODUCT_NAME: productName.charAt(0).toUpperCase() + productName.slice(1),
      PRODUCT: productName.charAt(0).toUpperCase() + productName.slice(1),
      BENEFIT: 'achieve your goals faster',
      LINK: 'Check link in bio',
    };
  }
  // Sale/promo
  else if (clean.match(/sale|promo|discount|offer|deal|%/)) {
    category = 'promotion';
    placeholders = {
      DISCOUNT: '20',
      TIME: '48 hours',
      CODE: 'SAVE20',
      LINK: 'Shop now - link in bio',
    };
  }
  // Seasonal/month
  else if (clean.match(/january|february|march|april|may|june|july|august|september|october|november|december|month|year|holiday|season/)) {
    category = 'seasonal';
    const month = clean.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/)?.[0] 
      || new Date().toLocaleDateString('en-US', { month: 'long' });
    placeholders = {
      MONTH: month.charAt(0).toUpperCase() + month.slice(1),
      GOAL_1: 'Delivering value to our customers',
      GOAL_2: 'Building community',
      GOAL_3: 'Innovating for the future',
    };
  }
  // Milestone
  else if (clean.match(/milestone|anniversary|years?|users?|customers?|followers?|k|m/)) {
    category = 'milestone';
    placeholders = {
      NUMBER: '10K',
      MILESTONE: 'followers',
      BRAND: 'our brand',
    };
  }
  // Educational/tips
  else if (clean.match(/tip|trick|how|guide|learn|educat/)) {
    category = 'educational';
    placeholders = {
      TIP_TITLE: 'Pro Strategy',
      TIP_CONTENT: 'Focus on what matters most and eliminate distractions.',
      TIP_SHORT: 'Focus on what matters.',
      BENEFIT_1: 'Increased productivity',
      BENEFIT_2: 'Better results',
      BENEFIT_3: 'Less stress',
    };
  }
  // Behind the scenes
  else if (clean.match(/behind|bts|scene|process|work/)) {
    category = 'engagement';
    placeholders = {
      CONTENT: 'Creating something special takes time, effort, and dedication.',
      CONTENT_SHORT: 'The grind behind the glory.',
    };
  }
  // Celebration
  else if (clean.match(/celebrat|happy|congrat|win|success/)) {
    category = 'engagement';
    placeholders = {
      QUESTION: 'What\'s your biggest win this week?',
    };
  }
  // Default - engagement
  else {
    placeholders = {
      QUESTION: 'What do you think? Share your thoughts below!',
    };
  }
  
  // Build context from filename
  const context = clean
    .replace(/(product|launch|new|sale|promo|month|year|tip|guide)/g, '')
    .trim()
    .split(' ')
    .filter(w => w.length > 2)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Fresh content';
  
  return { context, category, placeholders };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, fileName, platform = 'all', category: forcedCategory } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Extract keywords and determine template
    const { category: detectedCategory, placeholders } = extractKeywords(fileName);
    
    // Use forced category if provided, otherwise use detected
    const category = forcedCategory || detectedCategory;
    
    // Get templates for this category
    const templates = getTemplatesByCategory(category as any);
    const selectedTemplate = templates[0] || TEMPLATE_LIBRARY[0];
    
    // Try to get EXIF data for additional context
    let metadata: Record<string, any> = {};
    try {
      metadata = await exifr.parse(imageUrl, { exif: true }) || {};
    } catch {
      // Ignore
    }
    
    // Add date if available
    const date = metadata.DateTimeOriginal 
      ? new Date(metadata.DateTimeOriginal).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    // Fill template placeholders
    const filledPlaceholders = {
      ...placeholders,
      DATE: date,
      BRAND: placeholders.BRAND || 'our brand',
    };
    
    // Generate captions for each platform
    const captions: Record<string, string> = {
      full: fillTemplate(selectedTemplate.telegram, filledPlaceholders),
      telegram: fillTemplate(selectedTemplate.telegram, filledPlaceholders),
      x: fillTemplate(selectedTemplate.x, filledPlaceholders),
      linkedin: fillTemplate(selectedTemplate.linkedin, filledPlaceholders),
    };
    
    // Add hashtags
    const hashtagString = '\n\n' + selectedTemplate.hashtags.slice(0, 5).join(' ');
    Object.keys(captions).forEach(key => {
      captions[key] += hashtagString;
    });

    return NextResponse.json({
      captions,
      activePlatform: platform === 'all' ? 'full' : platform,
      metadata: {
        template: selectedTemplate.name,
        category,
        hasExif: Object.keys(metadata).length > 0,
        camera: metadata.Make ? `${metadata.Make} ${metadata.Model || ''}`.trim() : null,
        date,
      },
      templateId: selectedTemplate.id,
    });
  } catch (error) {
    console.error('Caption error:', error);
    
    return NextResponse.json({
      captions: {
        full: '✨ Fresh content drop!\n\n#content #branding #pixeldrop',
        telegram: '✨ Fresh content drop!\n\n#content #branding #pixeldrop',
        x: '✨ Fresh content!\n\n#content #branding',
        linkedin: '✨ Fresh content that resonates.\n\n#contentmarketing #branding #pixeldrop',
      },
      activePlatform: 'full',
      metadata: { category: 'default' },
    });
  }
}