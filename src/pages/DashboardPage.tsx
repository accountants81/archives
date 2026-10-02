import React from 'react';
import {
  Users,
  UserCheck,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  UserPlus,
  ArrowLeft,
  Copy,
  Eye,
  Edit,
  Clock,
  Printer,
  Sparkles,
  Bot,
  FileSpreadsheet,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { Client } from '../types';
import { exportClientsToExcel } from '../utils/excel';

interface DashboardPageProps {
  clients: Client[];
  onNavigateToClients: (cityFilter?: string) => void;
  onOpenAddClient: () => void;
  onOpenAIChat: () => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onCopyClient: (client: Client) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  clients,
  onNavigateToClients,
  onOpenAddClient,
  onOpenAIChat,
  onViewClient,
  onEditClient,
  onCopyClient,
}) => {
  // Statistics calculations
  const totalClients = clients.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const addedTodayCount = clients.filter((c) => c.createdAt && c.createdAt.startsWith(todayStr)).length;

  const maleCount = clients.filter((c) => c.gender === 'ذكر').length;
  const femaleCount = clients.filter((c) => c.gender === 'أنثى').length;
  const totalProperties = clients.reduce((sum, c) => sum + (c.propertiesCount || 0), 0);

  const malePercent = totalClients > 0 ? Math.round((maleCount / totalClients) * 100) : 0;
  const femalePercent = totalClients > 0 ? Math.round((femaleCount / totalClients) * 100) : 0;

  // Group by City/Village
  const cityCounts: { [city: string]: number } = {};
  clients.forEach((c) => {
    const cityName = (c.city && c.city.trim()) ? c.city.trim() : 'غير محدد';
    cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
  });

  const cityEntries = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

  // Last 5 added clients (sorted by createdAt descending)
  const last5Clients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner (Executive Navy & Sapphire) */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-slate-900 via-blue-900 to-indigo-950 text-white overflow-hidden shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-blue-400/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>المنظومة الرقمية المعتمدة نشطة</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium backdrop-blur-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              لوحة التحكم والمؤشرات الضريبية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              إحصائيات فورية شاملة عن ملفات العملاء والمنشآت المسجلة محلياً في الأرشيف
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenAddClient}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>

            <button
              onClick={onOpenAIChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs border border-white/10 transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-blue-300" />
              <span>المساعد الذكي</span>
            </button>

            <button
              onClick={() => onNavigateToClients()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition cursor-pointer"
            >
              <span>سجل العملاء</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Clients */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              إجمالي عدد العملاء
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {totalClients}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1 inline-block">
              عميل مسجل بالأرشيف
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Added Today */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              المضافين اليوم
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {addedTodayCount}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
              خلال آخر 24 ساعة
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Males & Females Distribution */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="w-full mr-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              النوع (ذكور / إناث)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">{maleCount}</span>
              <span className="text-xs text-slate-400">ذكور</span>
              <span className="text-slate-300">/</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">{femaleCount}</span>
              <span className="text-xs text-slate-400">إناث</span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2 flex">
              <div style={{ width: `${malePercent}%` }} className="bg-blue-600 h-full" title={`ذكور: ${malePercent}%`} />
              <div style={{ width: `${femalePercent}%` }} className="bg-rose-500 h-full" title={`إناث: ${femalePercent}%`} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Properties Count */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              إجمالي المنشآت والبيوت
            </span>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {totalProperties}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
              عقار ومقر تجاري
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: City Breakdown & Last 5 Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City / Village Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  توزيع العملاء بالمدن والمراكز
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">{cityEntries.length} موقع</span>
            </div>

            {cityEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                لا توجد مدن مسجلة حتى الآن
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cityEntries.map(([city, count]) => {
                  const percentage = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
                  return (
                    <div
                      key={city}
                      onClick={() => onNavigateToClients(city)}
                      className="group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                          {city}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{count} عميل</span>
                          <span className="text-[10px] text-slate-400">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            اضغط على أي مدينة لفلترة وعرض سجل عملائها فوراً
          </p>
        </div>

        {/* Last 5 Added Clients Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  آخر العملاء المضافين حديثاً
                </h2>
              </div>

              <button
                onClick={() => onNavigateToClients()}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {last5Clients.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs">
                لا يوجد عملاء مضافين بعد. اضغط على "إضافة عميل جديد" لبدء الأرشفة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">الاسم</th>
                      <th className="py-2.5 px-3 font-bold">الموبايل</th>
                      <th className="py-2.5 px-3 font-bold">المدينة</th>
                      <th className="py-2.5 px-3 font-bold">التاريخ</th>
                      <th className="py-2.5 px-3 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {last5Clients.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          <button
                            onClick={() => onViewClient(c)}
                            className="hover:text-blue-600 transition"
                          >
                            {c.fullName}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300" dir="ltr">
                          {c.phone}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {c.city || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {c.createdAt ? c.createdAt.split('T')[0] : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewClient(c)}
                              title="معاينة"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditClient(c)}
                              title="تعديل"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onCopyClient(c)}
                              title="نسخ"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
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

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">يتم حفظ وتحديث السجلات لحظياً على جهازك</span>
            <button
              onClick={() => exportClientsToExcel(clients)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير تقرير شامل إلى Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
