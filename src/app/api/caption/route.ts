import { NextRequest, NextResponse } from 'next/server';
import exifr from 'exifr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, fileName } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    let caption = '';
    let metadata: Record<string, any> = {};

    // Try to extract EXIF data from the image
    try {
      metadata = await exifr.parse(imageUrl, {
        exif: true,
        gps: true,
        iptc: true,
      }) || {};
    } catch {
      // Ignore EXIF extraction errors
    }

    // Generate caption from available metadata
    const parts: string[] = [];

    // Add date if available
    if (metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate) {
      const date = new Date(metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate);
      if (!isNaN(date.getTime())) {
        parts.push(`Captured on ${date.toLocaleDateString()}`);
      }
    }

    // Add camera info
    if (metadata.Make || metadata.Model) {
      const camera = [metadata.Make, metadata.Model].filter(Boolean).join(' ');
      if (camera) parts.push(`📷 ${camera}`);
    }

    // Add location if GPS available
    if (metadata.latitude && metadata.longitude) {
      parts.push(`📍 ${metadata.latitude.toFixed(4)}, ${metadata.longitude.toFixed(4)}`);
    }

    // If no EXIF data, generate from filename
    if (parts.length === 0 && fileName) {
      const cleanName = fileName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ')     // Replace hyphens/underscores with spaces
        .replace(/\d{4}-\d{2}-\d{2}/, '') // Remove date patterns
        .replace(/\s+/g, ' ')      // Collapse multiple spaces
        .trim();
      
      if (cleanName && cleanName.length > 2) {
        // Capitalize first letter of each word
        const titleCase = cleanName.replace(/\b\w/g, (l: string) => l.toUpperCase());
        parts.push(titleCase);
      }
    }

    // Add generic hashtags based on detected content
    const tags: string[] = [];
    if (metadata.ImageWidth && metadata.ImageHeight) {
      const ratio = metadata.ImageWidth / metadata.ImageHeight;
      if (ratio > 1.2) tags.push('#photography');
      if (ratio < 0.9) tags.push('#portrait');
      if (ratio >= 0.9 && ratio <= 1.2) tags.push('#square');
    }
    
    // Add common tags
    tags.push('#pixeldrop', '#content');

    // Combine parts
    caption = parts.join('\n');
    if (tags.length > 0) {
      caption += (caption ? '\n\n' : '') + tags.join(' ');
    }

    // If still empty, provide a generic caption
    if (!caption) {
      caption = '📸 New drop!\n\n#pixeldrop #content';
    }

    return NextResponse.json({ 
      caption,
      metadata: {
        hasExif: Object.keys(metadata).length > 0,
        camera: metadata.Make || metadata.Model ? `${metadata.Make || ''} ${metadata.Model || ''}`.trim() : null,
        date: metadata.DateTimeOriginal || metadata.CreateDate || null,
        location: metadata.latitude && metadata.longitude ? { lat: metadata.latitude, lng: metadata.longitude } : null,
      }
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    return NextResponse.json({ 
      caption: '📸 New drop!\n\n#pixeldrop #content',
      metadata: { hasExif: false }
    });
  }
}