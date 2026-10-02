import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Phone, MapPin, Building2, ArrowLeft } from 'lucide-react';
import { Client } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSelectClient,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? clients.filter((c) => {
        return (
          c.fullName.toLowerCase().includes(normalized) ||
          c.phone.includes(normalized) ||
          c.nationalId.includes(normalized) ||
          (c.city && c.city.toLowerCase().includes(normalized)) ||
          (c.notes && c.notes.toLowerCase().includes(normalized)) ||
          (c.detailedAddress && c.detailedAddress.toLowerCase().includes(normalized))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الموبايل، الرقم القومي، المدينة، الملاحظات..."
            className="w-full bg-transparent border-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            إغلاق
          </button>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold">ابدأ بكتابة أي معلومة للبحث الفوري عن عميل</p>
              <p className="text-[11px] mt-1 text-slate-400/80">
                يبحث النظام فوراً في الأسماء، أرقام الموبايل، القومي، والمدن
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">
                لا توجد نتائج مطابقة لـ "{query}"
              </p>
              <p className="text-[11px]">تأكد من صحة الاسم أو الأرقام المدخلة</p>
            </div>
          ) : (
            results.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onSelectClient(client);
                  onClose();
                }}
                className="w-full text-right p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{client.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{client.serialNumber}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-mono" dir="ltr">{client.phone}</span>
                      {client.city && <span>• {client.city}</span>}
                      {client.propertiesCount !== undefined && <span>• {client.propertiesCount} منشأة</span>}
                    </div>
                  </div>
                </div>

                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        {query.trim() && results.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-800/30">
            <span>تم العثور على {results.length} عميل</span>
            <span>اضغط على العميل لعرض التفاصيل الكاملة</span>
          </div>
        )}
      </div>
    </div>
  );
};
