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
  Calendar,
  MoreHorizontal,
  X
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
      // First update the caption if needed
      if (editingId === asset.id && editCaption !== asset.caption) {
        await updateCaption(asset.id);
      }
      
      // Trigger the post
      const res = await fetch('/api/scheduler/post', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        alert('Posted to Telegram!');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  PixelDrop
                </h1>
                <p className="text-gray-400 text-xs">Content Pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-gray-300">{stats.available} Available</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-gray-300">{stats.posted} Posted</span>
                </div>
              </div>
              <Link
                href="/settings"
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Upload */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  Upload Asset
                </h2>
                <Uploader onUploadComplete={fetchAssets} />
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Pipeline Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Available</span>
                    <span className="text-2xl font-bold text-blue-400">{stats.available}</span>
                  </div>
                  <div className="h-px bg-gray-700/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Posted</span>
                    <span className="text-2xl font-bold text-green-400">{stats.posted}</span>
                  </div>
                  <div className="h-px bg-gray-700/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Scheduled</span>
                    <span className="text-2xl font-bold text-yellow-400">{stats.scheduled}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gallery */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>No assets yet. Upload your first image!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600 transition-all"
                  >
                    {/* Image */}
                    <div className="aspect-square relative">
                      <img
                        src={asset.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {asset.status === 'available' && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/20">
                            Available
                          </span>
                        )}
                        {asset.status === 'posted' && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/20 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Posted
                          </span>
                        )}
                        {asset.status === 'scheduled' && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Posted Date */}
                      {asset.postedAt && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-900/80 text-gray-300">
                            {new Date(asset.postedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {asset.status === 'available' && (
                          <button
                            onClick={() => postNow(asset)}
                            disabled={postingId === asset.id}
                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            title="Post now"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          disabled={deletingId === asset.id}
                          className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="p-4">
                      {editingId === asset.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            placeholder="Write a caption..."
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:border-blue-500 focus:outline-none resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateCaption(asset.id)}
                              className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-300 line-clamp-3 flex-1">
                            {asset.caption || (
                              <span className="text-gray-500 italic">No caption</span>
                            )}
                          </p>
                          <button
                            onClick={() => {
                              setEditingId(asset.id);
                              setEditCaption(asset.caption || '');
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
