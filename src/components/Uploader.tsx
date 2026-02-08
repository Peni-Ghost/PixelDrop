"use client";

import { useState, useCallback } from 'react';
import { Upload, Loader, ImagePlus } from 'lucide-react';

export default function Uploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error('Upload to Cloudinary failed');
      }
      
      const data = await uploadRes.json();

      // 2. Save to DB
      const saveRes = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: data.public_id,
          url: data.secure_url,
          format: data.format,
          width: data.width,
          height: data.height,
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save to database');
      }

      onUploadComplete();
    } catch (error) {
      alert('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <label
        className={`
          relative flex flex-col items-center justify-center gap-4 
          p-8 rounded-xl border-2 border-dashed 
          transition-all duration-200 cursor-pointer
          min-h-[180px]
          ${dragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {uploading ? (
          <>
            <div className="relative">
              <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <Loader className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-medium">Uploading...</p>
              <p className="text-gray-500 text-sm mt-1">Sending to Cloudinary</p>
            </div>
          </>
        ) : (
          <>
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              transition-colors duration-200
              ${dragActive ? 'bg-blue-500/20' : 'bg-gray-700/50'}
            `}>
              {dragActive ? (
                <ImagePlus className="w-7 h-7 text-blue-400" />
              ) : (
                <Upload className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-medium">
                {dragActive ? 'Drop image here' : 'Drop image or click to upload'}
              </p>
              <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
