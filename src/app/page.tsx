"use client";

import { useEffect, useState } from 'react';
import { 
  Upload, 
  Send, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Loader2,
  ImageIcon,
  Settings,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  imageUrl: string;
  caption?: string;
  status: 'PENDING' | 'SENT';
  createdAt: string;
  sentAt?: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const uploadData = await uploadRes.json();

      // Create post in DB
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadData.secure_url,
          caption: caption,
        }),
      });

      setCaption('');
      fetchPosts();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const stats = {
    pending: posts.filter(p => p.status === 'PENDING').length,
    sent: posts.filter(p => p.status === 'SENT').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-100">Social Scheduler</h1>
                <p className="text-slate-500 text-sm">Automated Telegram Posts</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-emerald-400 text-sm font-medium">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-slate-400 text-sm">{stats.sent} Sent</span>
                </div>
              </div>

              <Link
                href="/settings"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold">Create New Post</h2>
          </div>

          <div className="space-y-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your post..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none text-sm"
              rows={2}
            />

            <label className={`
              flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed
              transition-all cursor-pointer
              ${uploading 
                ? 'border-slate-700 bg-slate-800/50' 
                : 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/30'
              }
            `}>
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-slate-400">Uploading image...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">Click to upload image</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Queue List */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold">Post Queue</h2>
            <span className="ml-auto text-slate-500 text-sm">{posts.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No posts in queue</p>
              <p className="text-sm mt-1">Upload an image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-square relative">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {post.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {post.caption || <span className="text-slate-500 italic">No caption</span>}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {post.status === 'SENT' && post.sentAt && (
                        <span>
                          Sent {new Date(post.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
