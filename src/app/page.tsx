"use client";

import { useEffect, useState } from 'react';
import Uploader from '@/components/Uploader';
import { 
  CheckCircle, 
  Clock, 
  ImageIcon, 
  Send, 
  Trash2, 
  Edit3, 
  Settings,
  Zap,
  Sparkles,
  Loader2,
  X,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface Asset {
  id: string;
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  caption?: string;
  status: 'available' | 'scheduled' | 'posted';
  createdAt: string;
  postedAt?: string;
}

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [postingId, setPostingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const updateCaption = async (id: string) => {
    await fetch(`/api/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: editCaption }),
    });
    setEditingId(null);
    fetchAssets();
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    setDeletingId(id);
    await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchAssets();
  };

  const postNow = async (asset: Asset) => {
    setPostingId(asset.id);
    try {
      if (editingId === asset.id && editCaption !== asset.caption) {
        await updateCaption(asset.id);
      }
      
      const res = await fetch('/api/scheduler/post', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        fetchAssets();
      } else if (data.message) {
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } finally {
      setPostingId(null);
    }
  };

  const stats = {
    available: assets.filter((a) => a.status === 'available').length,
    posted: assets.filter((a) => a.status === 'posted').length,
    scheduled: assets.filter((a) => a.status === 'scheduled').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Navbar */}
      <nav className="border-b border-cyan-500/10 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                PixelDrop
              </span>
            </div>
            <Link
              href="/settings"
              className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all"
            >
              <Settings className="w-5 h-5 text-cyan-400" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            SYSTEM ONLINE v1.0
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Automated</span><br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Content Pipeline
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-8">
            Upload design assets and auto-post to Telegram. 
            Schedule daily content drops with zero effort.
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-gray-400 text-sm">Available:</span>
              <span className="text-cyan-400 font-bold text-lg">{stats.available}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400 text-sm">Posted:</span>
              <span className="text-green-400 font-bold text-lg">{stats.posted}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-gray-400 text-sm">Scheduled:</span>
              <span className="text-yellow-400 font-bold text-lg">{stats.scheduled}</span>
            </div>
          </div>

          {/* Upload Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <Uploader onUploadComplete={fetchAssets} />
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No assets yet. Upload your first image above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all"
              >
                {/* Image */}
                <div className="aspect-square relative"
                >
                  <img
                    src={asset.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {asset.status === 'available' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Available
                      </span>
                    )}
                    {asset.status === 'posted' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Posted
                      </span>
                    )}
                    {asset.status === 'scheduled' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Scheduled
                      </span>
                    )}
                  </div>

                  {/* Posted Date */}
                  {asset.postedAt && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-lg text-xs bg-gray-900/80 text-gray-300">
                        {new Date(asset.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2"
                  >
                    {asset.status === 'available' && (
                      <button
                        onClick={() => postNow(asset)}
                        disabled={postingId === asset.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all font-medium text-sm shadow-lg shadow-cyan-500/25"
                      >
                        {postingId === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Post Now
                      </button>
                    )}
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      disabled={deletingId === asset.id}
                      className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 disabled:opacity-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Caption Section */}
                <div className="p-4"
                >
                  {editingId === asset.id ? (
                    <div className="space-y-3"
                    >
                      <textarea
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Write a caption for Telegram..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm focus:border-cyan-500 focus:outline-none resize-none text-gray-200 placeholder-gray-500"
                        rows={3}
                      />
                      <div className="flex gap-2"
                      >
                        <button
                          onClick={() => updateCaption(asset.id)}
                          className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-sm font-medium transition-colors"
                        >
                          Save Caption
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3"
                    >
                      <p className="text-sm text-gray-400 line-clamp-2 flex-1"
                    >
                        {asset.caption || (
                          <span className="text-gray-600 italic">No caption added...</span>
                        )}
                      </p>
                      <button
                        onClick={() => {
                          setEditingId(asset.id);
                          setEditCaption(asset.caption || '');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-xs text-gray-400"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 mt-16"
      >
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm"
        >
          <p>PixelDrop — Auto-post your design assets to Telegram</p>
        </div>
      </footer>
    </div>
  );
}
