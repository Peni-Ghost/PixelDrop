import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Free tier: 1,500 requests/day
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Platform-specific formats
const PLATFORM_FORMATS = {
  telegram: (content: string) => `${content}\n\n#branding #content`,
  x: (content: string) => {
    const maxLen = 250;
    let text = content;
    if (text.length > maxLen) {
      text = text.substring(0, maxLen - 10) + '...';
    }
    return `${text}\n\n#branding`;
  },
  linkedin: (content: string) => 
    `${content}\n\nWhat do you think? Share your thoughts below! 👇\n\n#branding #contentmarketing`,
  full: (content: string) => `${content}\n\n#branding #content`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, platform = 'all' } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    if (!genAI) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        captions: {
          full: '✨ Fresh content drop!\n\n#branding #content',
          telegram: '✨ Fresh content drop!\n\n#branding #content',
          x: '✨ Fresh content!\n\n#branding',
          linkedin: '✨ Fresh content that resonates.\n\n#branding #contentmarketing',
        },
        aiGenerated: false,
      }, { status: 200 });
    }

    // Fetch the image as base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Get MIME type from response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Use Gemini 1.5 Flash (higher free tier limits)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this image and create a brand-appropriate social media caption.

Look for:
1. Any text visible in the image (signs, banners, headlines)
2. The theme (celebration, business, tech, seasonal, etc.)
3. Mood and colors
4. Any calls-to-action

Create a caption that:
- References the actual content shown
- Matches the visual tone
- Is engaging for social media
- Includes relevant hashtags

Respond with ONLY a JSON object like this:
{
  "context": "brief description of image content",
  "tone": "celebratory/professional/urgent/etc",
  "mainCaption": "the main caption text (1-2 sentences)",
  "cta": "optional call to action"
}`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { 
            inlineData: {
              mimeType: contentType,
              data: base64Image
            }
          }
        ]
      }]
    });

    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini raw response:', text.substring(0, 500));
    
    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/```\s*([\s\S]*?)\s*```/) ||
                       text.match(/(\{[\s\S]*\})/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      analysis = JSON.parse(jsonString);
      
      // Validate required fields
      if (!analysis.mainCaption) {
        throw new Error('Missing mainCaption in response');
      }
    } catch (parseError) {
      console.log('JSON parse error, using text fallback:', parseError);
      // Use the raw text as caption if JSON parsing fails
      analysis = {
        context: 'Image analysis',
        tone: 'professional',
        mainCaption: text.replace(/```[\s\S]*?```/g, '').trim().substring(0, 300),
        cta: ''
      };
    }

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
      provider: 'gemini',
    });

  } catch (error) {
    console.error('Gemini Vision error:', error);
    
    // Check if it's a rate limit error
    const errorMessage = error instanceof Error ? error.message : 'AI analysis failed';
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded');
    
    return NextResponse.json({
      captions: {
        full: '✨ Fresh content drop!\n\n#branding #content #pixeldrop',
        telegram: '✨ Fresh content drop!\n\n#branding #content #pixeldrop',
        x: '✨ Fresh content!\n\n#branding #pixeldrop',
        linkedin: '✨ Fresh content that resonates.\n\nWhat do you think? 👇\n\n#branding #contentmarketing',
      },
      activePlatform: 'full',
      aiGenerated: false,
      error: isRateLimit ? 'Rate limit exceeded. Try again in 1 minute or use template mode.' : errorMessage,
    });
  }
}