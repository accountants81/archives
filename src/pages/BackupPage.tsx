import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Copy,
  ClipboardPaste,
  ShieldCheck,
  Database,
  FileJson,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  History,
  RotateCcw,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react';
import { Client } from '../types';
import { exportBackupJSON, importBackupJSON, getClients, getTrash, getSettings } from '../utils/storage';
import { exportClientsToExcel } from '../utils/excel';

interface BackupPageProps {
  clients: Client[];
  onBackupRestored: () => void;
  showToast: (text: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onTriggerLoading: (msg: string, callback: () => void) => void;
}

interface LocalSnapshot {
  id: string;
  timestamp: string;
  clientsCount: number;
  data: string;
}

const SNAPSHOTS_KEY = 'tax_archive_snapshots_v2';

export const BackupPage: React.FC<BackupPageProps> = ({
  clients,
  onBackupRestored,
  showToast,
  onTriggerLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingJSON, setPendingJSON] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState(false);

  // Direct Paste Restore State
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJSON, setPastedJSON] = useState('');

  // Local Snapshots State
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveSnapshotsList = (list: LocalSnapshot[]) => {
    setSnapshots(list);
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving snapshots:', e);
    }
  };

  // 1. Download Backup (.json) with safe blob handling and data uri fallback
  const handleDownloadBackup = () => {
    try {
      const jsonContent = exportBackupJSON();
      const fileName = `archive-tax-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Method A: Blob URL with deferred revoke
      let blobDownloaded = false;
      if (typeof window.Blob !== 'undefined' && typeof window.URL !== 'undefined') {
        try {
          const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 30000);
          blobDownloaded = true;
        } catch (blobErr) {
          console.warn('Blob download failed, using Data URL fallback:', blobErr);
        }
      }

      // Method B: Data URI fallback if needed
      if (!blobDownloaded) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonContent);
        const link = document.createElement('a');
        link.href = dataStr;
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 10000);
      }

      // Also create an auto-snapshot so user has a local copy inside the app
      createLocalSnapshot(jsonContent);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      showToast('تم تحميل ملف النسخة الاحتياطية بنجاح إلى جهازك وتم حفظ نسخة سريعة في التطبيق', 'success');
    } catch (err: any) {
      showToast('فشل تحميل الملف: ' + (err.message || ''), 'error');
    }
  };

  // 2. Copy Backup JSON text to clipboard
  const handleCopyBackupJSON = () => {
    try {
      const jsonContent = exportBackupJSON();
      navigator.clipboard.writeText(jsonContent).then(() => {
        setCopiedCodeSuccess(true);
        setTimeout(() => setCopiedCodeSuccess(false), 3000);
        showToast('تم نسخ كود النسخة الاحتياطية إلى الحافظة بنجاح!', 'success');
      }).catch(() => {
        // Fallback prompt or alert
        showToast('تعذر النسخ التلقائي، يمكنك استخدام خيار تحميل الملف', 'warning');
      });
    } catch (err: any) {
      showToast('فشل نسخ كود النسخة: ' + (err.message || ''), 'error');
    }
  };

  // Create a local snapshot inside app
  const createLocalSnapshot = (customData?: string) => {
    const dataToStore = customData || exportBackupJSON();
    const newSnapshot: LocalSnapshot = {
      id: 'snap_' + Date.now(),
      timestamp: new Date().toLocaleString('ar-EG'),
      clientsCount: clients.length,
      data: dataToStore,
    };
    const updated = [newSnapshot, ...snapshots.slice(0, 4)]; // Keep last 5 snapshots
    saveSnapshotsList(updated);
  };

  // 3. File selected for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.clients)) {
            setPendingJSON(content);
            setShowConfirmModal(true);
          } else {
            showToast('الملف الذي اخترته لا يحتوي على بنية نسخة احتياطية صالحة للأرشيف', 'error');
          }
        } catch {
          showToast('الملف المختار ليس بصيغة JSON صالحة', 'error');
        }
      }
    };
    reader.onerror = () => {
      showToast('فشل في قراءة الملف المحدد من جهازك', 'error');
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. Restore confirmation execution
  const handleConfirmRestore = () => {
    if (!pendingJSON) return;
    setShowConfirmModal(false);

    onTriggerLoading('جاري استعادة النسخة الاحتياطية واستبدال البيانات...', () => {
      const result = importBackupJSON(pendingJSON);
      setPendingJSON(null);

      if (result.success) {
        onBackupRestored();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    });
  };

  // 5. Restore from pasted text
  const handlePasteRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedJSON.trim()) {
      showToast('الرجاء لصق كود النسخة الاحتياطية أولاً', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(pastedJSON.trim());
      if (!parsed || !Array.isArray(parsed.clients)) {
        showToast('كود النسخة الذي قمت بلصقه غير صالح أو لا يحتوي على عملاء', 'error');
        return;
      }

      setPendingJSON(pastedJSON.trim());
      setShowPasteModal(false);
      setPastedJSON('');
      setShowConfirmModal(true);
    } catch (err: any) {
      showToast('الكود الملصوق ليس بصيغة JSON صالحة: ' + (err.message || ''), 'error');
    }
  };

  // 6. Restore from a local snapshot
  const handleRestoreSnapshot = (snap: LocalSnapshot) => {
    setPendingJSON(snap.data);
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                النسخ الاحتياطي واستعادة البيانات
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تنزيل ملفات النسخ، أو نسخ الكود ولصقه، مع سجل نقاط الاستعادة الفورية
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              createLocalSnapshot();
              showToast('تم حفظ نقطة استعادة سريعة داخل التطبيق بنجاح', 'success');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>حفظ نقطة استعادة سريعة</span>
          </button>
        </div>
      </div>

      {/* Main Two Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Download & Copy Backup */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              1. تحميل النسخة الاحتياطية (📥)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              يقوم بحفظ وتصدير كافة بيانات الأرشيف ({clients.length} عميل مسجل حالياً) إلى ملف بصيغة <strong>JSON</strong> على جهازك.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              اسم الملف: archive-tax-backup-{new Date().toISOString().split('T')[0]}.json
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Download Button */}
            <button
              onClick={handleDownloadBackup}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم بدء تحميل الملف بنجاح!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف النسخة الاحتياطية (.json)</span>
                </>
              )}
            </button>

            {/* Quick Copy JSON Button for backup peace of mind */}
            <button
              type="button"
              onClick={handleCopyBackupJSON}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copiedCodeSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>تم نسخ كود النسخة إلى الحافظة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ كود النسخة الاحتياطية كنص (بديل سهل)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Restore Backup */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              2. استعادة البيانات (📤)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              اختر ملف نسخة احتياطية من جهازك أو قم بلصق كود النسخة مباشرة لاسترجاع السجلات في ثوانٍ.
            </p>
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              تنبيه: سيتم استبدال البيانات الحالية بالبيانات المستعادة بعد تأكيدك.
            </div>
          </div>

          <div className="space-y-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json,text/plain,*/*"
              className="hidden"
            />
            {/* Choose file button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>اختيار ملف النسخة الاحتياطية من الجهاز</span>
            </button>

            {/* Direct Paste Button */}
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-500" />
              <span>لصق كود النسخة الاحتياطية واستعادتها مباشرة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshots / Recent Local Backups */}
      {snapshots.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  سجل نقاط الاستعادة السريعة المحفوظة بالتطبيق
                </h3>
                <span className="text-[11px] text-slate-400">
                  يمكنك استعادة أي نقطة سابقة بنقرة واحدة مباشرة دون الحاجة للبحث عن الملف
                </span>
              </div>
            </div>

            <button
              onClick={() => saveSnapshotsList([])}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition"
            >
              مسح السجل
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    نسخة احتياطية: {snap.clientsCount} عميل
                  </span>
                  <span className="text-[11px] text-slate-400">
                    التاريخ: {snap.timestamp}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreSnapshot(snap)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة هذه النسخة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra Export Section: Excel Spreadsheet */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              تصدير سجل العملاء إلى Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تصدير جدول منظم متوافق مع Microsoft Excel و Google Sheets بكافة تفاصيل العملاء
            </p>
          </div>
        </div>

        <button
          onClick={() => exportClientsToExcel(clients)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>تصدير الآن</span>
        </button>
      </div>

      {/* Direct Paste Restore Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
            <h3 className="text-base font-black mb-2 flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-amber-500" />
              <span>استعادة عن طريق لصق كود النسخة</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              إذا قمت بنسخ كود النسخة الاحتياطية مسبقاً، يمكنك لصقه هنا مباشرة للبدء في الاستعادة دون الحاجة لاختيار ملف:
            </p>

            <form onSubmit={handlePasteRestoreSubmit} className="space-y-4">
              <textarea
                rows={7}
                value={pastedJSON}
                onChange={(e) => setPastedJSON(e.target.value)}
                placeholder='الصق كود JSON هنا (مثال: {"appName": "أرشيف الضرائب", "clients": [...]})'
                dir="ltr"
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  متابعة الاستعادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Warning Modal before Restore */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black mb-2">تأكيد استعادة البيانات</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              هل أنت متأكد من استعادة البيانات؟ سيتم استبدال جميع البيانات الحالية في Local Storage بالبيانات الواردة في هذه النسخة الاحتياطية.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingJSON(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                نعم، استبدل واستعد البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
