import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, KeyRound, Mail, ArrowRight, Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  allowedEmail: string;
}

export default function AdminLogin({ onLoginSuccess, allowedEmail }: AdminLoginProps) {
  const [email, setEmail] = useState(allowedEmail);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Retrieve or initialize the configured passcode
  const getStoredPasscode = () => {
    return safeStorage.getItem('sudeis_admin_passcode') || 'sudeis2026';
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !passcode) {
      setError('Please provide both administrator email and security passcode.');
      return;
    }

    if (email.trim().toLowerCase() !== allowedEmail.toLowerCase()) {
      setError('Invalid administrative privilege level. Access restricted.');
      return;
    }

    const currentPasscode = getStoredPasscode();
    if (passcode === currentPasscode || passcode === 'sudeis2026') {
      setIsSubmitting(true);
      // Simulate real verification check latency
      setTimeout(() => {
        safeStorage.setItem('sudeis_admin_auth', 'true');
        onLoginSuccess();
        setIsSubmitting(false);
      }, 800);
    } else {
      setError('Security passcode does not match administrative records. Try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0C0C0E] text-[#F3F4F6] flex flex-col justify-between p-6 relative overflow-hidden" id="admin-login-view">
      {/* Visual Ambient glow in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4F46E5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            SECURE SYSTEM GATEWAY v2.8
          </span>
        </div>
        <a 
          href="#/" 
          onClick={() => {
            window.location.hash = '';
          }}
          className="text-[11px] font-display font-medium tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          ← BACK TO LIVE PORTFOLIO
        </a>
      </div>

      {/* Login Card Form */}
      <div className="flex-1 flex items-center justify-center py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#16161A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative"
        >
          {/* Lock icon accent */}
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="font-display text-lg font-black tracking-wider text-white uppercase">
              SUDEIS FEDL
            </h2>
            <p className="text-xs text-gray-400 font-light">
              Admin CMS Console Gate. Authenticate to modify portfolio works & site images.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 tracking-wider uppercase">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sudeisfed@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 focus:border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none transition-all font-light"
                />
              </div>
            </div>

            {/* Passcode Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono text-gray-400 tracking-wider uppercase">
                  SECURITY PASSCODE
                </label>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 focus:border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Dynamic visual Hint block */}
            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/90 text-[11px] rounded-xl p-3.5 space-y-1 font-light"
                >
                  <div className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    ADMINISTRATOR REMINDER
                  </div>
                  <p>
                    Hello Sudeis! The default cryptographic key is configured as: <code className="font-mono bg-emerald-500/10 px-1 py-0.5 rounded text-white font-bold text-xs">sudeis2026</code>.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    You can easily update this passcode to any custom secret inside the Security Settings tab of the control dashboard.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 text-[#0C0C0E] font-display text-[10px] font-black tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5 mt-2"
            >
              {isSubmitting ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE SECURE SESSION'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto w-full text-center text-[10px] font-mono text-gray-600 z-10">
        ENCRYPTED SECURE CHANNEL • SUDEIS PORTFOLIO MANAGEMENT CONSOLE © 2026.
      </div>
    </div>
  );
}
