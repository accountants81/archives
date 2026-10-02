import React, { useState } from 'react';
import { X, Filter, RotateCcw, Search } from 'lucide-react';
import { AdvancedFilterOptions } from '../types';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterOptions;
  onApplyFilters: (filters: AdvancedFilterOptions) => void;
  onResetFilters: () => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterOptions>({ ...filters });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                البحث المتقدم والفلترة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                حدد معايير الفلترة الدقيقة لعرض العملاء المطلوبين
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بحث بالاسم
              </label>
              <input
                type="text"
                value={localFilters.name}
                onChange={(e) => setLocalFilters({ ...localFilters, name: e.target.value })}
                placeholder="جزء من اسم العميل..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بحث برقم الموبايل
              </label>
              <input
                type="tel"
                value={localFilters.phone}
                onChange={(e) => setLocalFilters({ ...localFilters, phone: e.target.value })}
                placeholder="010..."
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 text-right"
              />
            </div>
          </div>

          {/* Row 2: City & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بحث بالمدينة / القرية
              </label>
              <input
                type="text"
                value={localFilters.city}
                onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                placeholder="مثال: بركة السبع، ميت غمر..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بحث بالملحوظة
              </label>
              <input
                type="text"
                value={localFilters.notes}
                onChange={(e) => setLocalFilters({ ...localFilters, notes: e.target.value })}
                placeholder="كلمات في الملاحظات..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 3: Gender & Properties Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                فلترة حسب النوع
              </label>
              <select
                value={localFilters.gender}
                onChange={(e) => setLocalFilters({ ...localFilters, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">الكل (ذكور وإناث)</option>
                <option value="ذكر">ذكر فقط</option>
                <option value="أنثى">أنثى فقط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                فلترة حسب عدد المنشآت
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={localFilters.propertiesCondition}
                  onChange={(e) => setLocalFilters({ ...localFilters, propertiesCondition: e.target.value as any })}
                  className="w-32 px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="any">أي عدد</option>
                  <option value="gt">أكبر من</option>
                  <option value="lt">أقل من</option>
                  <option value="eq">يساوي</option>
                </select>

                {localFilters.propertiesCondition !== 'any' && (
                  <input
                    type="number"
                    min="0"
                    value={localFilters.propertiesCount ?? ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        propertiesCount: e.target.value === '' ? undefined : parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="العدد"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Date Range */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              فلترة حسب تاريخ الإضافة
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 mb-1 block">من تاريخ:</span>
                <input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 mb-1 block">إلى تاريخ:</span>
                <input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800/50"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الكل</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>تطبيق الفلتر</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
