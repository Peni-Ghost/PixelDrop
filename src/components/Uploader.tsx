"use client";

import { useState, useCallback } from 'react';
import { Upload, Loader2, ImagePlus } from 'lucide-react';

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
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error('Upload to Cloudinary failed');
      }
      
      const data = await uploadRes.json();

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
      className="relative"
    >
      <label
        className={`
          relative flex items-center gap-4 
          px-2 py-2 rounded-2xl border
          transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' 
            : 'border-gray-700 bg-gray-900/80 hover:border-gray-600'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <div className={`
          flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
          ${dragActive ? 'text-cyan-300' : 'text-gray-400'}
        `}>
          {uploading ? (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {uploading ? 'Uploading to Cloudinary...' : dragActive ? 'Drop image here' : 'Click or drag image to upload'}
          </span>
        </div>
        
        <button
          type="button"
          disabled={uploading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all font-medium text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Upload
            </>
          )}
        </button>
        
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
