'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2, Bot } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      // Don't show masked token in input, just placeholder
      setBotToken(data.hasToken ? '••••••••••••••••••••••••••' : '');
      setChannelId(data.telegramChannelId || '');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Only send botToken if user entered a new one (not the placeholder)
      const payload: { telegramBotToken?: string; telegramChannelId: string } = {
        telegramChannelId: channelId,
      };
      
      // If botToken is not the placeholder, include it
      if (botToken && !botToken.startsWith('•')) {
        payload.telegramBotToken = botToken;
      }
      
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Settings saved successfully!');
        // Reset token field to placeholder after save
        setBotToken('••••••••••••••••••••••••••');
      } else {
        setMessage('Failed to save settings');
      }
    } catch {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          botToken: botToken.startsWith('•') ? null : botToken,
          chatId: channelId || null
        }),
      });
      
      const result = await res.json();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-slate-100">Settings</h1>
              <p className="text-slate-500 text-sm">Configure Telegram Integration</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Telegram Setup */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100">Telegram Bot</h2>
              <p className="text-slate-500 text-sm">Connect your Telegram bot for auto-posting</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Bot Token
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABC..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
              />
              <p className="text-xs text-slate-600 mt-2">
                Get this from @BotFather on Telegram
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Channel ID
              </label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="@channelname or -1001234567890"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
              />
              <p className="text-xs text-slate-600 mt-2">
                Defaults to admin Telegram ID if not set. Users can override with their own channel.
              </p>
            </div>

            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="text-sm">Test Connection</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium transition-colors disabled:opacity-50 ml-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </>
                ) : (
                  <span className="text-sm">Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Setup Instructions</h3>
          <ol className="space-y-3 text-sm text-slate-400 list-decimal list-inside">
            <li>Message @BotFather on Telegram and create a new bot (/newbot)</li>
            <li>Copy the bot token and paste it above</li>
            <li>Create a Telegram channel (or use existing one)</li>
            <li>Add your bot as an administrator to the channel</li>
            <li>Enter the channel ID (@channelname or numeric ID)</li>
            <li>Click "Test Connection" to verify everything works</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
