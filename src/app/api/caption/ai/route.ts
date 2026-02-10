import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Platform-specific formats
const PLATFORM_FORMATS = {
  telegram: (content: string) => {
    return `${content}\n\n#branding #content`;
  },
  x: (content: string) => {
    // Keep it under 280 chars
    const maxLen = 250;
    let text = content;
    if (text.length > maxLen) {
      text = text.substring(0, maxLen - 10) + '...';
    }
    return `${text}\n\n#branding`;
  },
  linkedin: (content: string) => {
    return `${content}\n\nWhat do you think? Share your thoughts below! 👇\n\n#branding #contentmarketing #strategy`;
  },
  full: (content: string) => {
    return `${content}\n\n#branding #content`;
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, platform = 'all' } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        captions: {
          full: '✨ Fresh content drop!\n\n#branding #content',
          telegram: '✨ Fresh content drop!\n\n#branding #content',
          x: '✨ Fresh content!\n\n#branding',
          linkedin: '✨ Fresh content that resonates.\n\n#branding #contentmarketing',
        },
        aiGenerated: false,
      }, { status: 200 });
    }

    // Use GPT-4 Vision to analyze the image
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Vision-capable model
      messages: [
        {
          role: 'system',
          content: `You are a brand social media expert. Analyze images and create engaging, contextual captions.

Analyze the image for:
1. Text visible in the image (signs, banners, overlays)
2. Visual theme (business, tech, celebration, seasonal, etc.)
3. Colors and mood
4. Objects and people
5. Any calls-to-action or messaging

Create captions that:
- Reference the actual content of the image
- Include the tone (professional, celebratory, urgent, etc.)
- Match the visual theme
- Include relevant hashtags

Respond with a JSON object containing:
{
  "context": "Brief description of what's in the image",
  "tone": "celebratory|professional|urgent|inspirational",
  "mainCaption": "The primary caption text (1-2 sentences)",
  "cta": "Optional call-to-action"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and create a brand-appropriate caption. Focus on any text visible in the image and the overall theme.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    
    // Build the base caption
    let baseCaption = analysis.mainCaption;
    if (analysis.cta) {
      baseCaption += '\n\n' + analysis.cta;
    }

    // Generate platform-specific versions
    const captions: Record<string, string> = {
      full: PLATFORM_FORMATS.full(baseCaption),
      telegram: PLATFORM_FORMATS.telegram(baseCaption),
      x: PLATFORM_FORMATS.x(baseCaption),
      linkedin: PLATFORM_FORMATS.linkedin(baseCaption),
    };

    return NextResponse.json({
      captions,
      activePlatform: platform === 'all' ? 'full' : platform,
      analysis: {
        context: analysis.context,
        tone: analysis.tone,
      },
      aiGenerated: true,
    });

  } catch (error) {
    console.error('AI Vision error:', error);
    
    // Fallback to generic captions
    return NextResponse.json({
      captions: {
        full: '✨ Fresh content drop!\n\n#branding #content #pixeldrop',
        telegram: '✨ Fresh content drop!\n\n#branding #content #pixeldrop',
        x: '✨ Fresh content!\n\n#branding #pixeldrop',
        linkedin: '✨ Fresh content that resonates.\n\nWhat do you think? 👇\n\n#branding #contentmarketing',
      },
      activePlatform: 'full',
      aiGenerated: false,
      error: error instanceof Error ? error.message : 'AI analysis failed',
    });
  }
}