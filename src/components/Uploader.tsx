"use client";

import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';

export default function Uploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await uploadRes.json();

      // 2. Save to DB
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: data.public_id,
          url: data.secure_url,
          format: data.format,
          width: data.width,
          height: data.height
        })
      });

      onUploadComplete();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-800/50">
      <label className="cursor-pointer flex flex-col items-center gap-4">
        {uploading ? (
          <Loader className="w-10 h-10 animate-spin text-blue-400" />
        ) : (
          <Upload className="w-10 h-10 text-gray-400" />
        )}
        <span className="text-gray-300 font-medium">
          {uploading ? 'Uploading to PixelDrop...' : 'Drop image or click to upload'}
        </span>
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </label>
    </div>
  );
}
