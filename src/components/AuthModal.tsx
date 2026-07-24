import React, { useState } from 'react';
import { LogIn, UserPlus, Database, Key, Shield, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { getSupabaseConfig, setSupabaseConfig, formatSupabaseError } from '../lib/supabase';
import { UserRole } from '../types';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [usn, setUsn] = useState('');

  // Supabase Config state
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url || '');
  const [supabasePublishableKey, setSupabasePublishableKey] = useState(config.key || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.signIn(email, password);
      onSuccess();
    } catch (err: any) {
      setError(formatSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Name, email, and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.signUp({
        email,
        password,
        name,
        role,
        usn: role === 'student' ? usn : undefined
      });
      setMessage('Account created! Logging you in...');
      setTimeout(async () => {
        try {
          await api.signIn(email, password);
          onSuccess();
        } catch {
          setMode('signin');
        }
      }, 1000);
    } catch (err: any) {
      setError(formatSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedUrl = supabaseUrl.trim();
    const trimmedKey = supabasePublishableKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setError('Please provide both Supabase URL and Publishable Key.');
      return;
    }

    if (!trimmedUrl.startsWith('https://')) {
      setError('Supabase Project URL must begin with https:// (e.g. https://xyz.supabase.co)');
      return;
    }

    try {
      setSupabaseConfig(trimmedUrl, trimmedKey);
    } catch (err: any) {
      setError(formatSupabaseError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-white relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">BNM Campus AI</h2>
          <p className="text-xs text-slate-400">
            Powered by Supabase Realtime PostgreSQL Backend
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${mode === 'signin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${mode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode('config'); setError(null); setMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${mode === 'config' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Database className="w-3.5 h-3.5" /> Credentials
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@bnmit.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In with Supabase Auth'}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Faculty / Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">USN Number</label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="e.g. 1BG22CS042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@bnmit.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating Account...' : 'Register in Supabase'}
              </button>
            </form>
          )}

          {/* SUPABASE CONFIG FORM */}
          {mode === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <p className="text-slate-400 text-[11px]">
                You can configure or override your Supabase Project URL and Publishable Key here directly if environment variables are not set.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Supabase Project URL</label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Supabase Publishable Key</label>
                <input
                  type="text"
                  value={supabasePublishableKey}
                  onChange={(e) => setSupabasePublishableKey(e.target.value)}
                  placeholder="sbp_... or eyJhbGciOi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                Save & Connect Supabase
              </button>
            </form>
          )}
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          Row Level Security (RLS) active • Zero mock data
        </div>
      </div>
    </div>
  );
};
