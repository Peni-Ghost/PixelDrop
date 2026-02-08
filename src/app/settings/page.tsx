"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Settings, MessageSquare, Clock } from 'lucide-react';
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
    setTestResult('Sending test message...');
    try {
      const res = await fetch('/api/scheduler/post', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResult('✅ Posted successfully!');
      } else if (data.message) {
        setTestResult(`ℹ️ ${data.message}`);
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult('❌ Failed to send test');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-400" />
              Settings
            </h1>
            <p className="text-gray-400 text-sm">Configure your posting pipeline</p>
          </div>
        </div>

        {/* Telegram Config */}
        <div className="space-y-6">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold">Telegram Integration</h2>
                <p className="text-gray-400 text-sm">Connect your Telegram bot</p>
              </div>
            </div>

            <div className="space-y-4">
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Channel username (with @) or numeric ID
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Config */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold">Posting Schedule</h2>
                <p className="text-gray-400 text-sm">When to post daily</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Daily Post Time (24h format)
              </label>
              <input
                type="time"
                value={config.postTime}
                onChange={(e) =>
                  setConfig({ ...config, postTime: e.target.value })
                }
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={saveConfig}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-xl font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={testTelegram}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Test Post
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-800/50 rounded-xl text-sm">{testResult}</div>
          )}
        </div>
      </div>
    </div>
  );
}
