import React from 'react';
import {
  LayoutDashboard,
  Users,
  Trash2,
  HardDriveDownload,
  Settings,
  Bot,
  X,
  Shield,
  MessageCircle,
  UserPlus,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { ActivePage } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  clientsCount: number;
  trashCount: number;
  showCounts: boolean;
  userEmail: string;
  onOpenAddClient?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activePage,
  onSelectPage,
  clientsCount,
  trashCount,
  showCounts,
  userEmail,
  onOpenAddClient,
}) => {
  // Group 1: Main Core Management
  const coreMenuItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'لوحة التحكم',
      sublabel: 'المؤشرات العامة والمخططات',
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: 'clients' as ActivePage,
      label: 'إدارة العملاء',
      sublabel: 'سجل العملاء والمنشآت',
      icon: Users,
      count: showCounts ? clientsCount : null,
      badgeColor: 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    },
    {
      id: 'trash' as ActivePage,
      label: 'سلة المهملات',
      sublabel: 'الملفات المحذوفة مؤقتاً',
      icon: Trash2,
      count: showCounts ? trashCount : null,
      badgeColor:
        trashCount > 0
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    },
  ];

  // Group 2: System Tools & Intelligence
  const systemMenuItems = [
    {
      id: 'ai' as ActivePage,
      label: 'المساعد الذكي (AI)',
      sublabel: 'أوامر صوتية وفورية',
      icon: Bot,
      count: null,
      special: true,
    },
    {
      id: 'backup' as ActivePage,
      label: 'النسخ الاحتياطي',
      sublabel: 'تصدير واسترجاع البيانات بأمان',
      icon: HardDriveDownload,
      count: null,
    },
    {
      id: 'settings' as ActivePage,
      label: 'الإعدادات والأمان',
      sublabel: 'فحص الحساب والخصوصية',
      icon: Settings,
      count: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop with smooth fade */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-72 bg-white dark:bg-slate-900 border-l border-slate-200/90 dark:border-slate-800/90 shadow-2xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header: Brand & Seal */}
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/20 p-1.5 shrink-0 ring-2 ring-blue-500/30">
                <img src="/icon.svg" alt="شعار" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    أرشيف الضرائب
                  </h2>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    المنظومة الرقمية المعتمدة
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer transition"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: New Client Button (Executive Royal Navy & Sapphire) */}
          {onOpenAddClient && (
            <div className="px-4 pt-3.5 pb-1">
              <button
                onClick={() => {
                  onOpenAddClient();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>إضافة عميل جديد</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/20 rounded text-white font-bold">
                  Alt+N
                </kbd>
              </button>
            </div>
          )}
        </div>

        {/* Middle Navigation Section (Clean 2-Group Layout) */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          {/* Group 1: Core Navigation */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-2 rounded-full bg-blue-600" />
              <span>السجلات والملفات</span>
            </div>
            <div className="space-y-1">
              {coreMenuItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectPage(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-right">
                        <div className="leading-tight">{item.label}</div>
                        <div
                          className={`text-[9.5px] font-normal mt-0.5 ${
                            isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.count !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      <ChevronLeft
                        className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'text-white/80' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: System Tools & Intelligence */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-2 rounded-full bg-blue-600" />
              <span>الأدوات والذكاء الاصطناعي</span>
            </div>
            <div className="space-y-1">
              {systemMenuItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectPage(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : item.special
                        ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.special
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-right">
                        <div className="leading-tight">{item.label}</div>
                        <div
                          className={`text-[9.5px] font-normal mt-0.5 ${
                            isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {item.sublabel}
                        </div>
                      </div>
                    </div>

                    <ChevronLeft
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Section: Unified VIP Card (Executive Platinum & Navy + WhatsApp) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2">
          {/* Master Integrated Card */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            {/* Admin Header with Online Status */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    مسؤول المنظومة
                  </p>
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 truncate font-mono" dir="ltr">
                    {userEmail}
                  </p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="نشط الآن" />
            </div>

            {/* Developer Rights Notice */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-0.5">
              <span className="font-bold">
                جميع الحقوق محفوظة للمطور
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                2026 ©
              </span>
            </div>

            {/* Direct WhatsApp Call-to-Action Button */}
            <a
              href="https://wa.me/201050543116?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A3%D8%B1%D8%B4%D9%8A%D9%81%20%D8%A7%D9%84%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              title="تواصل مع المطور عبر واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
              <span>واتساب المطور:</span>
              <span className="font-mono text-xs font-black tracking-wide" dir="ltr">
                01050543116
              </span>
            </a>
          </div>

          {/* PWA Install Button for Mobile */}
          <div className="block lg:hidden">
            <PWAInstallButton />
          </div>
        </div>
      </aside>
    </>
  );
};
