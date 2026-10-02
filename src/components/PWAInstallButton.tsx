import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Laptop,
  Apple,
  X,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>(() => {
    if (isIOS) return 'ios';
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    return isMobile ? 'android' : 'desktop';
  });
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running in standalone/installed app mode, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="تثبيت المنظومة كتطبيق على جهازك (حاسوب أو موبايل)"
        className={`flex items-center justify-center gap-1.5 font-bold transition-all shadow-xs cursor-pointer ${
          compact
            ? 'p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 text-xs border border-blue-200/60 dark:border-blue-800'
            : 'px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-600/20'
        }`}
      >
        {justInstalled ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تم التثبيت</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">تثبيت التطبيق</span>
          </>
        )}
      </button>

      {/* Comprehensive Multi-Platform Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute left-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md p-1.5 shrink-0">
                <img src="/icon.svg" alt="شعار" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  تثبيت "أرشيف الضرائب" على جهازك
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  يعمل كتطبيق مستقل بدون متصفح، وبدون الحاجة لإنترنت
                </p>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>لابتوب / كمبيوتر</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>أندرويد (Android)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>آيفون (iOS)</span>
              </button>
            </div>

            {/* Tab 1: Laptop & Desktop */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  خطوات التثبيت على نظام Windows أو Mac:
                </p>
                <ol className="space-y-2 pr-4 list-decimal text-slate-600 dark:text-slate-300">
                  <li>
                    انظر إلى شريط عنوان المتصفح (في الأعلى على اليسار أو اليمين)، ستجد أيقونة تثبيت صغيرة{' '}
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold font-mono">
                      ⊕ تثبيت
                    </span>
                    .
                  </li>
                  <li>
                    أو اضغط على زر خيارات المتصفح (⋮) في أعلى الزاوية، ثم اختر <strong>"تثبيت أرشيف الضرائب" (Install App)</strong>.
                  </li>
                  <li>
                    اضغط <strong>"تثبيت"</strong> وسيتم إنشاء أيقونة رسمية على سطح المكتب وقائمة Start فوراً!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: Android */}
            {activeTab === 'android' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  خطوات التثبيت على هواتف سامسونج وشاومي وأندرويد:
                </p>
                <ol className="space-y-2 pr-4 list-decimal text-slate-600 dark:text-slate-300">
                  <li>
                    في متصفح Chrome، اضغط على زر القائمة (⋮) أعلى يسار الشاشة.
                  </li>
                  <li>
                    اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.
                  </li>
                  <li>
                    ستظهر أيقونة المنظومة مع بقية تطبيقات هاتفك وتعمل حتى دون شبكة إنترنت.
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: iPhone & iPad */}
            {activeTab === 'ios' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  خطوات التثبيت على هواتف iPhone وأجهزة iPad (Safari):
                </p>
                <ol className="space-y-2 pr-4 list-decimal text-slate-600 dark:text-slate-300">
                  <li>
                    اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل (المربع بسهم لأعلى).
                  </li>
                  <li>
                    مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.
                  </li>
                  <li>
                    اضغط <strong>"إضافة" (Add)</strong> في أعلى الزاوية ليتم تثبيته كتطبيق مستقل.
                  </li>
                </ol>
              </div>
            )}

            {/* Action Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
