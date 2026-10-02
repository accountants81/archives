import React from 'react';
import { X, Copy, Edit, Phone, CreditCard, Building2, MapPin, FileText, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import { Client } from '../types';

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onCopy: (client: Client) => void;
}

export const ClientViewModal: React.FC<ClientViewModalProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onCopy,
}) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                client.colorTag === 'green'
                  ? 'bg-emerald-500'
                  : client.colorTag === 'red'
                  ? 'bg-rose-500'
                  : client.colorTag === 'yellow'
                  ? 'bg-amber-500'
                  : client.colorTag === 'gray'
                  ? 'bg-slate-400'
                  : 'bg-blue-500'
              }`}
            />
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {client.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                مسلسل: #{client.serialNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">رقم الموبايل الرئيسي</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                  {client.phone}
                </span>
              </div>
            </div>

            {/* National ID */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">الرقم القومي (14 رقم)</span>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                  {client.nationalId}
                </span>
              </div>
            </div>

            {/* City / Village */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">المدينة / القرية</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {client.city || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Properties count */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">عدد المنشآت والبيوت</span>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {client.propertiesCount ?? 0} منشأة
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">كلمة سر حساب العميل</span>
              {client.password ? (
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
                  {client.password}
                </span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                  لم يتم تعيينها
                </span>
              )}
            </div>

            {/* Gender */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">النوع</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {client.gender || 'غير محدد'}
              </span>
            </div>
          </div>

          {/* Address */}
          {client.detailedAddress && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">العنوان بالتفصيل</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {client.detailedAddress}
              </p>
            </div>
          )}

          {/* Alternative Phones */}
          {client.alternativePhones && client.alternativePhones.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1.5">أرقام هواتف بديلة</span>
              <div className="flex flex-wrap gap-2">
                {client.alternativePhones.map((alt, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
                    dir="ltr"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tax Declaration Link */}
          {client.declarationLink && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block mb-1">
                رابط الإقرار الضريبي
              </span>
              <a
                href={client.declarationLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-700 dark:text-blue-300 font-semibold hover:underline flex items-center gap-1.5 break-all"
                dir="ltr"
              >
                <span>{client.declarationLink}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">الملحوظة</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>تاريخ الإضافة: {new Date(client.createdAt).toLocaleString('ar-EG')}</span>
            <span>آخر تعديل: {new Date(client.updatedAt).toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={() => onCopy(client)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200/50 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ كافة البيانات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(client);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
