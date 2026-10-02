import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldAlert, Clock } from 'lucide-react';
import { getSettings, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../utils/storage';
import { sanitizeString } from '../utils/security';

interface LoginProps {
  onLoginSuccess: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Security: Brute-force protection states
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('login_failed_attempts');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutTimer, setLockoutTimer] = useState<number>(() => {
    try {
      const lockUntil = sessionStorage.getItem('login_lock_until');
      if (lockUntil) {
        const remaining = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTimer <= 0) return;

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sessionStorage.removeItem('login_lock_until');
          sessionStorage.setItem('login_failed_attempts', '0');
          setFailedAttempts(0);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutTimer > 0) {
      setError(`تم تجميد المحاولات مؤقتاً لحماية النظام. يرجى الانتظار ${lockoutTimer} ثانية.`);
      return;
    }

    setLoading(true);

    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPassword = password.trim();

    const currentSettings = getSettings();
    const validEmail = (currentSettings.adminEmail || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
    const validPassword = currentSettings.adminPasswordHash || DEFAULT_ADMIN_PASSWORD;

    setTimeout(() => {
      if (cleanEmail === validEmail && cleanPassword === validPassword) {
        // Success: Reset brute-force counters
        sessionStorage.removeItem('login_failed_attempts');
        sessionStorage.removeItem('login_lock_until');
        onLoginSuccess();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        sessionStorage.setItem('login_failed_attempts', nextFailed.toString());

        if (nextFailed >= MAX_FAILED_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_SECONDS * 1000;
          sessionStorage.setItem('login_lock_until', lockTime.toString());
          setLockoutTimer(LOCKOUT_SECONDS);
          setError(`تم رصد عدة محاولات خاطئة متتالية! تم تجميد تسجيل الدخول لمدة ${LOCKOUT_SECONDS} ثانية لحماية المنظومة من الاختراق.`);
        } else {
          setError(
            `بيانات الدخول غير صحيحة. يتبقى لديك ${MAX_FAILED_ATTEMPTS - nextFailed} محاولات قبل الإيقاف الأمني المؤقت.`
          );
        }
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-700/80 p-8 relative overflow-hidden text-white backdrop-blur-xl">
        {/* Top Decorative Blue Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/15 text-white ring-2 ring-blue-500/30 mb-4 p-3 shadow-2xl">
            <img src="/icon.svg" alt="أرشيف الضرائب" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            أرشيف الضرائب
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            منظومة أرشفة ملفات العملاء والمنشآت الضريبية
          </p>
        </div>

        {/* Error / Lockout Alert */}
        {error && (
          <div
            className={`mb-5 p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 animate-in fade-in ${
              lockoutTimer > 0
                ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            {lockoutTimer > 0 ? (
              <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                required
                disabled={lockoutTimer > 0 || loading}
                dir="ltr"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
                disabled={lockoutTimer > 0 || loading}
                dir="ltr"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-blue-400 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-3"
          >
            {loading ? (
              <span>جاري التحقق الأمني...</span>
            ) : lockoutTimer > 0 ? (
              <span>إيقاف مؤقت ({lockoutTimer} ثانية)</span>
            ) : (
              <>
                <span>تسجيل الدخول الآمن</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-8 text-center text-[11px] text-slate-400">
          نظام محمي ومشفر محلياً 100% — ضد محاولات الاختراق والتخمين
        </p>
      </div>
    </div>
  );
};
