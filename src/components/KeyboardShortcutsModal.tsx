import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', desc: 'فتح نافذة البحث الفوري السريع' },
    { key: 'N أو Alt + N', desc: 'إضافة عميل جديد مباشرة' },
    { key: 'A أو Alt + A', desc: 'فتح المساعد الذكي (AI)' },
    { key: 'D أو Alt + D', desc: 'التبديل بين الوضع الليلي والنهاري' },
    { key: 'B أو Alt + B', desc: 'الانتقال إلى صفحة النسخ الاحتياطي' },
    { key: 'Esc', desc: 'إغلاق النوافذ المنبثقة الحالية' },
    { key: '؟ أو /', desc: 'فتح دليل اختصارات لوحة المفاتيح' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black">اختصارات لوحة المفاتيح</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تنقل ونفّذ العمليات في أرشيف الضرائب بسرعة فائقة
            </p>
          </div>
        </div>

        <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 font-mono font-bold text-[10px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs" dir="ltr">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
        >
          فهمت ذلك
        </button>
      </div>
    </div>
  );
};
