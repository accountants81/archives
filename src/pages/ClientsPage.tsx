import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Edit,
  Trash2,
  Copy,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Users,
  CheckSquare,
  Square,
  MessageCircle,
  PhoneCall,
  Printer,
  FileImage,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { Client, AdvancedFilterOptions } from '../types';
import { exportClientsToExcel } from '../utils/excel';
import { ClientPrintModal } from '../components/ClientPrintModal';

interface ClientsPageProps {
  clients: Client[];
  onOpenAddClient: () => void;
  onOpenAdvancedSearch: () => void;
  onEditClient: (client: Client) => void;
  onViewClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onCopyClient: (client: Client) => void;
  onBulkDeleteClients?: (clientIds: string[]) => void;
  activeAdvancedFilters: AdvancedFilterOptions;
  onResetAdvancedFilters: () => void;
}

type SortField = 'serialNumber' | 'fullName' | 'phone' | 'nationalId' | 'city' | 'propertiesCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  onOpenAddClient,
  onOpenAdvancedSearch,
  onEditClient,
  onViewClient,
  onDeleteClient,
  onCopyClient,
  onBulkDeleteClients,
  activeAdvancedFilters,
  onResetAdvancedFilters,
}) => {
  // Search state
  const [instantSearch, setInstantSearch] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('serialNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Print modal state
  const [printClient, setPrintClient] = useState<Client | null>(null);
  const [printClientsList, setPrintClientsList] = useState<Client[]>([]);

  // Check if advanced filters are applied
  const hasActiveAdvancedFilters =
    Boolean(activeAdvancedFilters.name) ||
    Boolean(activeAdvancedFilters.phone) ||
    Boolean(activeAdvancedFilters.city) ||
    Boolean(activeAdvancedFilters.notes) ||
    activeAdvancedFilters.gender !== 'all' ||
    activeAdvancedFilters.propertiesCondition !== 'any' ||
    Boolean(activeAdvancedFilters.startDate) ||
    Boolean(activeAdvancedFilters.endDate);

  // Filtering & Sorting
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // 1. Instant text search (Name, Phone, City, Notes)
    const norm = instantSearch.trim().toLowerCase();
    if (norm) {
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(norm) ||
          c.phone.includes(norm) ||
          c.nationalId.includes(norm) ||
          (c.city && c.city.toLowerCase().includes(norm)) ||
          (c.notes && c.notes.toLowerCase().includes(norm))
      );
    }

    // 2. Advanced filters if any
    if (activeAdvancedFilters.name.trim()) {
      const q = activeAdvancedFilters.name.trim().toLowerCase();
      result = result.filter((c) => c.fullName.toLowerCase().includes(q));
    }
    if (activeAdvancedFilters.phone.trim()) {
      const q = activeAdvancedFilters.phone.trim();
      result = result.filter((c) => c.phone.includes(q));
    }
    if (activeAdvancedFilters.city.trim()) {
      const q = activeAdvancedFilters.city.trim().toLowerCase();
      result = result.filter((c) => c.city && c.city.toLowerCase().includes(q));
    }
    if (activeAdvancedFilters.notes.trim()) {
      const q = activeAdvancedFilters.notes.trim().toLowerCase();
      result = result.filter((c) => c.notes && c.notes.toLowerCase().includes(q));
    }
    if (activeAdvancedFilters.gender !== 'all') {
      result = result.filter((c) => c.gender === activeAdvancedFilters.gender);
    }
    if (activeAdvancedFilters.propertiesCondition !== 'any' && activeAdvancedFilters.propertiesCount !== undefined) {
      const target = activeAdvancedFilters.propertiesCount;
      if (activeAdvancedFilters.propertiesCondition === 'gt') {
        result = result.filter((c) => (c.propertiesCount || 0) > target);
      } else if (activeAdvancedFilters.propertiesCondition === 'lt') {
        result = result.filter((c) => (c.propertiesCount || 0) < target);
      } else if (activeAdvancedFilters.propertiesCondition === 'eq') {
        result = result.filter((c) => (c.propertiesCount || 0) === target);
      }
    }
    if (activeAdvancedFilters.startDate) {
      const start = new Date(activeAdvancedFilters.startDate).getTime();
      result = result.filter((c) => new Date(c.createdAt).getTime() >= start);
    }
    if (activeAdvancedFilters.endDate) {
      const end = new Date(activeAdvancedFilters.endDate).getTime() + 86400000;
      result = result.filter((c) => new Date(c.createdAt).getTime() <= end);
    }

    // 3. Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clients, instantSearch, activeAdvancedFilters, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const currentRecords = useMemo(() => {
    if (pageSize === 999999) return filteredClients;
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // Toggle sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 inline-block mr-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline-block mr-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline-block mr-1 font-bold" />
    );
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === currentRecords.length && currentRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      currentRecords.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk actions
  const handleBulkExport = () => {
    const selectedClients = clients.filter((c) => selectedIds.has(c.id));
    exportClientsToExcel(selectedClients.length > 0 ? selectedClients : filteredClients);
  };

  const handleBulkCopy = () => {
    const selectedClients = clients.filter((c) => selectedIds.has(c.id));
    const text = selectedClients
      .map(
        (c, idx) =>
          `[${idx + 1}] الاسم: ${c.fullName} | هاتف: ${c.phone} | قومي: ${c.nationalId} | مدينة: ${c.city || 'غير محدد'} | منشآت: ${c.propertiesCount || 0}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleOpenWhatsApp = (c: Client) => {
    if (!c.phone || !c.phone.trim()) {
      return;
    }
    const cleanPhone = c.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const msg = encodeURIComponent(
      `السلام عليكم أستاذ ${c.fullName}، بخصوص ملفكم المسجل في منظومة أرشيف الضرائب، يرجى التكرم بالاطلاع والتواصل معنا في حال وجود أي استفسار.`
    );
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              إدارة وسجل العملاء
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredClients.length} من إجمالي {clients.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل إلكتروني منظم لكافة الممولين والمنشآت مع دعم الترتيب والبحث والفرز والطباعة
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportClientsToExcel(filteredClients)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
            title="تصدير السجلات الحالية إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">تصدير Excel</span>
          </button>

          <button
            onClick={onOpenAddClient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Instant Search Input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={instantSearch}
            onChange={(e) => {
              setInstantSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث فوري بالاسم، الموبايل، الرقم القومي، المدينة، أو الملاحظة..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          {instantSearch && (
            <button
              onClick={() => setInstantSearch('')}
              className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls & Items Per Page */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Advanced Search Button */}
          <button
            onClick={onOpenAdvancedSearch}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              hasActiveAdvancedFilters
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>البحث المتقدم</span>
            {hasActiveAdvancedFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Reset Filters if applied */}
          {(hasActiveAdvancedFilters || instantSearch) && (
            <button
              onClick={() => {
                setInstantSearch('');
                onResetAdvancedFilters();
                setCurrentPage(1);
              }}
              title="إعادة تعيين كافة الفلاتر"
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">تفريغ</span>
            </button>
          )}

          {/* Page Size Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="hidden lg:inline text-[11px]">عرض:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={999999}>الكل (غير محدود)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar when items selected */}
      {selectedIds.size > 0 && (
        <div className="p-3 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
            <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-mono text-[11px]">
              {selectedIds.size}
            </span>
            <span>عميل تم تحديدهم</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={handleBulkCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>نسخ البيانات</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير Excel للمحدد</span>
            </button>

            <button
              onClick={() => {
                const selectedList = clients.filter((c) => selectedIds.has(c.id));
                if (selectedList.length > 0) {
                  setPrintClient(selectedList[0]);
                  setPrintClientsList(selectedList);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold transition cursor-pointer"
              title="طباعة وتنزيل بطاقات العملاء المحددين كصور"
            >
              <FileImage className="w-3.5 h-3.5 text-blue-600" />
              <span>طباعة وتنزيل صور ({selectedIds.size})</span>
            </button>

            {onBulkDeleteClients && (
              <button
                onClick={() => {
                  if (confirm(`هل أنت متأكد من نقل ${selectedIds.size} عميل إلى سلة المهملات؟`)) {
                    onBulkDeleteClients(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المحدد للسلة</span>
              </button>
            )}

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 select-none">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    title="تحديد كل السجلات في هذه الصفحة"
                    className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                  >
                    {selectedIds.size === currentRecords.length && currentRecords.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                <th
                  onClick={() => handleSort('serialNumber')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition w-14 text-center"
                >
                  <span>م</span>
                  {getSortIcon('serialNumber')}
                </th>

                <th
                  onClick={() => handleSort('fullName')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition min-w-[170px]"
                >
                  <span>الاسم بالكامل</span>
                  {getSortIcon('fullName')}
                </th>

                <th
                  onClick={() => handleSort('phone')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition min-w-[120px]"
                >
                  <span>رقم الموبايل</span>
                  {getSortIcon('phone')}
                </th>

                <th
                  onClick={() => handleSort('nationalId')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition min-w-[130px]"
                >
                  <span>الرقم القومي</span>
                  {getSortIcon('nationalId')}
                </th>

                <th
                  onClick={() => handleSort('city')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition min-w-[100px]"
                >
                  <span>المدينة / المركز</span>
                  {getSortIcon('city')}
                </th>

                <th
                  onClick={() => handleSort('propertiesCount')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition text-center w-24"
                >
                  <span>المنشآت</span>
                  {getSortIcon('propertiesCount')}
                </th>

                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-blue-600 transition min-w-[110px]"
                >
                  <span>تاريخ الإضافة</span>
                  {getSortIcon('createdAt')}
                </th>

                <th className="py-3 px-3 font-bold text-center min-w-[170px]">
                  <span>إجراءات العميل</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-800 dark:text-slate-200">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm text-slate-600 dark:text-slate-300">
                        لا توجد سجلات مطابقة للبحث
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        تأكد من صحة كلمات البحث أو اضغط على زر "إضافة عميل جديد" لبدء تسجيل العملاء
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((client, index) => {
                  const isSelected = selectedIds.has(client.id);
                  const serialDisplay = (currentPage - 1) * pageSize + index + 1;

                  // Tag color dot
                  const tagColors: { [key: string]: string } = {
                    green: 'bg-emerald-500',
                    blue: 'bg-blue-500',
                    red: 'bg-rose-500',
                    yellow: 'bg-amber-500',
                    gray: 'bg-slate-400',
                  };
                  const dotColor = tagColors[client.colorTag || 'blue'] || 'bg-blue-500';

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelectRow(client.id)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Serial Number */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                        {serialDisplay}
                      </td>

                      {/* Full Name with color dot */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                            title={`وسم: ${client.colorTag || 'عادي'}`}
                          />
                          <button
                            onClick={() => onViewClient(client)}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition text-right"
                          >
                            {client.fullName}
                          </button>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300" dir="ltr">
                        {client.phone ? client.phone : <span className="text-slate-400 font-sans text-[11px] italic">غير مسجل</span>}
                      </td>

                      {/* National ID */}
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400" dir="ltr">
                        {client.nationalId}
                      </td>

                      {/* City */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {client.city || <span className="text-slate-400 italic">غير محدد</span>}
                      </td>

                      {/* Properties Count */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {client.propertiesCount ?? 0}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {client.createdAt ? client.createdAt.split('T')[0] : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View/Edit */}
                          <button
                            onClick={() => onEditClient(client)}
                            title="تعديل بيانات العميل"
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Copy Data */}
                          <button
                            onClick={() => onCopyClient(client)}
                            title="نسخ بيانات العميل"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Print / Image Dossier */}
                          <button
                            onClick={() => {
                              setPrintClient(client);
                              setPrintClientsList([client, ...filteredClients.filter((c) => c.id !== client.id)]);
                            }}
                            title="طباعة وتنزيل بطاقة العميل كصورة (PNG)"
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => handleOpenWhatsApp(client)}
                            disabled={!client.phone}
                            title={client.phone ? "مراسلة العميل عبر واتساب" : "لا يوجد رقم موبايل مسجل للعميل"}
                            className={`p-1.5 rounded-lg transition ${
                              client.phone
                                ? "text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                                : "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Delete to Trash */}
                          <button
                            onClick={() => onDeleteClient(client)}
                            title="نقل إلى سلة المهملات"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredClients.length > 0 && totalPages > 1 && (
          <div className="p-3.5 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              عرض الصفحة <strong>{currentPage}</strong> من أصل <strong>{totalPages}</strong> (إجمالي {filteredClients.length} عميل)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable & Image Export Tax Dossier Modal */}
      <ClientPrintModal
        client={printClient}
        clientsList={printClientsList}
        isOpen={Boolean(printClient)}
        onClose={() => {
          setPrintClient(null);
          setPrintClientsList([]);
        }}
      />
    </div>
  );
};
