import React from 'react';
import { Trash2, RotateCcw, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Client } from '../types';

interface TrashPageProps {
  trashClients: Client[];
  onRestoreClient: (client: Client) => void;
  onPermanentDeleteClient: (client: Client) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
}

export const TrashPage: React.FC<TrashPageProps> = ({
  trashClients,
  onRestoreClient,
  onPermanentDeleteClient,
  onRestoreAll,
  onEmptyTrash,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  سلة المهملات
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                  {trashClients.length} عميل محذوف
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                العملاء المنقولون إلى هنا يمكن استعادتهم أو حذفهم نهائياً
              </p>
            </div>
          </div>
        </div>

        {trashClients.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRestoreAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الكل</span>
            </button>

            <button
              onClick={onEmptyTrash}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>تفريغ السلة نهائياً</span>
            </button>
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>ملاحظة هامة:</strong> إذا تم حذف أي عميل نهائياً، فلن يكون بالإمكان استعادته مرة أخرى إلا من خلال نسخة احتياطية سابقة.
        </span>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {trashClients.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
              سلة المهملات فارغة
            </h3>
            <p className="text-xs text-slate-400">
              لا يوجد أي عملاء محذوفين في سلة المهملات حالياً.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="pb-3 pr-2">مسلسل</th>
                  <th className="pb-3">الاسم بالكامل</th>
                  <th className="pb-3">رقم الموبايل</th>
                  <th className="pb-3">الرقم القومي</th>
                  <th className="pb-3">المدينة / القرية</th>
                  <th className="pb-3">تاريخ النقل للسلة</th>
                  <th className="pb-3 pl-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {trashClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition"
                  >
                    <td className="py-3.5 pr-2 font-mono text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      {client.fullName}
                    </td>
                    <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300" dir="ltr">
                      {client.phone}
                    </td>
                    <td className="py-3.5 font-mono text-slate-500 text-[11px]" dir="ltr">
                      {client.nationalId}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {client.city || 'غير محدد'}
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {client.deletedAt ? new Date(client.deletedAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </td>
                    <td className="py-3.5 pl-2 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Restore Button (↩️) */}
                        <button
                          onClick={() => onRestoreClient(client)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold transition cursor-pointer"
                          title="استعادة العميل (↩️)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة</span>
                        </button>

                        {/* Permanent Delete Button (❌) */}
                        <button
                          onClick={() => onPermanentDeleteClient(client)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold transition cursor-pointer"
                          title="حذف نهائي (❌)"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
