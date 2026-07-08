import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Mail, ArrowRight, Eye, EyeOff, Sun, Moon, Monitor } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export default function AdminLogin({ onLoginSuccess, theme, onThemeChange }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !passcode) {
      setError('Please provide both administrator email and security passcode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, passcode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid administrative credentials.');
        return;
      }

      onLoginSuccess();
    } catch {
      setError('Unable to reach the authentication server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F6F8] dark:bg-[#0B0B0C] text-[#1C1C1E] dark:text-[#F3F4F6] flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-300" id="admin-login-view">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-[#4F46E5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-4 justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            SECURE SYSTEM GATEWAY v2.8
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#/"
            onClick={() => {
              window.location.hash = '';
            }}
            className="text-[11px] font-display font-medium tracking-wider text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            ← BACK TO LIVE PORTFOLIO
          </a>

          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-0.5 rounded-xl">
            {[
              { key: 'light', icon: <Sun className="w-3.5 h-3.5" />, title: 'Light' },
              { key: 'dark', icon: <Moon className="w-3.5 h-3.5" />, title: 'Dark' },
              { key: 'system', icon: <Monitor className="w-3.5 h-3.5" />, title: 'System' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onThemeChange(item.key as 'light' | 'dark' | 'system')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === item.key
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                    : 'text-gray-400 hover:text-black dark:hover:text-white'
                }`}
                title={item.title}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white dark:bg-[#16161A]/80 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative"
        >
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center mb-6">
            <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="font-display text-lg font-black tracking-wider text-black dark:text-white uppercase">
              SUDEIS FEDL
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
              Admin CMS Console Gate. Authenticate to modify portfolio works & site images.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl p-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/[0.07] focus:bg-white/[0.08] border border-black/10 dark:border-white/10 focus:border-black/50 dark:focus:border-emerald-500/50 rounded-xl text-xs text-black dark:text-white focus:outline-none transition-all font-light"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                SECURITY PASSCODE
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-black/5 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/[0.07] focus:bg-white/[0.08] border border-black/10 dark:border-white/10 focus:border-black/50 dark:focus:border-emerald-500/50 rounded-xl text-xs text-black dark:text-white focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-gray-100 disabled:bg-gray-700 text-white dark:text-[#0C0C0E] font-display text-[10px] font-black tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
            >
              {isSubmitting ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE SECURE SESSION'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto w-full text-center text-[10px] font-mono text-gray-500 dark:text-gray-600 z-10">
        ENCRYPTED SECURE CHANNEL • SUDEIS PORTFOLIO MANAGEMENT CONSOLE © 2026.
      </div>
    </div>
  );
}
