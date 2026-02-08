"use client";

import { useEffect, useState } from 'react';
import Uploader from '@/components/Uploader';
import { CheckCircle, Clock } from 'lucide-react';

export default function Home() {
  const [assets, setAssets] = useState<any[]>([]);

  const fetchAssets = async () => {
    const res = await fetch('/api/assets');
    const data = await res.json();
    setAssets(data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              PixelDrop
            </h1>
            <p className="text-gray-400">Content Pipeline & Auto-Scheduler</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{assets.filter(a => a.status === 'available').length}</div>
              <div className="text-xs text-gray-500">AVAILABLE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{assets.filter(a => a.status === 'posted').length}</div>
              <div className="text-xs text-gray-500">POSTED</div>
            </div>
          </div>
        </div>

        {/* Upload */}
        <Uploader onUploadComplete={fetchAssets} />

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative aspect-square bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
              <img src={asset.url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    asset.status === 'available' ? 'bg-blue-500/20 text-blue-300' : 
                    asset.status === 'posted' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {asset.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Icon Overlay */}
              {asset.status === 'posted' && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
