"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Settings, MessageSquare, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    telegramBotToken: '',
    telegramChannelId: '',
    postTime: '09:00',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data) {
      setConfig({
        telegramBotToken: data.telegramBotToken || '',
        telegramChannelId: data.telegramChannelId || '',
        postTime: data.postTime || '09:00',
      });
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const testTelegram = async () => {
    setTestLoading(true);
    setTestResult('');
    try {
      const res = await fetch('/api/scheduler/post', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResult('✅ Posted successfully to Telegram!');
      } else if (data.message) {
        setTestResult(`ℹ️ ${data.message}`);
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult('❌ Failed to send test');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Navbar */}
      <nav className="border-b border-cyan-500/10 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-gray-900/50 hover:bg-gray-800 border border-gray-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-gray-500 text-sm">Configure your content pipeline</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Telegram Config */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Telegram Integration</h2>
              <p className="text-gray-500 text-sm">Connect your bot to auto-post</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bot Token
              </label>
              <input
                type="password"
                value={config.telegramBotToken}
                onChange={(e) =>
                  setConfig({ ...config, telegramBotToken: e.target.value })
                }
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors text-sm"
              />
              <p className="text-gray-500 text-xs mt-2">
                Get this from @BotFather on Telegram
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel ID
              </label>
              <input
                type="text"
                value={config.telegramChannelId}
                onChange={(e) =>
                  setConfig({ ...config, telegramChannelId: e.target.value })
                }
                placeholder="@channelname or -1001234567890"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors text-sm"
              />
              <p className="text-gray-500 text-xs mt-2">
                Channel username (with @) or numeric ID
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Config */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Posting Schedule</h2>
              <p className="text-gray-500 text-sm">When to post daily</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Daily Post Time (24h UTC)
            </label>
            <input
              type="time"
              value={config.postTime}
              onChange={(e) =>
                setConfig({ ...config, postTime: e.target.value })
              }
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveConfig}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
          
          <button
            onClick={testTelegram}
            disabled={testLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium transition-all"
          >
            {testLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Test Post
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl text-sm">
            {testResult}
          </div>
        )}
      </main>
    </div>
  );
}
