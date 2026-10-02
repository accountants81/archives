import React, { useState } from 'react';
import {
  KeyRound,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  HardDrive,
  Shield,
  ShieldCheck,
  Keyboard,
  Activity,
  FileCheck,
  MessageCircle,
} from 'lucide-react';
import { AppSettings, Client } from '../types';
import { calculateStorageUsage, DEFAULT_ADMIN_PASSWORD } from '../utils/storage';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';

interface SettingsPageProps {
  settings: AppSettings;
  clients?: Client[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllData: () => void;
  showToast: (text: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  clients = [],
  onUpdateSettings,
  onClearAllData,
  showToast,
}) => {
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Clear data confirm modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Diagnostic state
  const [diagnosticResult, setDiagnosticResult] = useState<{
    checked: boolean;
    issues: string[];
    validCount: number;
  }>({ checked: false, issues: [], validCount: 0 });

  const storageUsage = calculateStorageUsage();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const validCurrent = settings.adminPasswordHash || DEFAULT_ADMIN_PASSWORD;

    if (currentPassword !== validCurrent) {
      setPasswordError('كلمة المرور الحالية غير صحيحة!');
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError('يرجى إدخال كلمة المرور الجديدة.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة وتأكيدها غير متطابقين!');
      return;
    }

    onUpdateSettings({ adminPasswordHash: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('تم تغيير كلمة المرور بنجاح وحفظها في التخزين المحلي', 'success');
  };

  // Run audit on database
  const runDiagnostics = () => {
    const issues: string[] = [];
    const phoneSet = new Set<string>();
    const nationalIdSet = new Set<string>();

    clients.forEach((c, idx) => {
      // Phone format (only check if provided, since phone is optional)
      if (c.phone && c.phone.trim()) {
        if (!/^(010|011|012|015)[0-9]{8}$/.test(c.phone.trim())) {
          issues.push(`العميل "${c.fullName}" لديه رقم هاتف غير قياسي (${c.phone})`);
        }
        if (phoneSet.has(c.phone.trim())) {
          issues.push(`تكرار في رقم الهاتف: ${c.phone} مسجل لأكثر من عميل`);
        } else {
          phoneSet.add(c.phone.trim());
        }
      }

      // National ID format
      if (!/^[0-9]{14}$/.test(c.nationalId)) {
        issues.push(`العميل "${c.fullName}" لديه رقم قومي غير مكتمل 14 رقماً (${c.nationalId})`);
      }
      if (nationalIdSet.has(c.nationalId)) {
        issues.push(`تكرار في الرقم القومي: ${c.nationalId} مسجل لأكثر من عميل`);
      } else {
        nationalIdSet.add(c.nationalId);
      }
    });

    setDiagnosticResult({
      checked: true,
      issues,
      validCount: clients.length - issues.length,
    });

    if (issues.length === 0) {
      showToast('اكتمل الفحص: قاعدة بيانات الأرشيف سليمة ومطابقة 100%', 'success');
    } else {
      showToast(`تم اكتشاف ${issues.length} ملاحظة في السجلات تحتاج مراجعة`, 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              إعدادات النظام والأمان
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تغيير كلمة المرور، فحص سلامة الأرشيف، واختصارات لوحة المفاتيح
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowShortcutsModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
        >
          <Keyboard className="w-4 h-4 text-blue-600" />
          <span>اختصارات المفاتيح</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Change Admin Password */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                تغيير كلمة المرور
              </h2>
              <span className="text-[11px] text-slate-400">
                تحديث كلمة مرور الدخول الثابتة للمنظومة
              </span>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الحالية (للتأكيد)
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                  dir="ltr"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  dir="ltr"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                dir="ltr"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              * يتم حفظ كلمة المرور الجديدة في Local Storage ولن تختفي بعد تحديث الصفحة أو إغلاق المتصفح.
            </p>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              حفظ كلمة المرور الجديدة
            </button>
          </form>
        </div>

        {/* Section 2: Display, Health Check & Storage */}
        <div className="space-y-6">
          {/* Database Health & Diagnostic Tool */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    فحص سلامة الأرشيف والبيانات
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    تدقيق الأرقام القومية، الهواتف، والكشف عن التكرارات
                  </span>
                </div>
              </div>

              <button
                onClick={runDiagnostics}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                بدء الفحص
              </button>
            </div>

            {diagnosticResult.checked && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2 animate-in fade-in">
                {diagnosticResult.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>جميع السجلات والملفات الضريبية سليمة ومطابقة 100%!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-amber-700 dark:text-amber-400">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>تم رصد {diagnosticResult.issues.length} ملاحظة:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pr-1 text-[11px] opacity-90 max-h-32 overflow-y-auto">
                      {diagnosticResult.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preferences & Storage */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              تفضيلات العرض والمساحة
            </h2>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  إظهار عدد العملاء في الشريط الجانبي
                </p>
                <p className="text-[11px] text-slate-400">
                  عرض شارات الأرقام بجانب أقسام القائمة (مثال: إدارة العملاء (15))
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ showSidebarClientCount: !settings.showSidebarClientCount })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.showSidebarClientCount ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.showSidebarClientCount ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Storage Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  مساحة التخزين المحلي (Local Storage):
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {storageUsage.usedKb} KB مستخدمة
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.max(2, storageUsage.percent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Developer & Technical Support Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>حقوق الملكية الفكرية والدعم الفني</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                برمجة وتطوير حصري لمنظومة أرشيف الضرائب الرقمية. للتواصل المباشر مع المطور:
              </p>
            </div>

            <a
              href="https://wa.me/201050543116?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%A3%D8%B1%D8%B4%D9%8A%D9%81%20%D8%A7%D9%84%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب:</span>
              <span className="font-mono text-sm tracking-wider" dir="ltr">01050543116</span>
            </a>
          </div>

          {/* Danger Zone: Clear All Data */}
          <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>منطقة العمليات الحساسة (Danger Zone)</span>
            </div>

            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              <strong>مسح جميع البيانات:</strong> يؤدي هذا الإجراء إلى حذف كافة العملاء والمنشآت وسلة المهملات نهائياً والبدء من الصفر.
            </p>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح جميع البيانات والبدء من الصفر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Confirmation Modal for Clearing All Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black mb-2">تأكيد مسح كافة البيانات</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              هل أنت متأكد تماماً من رغبتك في مسح كافة سجلات العملاء وسلة المهملات؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAllData();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                نعم، امسح كل البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
