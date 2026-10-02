import React from 'react';
import {
  Menu,
  Search,
  Bot,
  Sun,
  Moon,
  LogOut,
  Wifi,
  WifiOff,
  Keyboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface TopBarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAIChat: () => void;
  onOpenShortcuts?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenAIChat,
  onOpenShortcuts,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Right Side: Sidebar Toggle & Official Branding */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 sm:p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
          aria-label="القائمة الجانبية"
          title="فتح / إغلاق القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center shadow-md p-1.5 shrink-0 ring-2 ring-blue-500/30">
            <img src="/icon.svg" alt="أرشيف الضرائب" className="w-full h-full object-contain" />
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                أرشيف الضرائب
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900">
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>المنظومة الرقمية</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight block mt-0.5">
              Tax Archive System • الإصدار المعتمد 2026
            </span>
          </div>
        </div>
      </div>

      {/* Center: Developer Copyright & WhatsApp Contact Link */}
      <div className="hidden lg:flex items-center">
        <a
          href="https://wa.me/201050543116?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A3%D8%B1%D8%B4%D9%8A%D9%81%20%D8%A7%D9%84%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8"
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل مع المطور مباشرة عبر واتساب"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 text-white border border-slate-700 text-xs font-bold transition shadow-xs group"
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] text-slate-300">حقوق المطور:</span>
          <span className="font-mono text-xs font-black text-emerald-400 tracking-wide" dir="ltr">
            01050543116
          </span>
        </a>
      </div>

      {/* Left Side: Search, AI, Theme Toggle, Shortcuts, PWA, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 hover:border-blue-500/40 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
          title="بحث فوري (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="hidden md:inline">بحث فوري...</span>
          <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* AI Assistant Button (Executive Royal Navy) */}
        <button
          onClick={onOpenAIChat}
          className="relative flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
          title="المساعد الذكي (AI) - تنفيذ أوامر وإحصائيات"
        >
          <Bot className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">الذكاء الاصطناعي</span>
          <span
            className={`w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
        </button>

        {/* PWA Install Button */}
        <div className="hidden sm:block">
          <PWAInstallButton />
        </div>

        {/* Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="hidden sm:inline-flex p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer"
            title="اختصارات لوحة المفاتيح (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        {/* Highly Visible Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs shadow-xs transition cursor-pointer"
          aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
          title={theme === 'dark' ? 'التبديل إلى الوضع النهاري (فاتح)' : 'التبديل إلى الوضع الليلي (داكن)'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400 animate-in spin-in-180 duration-200" />
              <span className="hidden md:inline text-[11px]">نهاري</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-600 fill-blue-600 animate-in spin-in-180 duration-200" />
              <span className="hidden md:inline text-[11px]">ليلي</span>
            </>
          )}
        </button>

        {/* Online Indicator Status */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[11px] font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70"
          title={isOnline ? 'متصل بالإنترنت (سحابي + محلي)' : 'وضع العمل دون إنترنت (Offline First)'}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden xl:inline text-emerald-600 dark:text-emerald-400">متصل</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline text-amber-600 dark:text-amber-400">محلي</span>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 sm:p-2.5 rounded-2xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition cursor-pointer"
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
