'use client';

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
  Plus,
  Play,
  CheckSquare,
  Square,
  X,
  Wand2
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
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkPosting, setBulkPosting] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'telegram' | 'x' | 'linkedin' | 'full'>('full');
  const [generatedCaptions, setGeneratedCaptions] = useState<Record<string, string> | null>(null);

  const handleBulkPost = async () => {
    if (selectedPosts.size === 0) return;
    if (!confirm(`Post ${selectedPendingCount} selected images?`)) return;

    setBulkPosting(true);
    try {
      const res = await fetch('/api/scheduler/selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedPosts) }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.failed > 0) {
          const failedErrors = data.results?.failed?.map((f: {id: string, error: string}) => f.error).join('\n');
          alert(`Posted ${data.posted} images, ${data.failed} failed.\n\nErrors:\n${failedErrors || 'Unknown error'}`);
        } else {
          alert(`Successfully posted ${data.posted} image${data.posted !== 1 ? 's' : ''}!`);
        }
        setSelectedPosts(new Set());
        setSelectMode(false);
        fetchPosts();
      } else {
        alert(data.error || 'Failed to post');
      }
    } catch {
      alert('Failed to post - network error');
    } finally {
      setBulkPosting(false);
    }
  };

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

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [aiMode, setAiMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{context: string; tone: string} | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  const generateCaption = async (imageUrl: string, fileName?: string, category?: string, useAi = false) => {
    setGeneratingCaption(true);
    try {
      // Use AI Vision if enabled
      if (useAi || aiMode) {
        const res = await fetch('/api/caption/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, platform }),
        });

        if (res.ok) {
          const data = await res.json();
          setGeneratedCaptions(data.captions);
          const activeCaption = data.captions[data.activePlatform] || data.captions.full;
          setCaption(activeCaption);
          setAiGenerated(data.aiGenerated || false);
          if (data.analysis) {
            setAiAnalysis(data.analysis);
          }
          // Check if AI actually worked or fell back
          if (!data.aiGenerated) {
            console.log('AI fallback:', data.error || 'Unknown error');
          }
          return data.captions;
        }
      }

      // Fallback to template-based
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl, 
          fileName, 
          platform: platform,
          category: category || selectedCategory || undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedCaptions(data.captions);
        const activeCaption = data.captions[data.activePlatform] || data.captions.full;
        setCaption(activeCaption);
        setAiGenerated(false);
        if (data.metadata?.category) {
          setSelectedCategory(data.metadata.category);
        }
        setAiAnalysis(null);
        return data.captions;
      }
    } catch {
      // Ignore errors
    } finally {
      setGeneratingCaption(false);
    }
    return null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const uploadData = await uploadRes.json();
      setUploadedImageUrl(uploadData.secure_url);

      // Auto-generate caption and get the generated captions
      const captions = await generateCaption(uploadData.secure_url, file.name);
      const captionToUse = captions?.[platform] || captions?.full || '';

      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadData.secure_url,
          caption: captionToUse,
        }),
      });

      setCaption('');
      setGeneratedCaptions(null);
      setSelectedCategory('');
      setAiAnalysis(null);
      setAiGenerated(false);
      setUploadedImageUrl(null);
      setUploadedFileName(null);
      fetchPosts();
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePostNow = async () => {
    setPosting(true);
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.failed > 0) {
          const failedErrors = data.results?.failed?.map((f: {id: string, error: string}) => f.error).join('\n');
          alert(`Posted ${data.posted} images, ${data.failed} failed.\n\nErrors:\n${failedErrors || 'Unknown error'}`);
        } else {
          alert(`Successfully posted ${data.posted} image${data.posted !== 1 ? 's' : ''}!`);
        }
        fetchPosts();
      } else {
        alert(data.error || 'Failed to post');
      }
    } catch {
      alert('Failed to post - network error');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchPosts();
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const selectAll = () => {
    const deletablePosts = posts; // Allow selecting all posts for deletion
    if (selectedPosts.size === deletablePosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(deletablePosts.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    if (!confirm(`Delete ${selectedPosts.size} posts? This cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch('/api/posts/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedPosts) }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedPosts(new Set());
        setSelectMode(false);
        fetchPosts();
        alert(`Deleted ${data.deleted} posts`);
      } else {
        alert('Failed to delete posts');
      }
    } catch {
      alert('Failed to delete posts');
    } finally {
      setBulkDeleting(false);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedPosts(new Set());
  };

  const stats = {
    pending: posts.filter(p => p.status === 'PENDING').length,
    sent: posts.filter(p => p.status === 'SENT').length,
  };

  const allSelected = posts.length > 0 && selectedPosts.size === posts.length;
  const selectedPendingCount = posts.filter(p => selectedPosts.has(p.id) && p.status === 'PENDING').length;

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
                <h1 className="font-bold text-lg text-slate-100">PixelDrop</h1>
                <p className="text-slate-500 text-sm">Content Pipeline</p>
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
            {/* AI Mode Toggle */}
            {uploadedImageUrl && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAiMode(!aiMode);
                    if (!aiMode) {
                      generateCaption(uploadedImageUrl, uploadedFileName || undefined, undefined, true);
                    } else {
                      generateCaption(uploadedImageUrl, uploadedFileName || undefined, selectedCategory || undefined, false);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    aiMode
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {generatingCaption ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  {aiMode ? '✨ AI Vision ON' : 'Use AI Vision'}
                </button>
                {aiAnalysis && aiGenerated && (
                  <span className="text-xs text-emerald-500">
                    ✓ AI detected: {aiAnalysis.context}
                  </span>
                )}
                {aiMode && !aiGenerated && generatedCaptions && (
                  <span className="text-xs text-amber-500">
                    ⚠ AI failed - using template fallback
                  </span>
                )}
              </div>
            )}

            {/* Category Selector */}
            {generatedCaptions && !aiMode && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-slate-500 self-center mr-2">Template:</span>
                {(['product', 'promotion', 'engagement', 'seasonal', 'milestone', 'educational'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (uploadedImageUrl) {
                        generateCaption(uploadedImageUrl, uploadedFileName || undefined, cat);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      selectedCategory === cat
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Platform Selector */}
            {generatedCaptions && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-slate-500 self-center mr-2">Platform:</span>
                {(['full', 'telegram', 'x', 'linkedin'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPlatform(p);
                      setCaption(generatedCaptions[p] || generatedCaptions.full);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      platform === p
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {p === 'x' ? 'X (Twitter)' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your post... (or upload image to auto-generate SEO-optimized captions)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none text-sm"
                rows={4}
              />
              {uploadedImageUrl && (
                <button
                  onClick={() => generateCaption(uploadedImageUrl, uploadedFileName || undefined)}
                  disabled={generatingCaption}
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
                  title="Regenerate caption"
                >
                  {generatingCaption ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              )}
            </div>

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

        {/* Actions */}
        {stats.pending > 0 && !selectMode && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={handlePostNow}
              disabled={posting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium transition-colors disabled:opacity-50"
            >
              {posting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm">Post All ({stats.pending})</span>
            </button>
            
            <button
              onClick={() => setSelectMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="text-sm">Select</span>
            </button>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectMode && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 transition-colors"
            >
              {allSelected ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
              <span>Select All ({posts.length})</span>
            </button>
            
            <span className="text-slate-600">|</span>
            
            <span className="text-sm text-slate-400">
              {selectedPosts.size} selected
            </span>

            <div className="ml-auto flex gap-3">
              {selectedPosts.size > 0 && selectedPendingCount > 0 && (
                <button
                  onClick={handleBulkPost}
                  disabled={bulkPosting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 transition-colors disabled:opacity-50"
                >
                  {bulkPosting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span className="text-sm">Post ({selectedPendingCount})</span>
                </button>
              )}
              {selectedPosts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                >
                  {bulkDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span className="text-sm">Delete ({selectedPosts.size})</span>
                </button>
              )}
              
              <button
                onClick={exitSelectMode}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

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
                  className={`bg-slate-900/50 border rounded-2xl overflow-hidden group transition-all ${
                    selectedPosts.has(post.id) 
                      ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' 
                      : 'border-slate-800'
                  }`}
                >
                  <div className="aspect-square relative">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {/* Selection Checkbox */}
                    {selectMode && (
                      <button
                        onClick={() => toggleSelect(post.id)}
                        className="absolute top-3 left-3 p-1.5 rounded-lg bg-slate-950/80 border border-slate-600 hover:border-emerald-500 transition-colors z-10"
                      >
                        {selectedPosts.has(post.id) ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute ${selectMode ? 'top-3 left-14' : 'top-3 left-3'}`}>
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

                    {/* Single Delete Button - Always visible on mobile, hover on desktop */}
                    {!selectMode && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        {deleting === post.id ? (
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        )}
                      </button>
                    )}
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
