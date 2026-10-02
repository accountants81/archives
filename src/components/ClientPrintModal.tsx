import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileImage,
  Download,
  Building2,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  Users,
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { Client } from '../types';

interface ClientPrintModalProps {
  client: Client | null;
  clientsList?: Client[];
  isOpen: boolean;
  onClose: () => void;
}

export const ClientPrintModal: React.FC<ClientPrintModalProps> = ({
  client,
  clientsList = [],
  isOpen,
  onClose,
}) => {
  // If a list is provided and has items, use that; otherwise wrap the single client
  const effectiveClients: Client[] = React.useMemo(() => {
    if (clientsList && clientsList.length > 0) {
      return clientsList;
    }
    return client ? [client] : [];
  }, [clientsList, client]);

  // Selected count limit filter inside modal
  const [selectedCountLimit, setSelectedCountLimit] = useState<number>(() => {
    return effectiveClients.length > 0 ? effectiveClients.length : 1;
  });

  // Current client index in preview
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const dossierRef = useRef<HTMLDivElement>(null);

  // Sync if effectiveClients changes
  React.useEffect(() => {
    setCurrentIndex(0);
    setSelectedCountLimit(effectiveClients.length || 1);
  }, [effectiveClients.length]);

  if (!isOpen || effectiveClients.length === 0) return null;

  const currentClient = effectiveClients[Math.min(currentIndex, effectiveClients.length - 1)];

  // Slice clients based on count limit
  const clientsToPrint = effectiveClients.slice(0, selectedCountLimit);

  // 1. Download Current Client Dossier as Image (.PNG)
  const handleDownloadSingleImage = async () => {
    if (!dossierRef.current || !currentClient) return;
    setIsExportingImage(true);
    setExportProgress('جاري تحويل البطاقة إلى صورة عالية الدقة...');

    try {
      // Small pause to ensure font & CSS rendering
      await new Promise((r) => setTimeout(r, 150));

      const dataUrl = await toPng(dossierRef.current, {
        skipFonts: true,
        quality: 0.98,
        backgroundColor: '#ffffff',
        pixelRatio: 2, // High resolution for crisp printing and upload
      });

      const cleanName = (currentClient.fullName || 'عميل').replace(/[\s/\\?%*:|"<>]/g, '_');
      const fileName = `بطاقة_عميل_${cleanName}_${currentClient.nationalId || 'سجل'}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setExportProgress('تم تنزيل ملف الصورة بنجاح! يمكنك الآن رفعه أو مشاركته.');
      setTimeout(() => setExportProgress(null), 3500);
    } catch (err: any) {
      console.error('Image export failed:', err);
      setExportProgress('حدث خطأ أثناء تنزيل الصورة، يرجى المحاولة مرة أخرى.');
      setTimeout(() => setExportProgress(null), 3500);
    } finally {
      setIsExportingImage(false);
    }
  };

  // 2. Download Multiple Clients as Batch Images
  const handleDownloadBatchImages = async () => {
    if (!dossierRef.current) return;
    setIsExportingImage(true);

    try {
      for (let i = 0; i < clientsToPrint.length; i++) {
        setCurrentIndex(i);
        setExportProgress(`جاري تنزيل صورة العميل (${i + 1} من ${clientsToPrint.length})...`);
        // Wait for DOM re-render
        await new Promise((r) => setTimeout(r, 300));

        if (dossierRef.current) {
          const clientData = clientsToPrint[i];
          const dataUrl = await toPng(dossierRef.current, {
            skipFonts: true,
            quality: 0.98,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
          });

          const cleanName = (clientData.fullName || 'عميل').replace(/[\s/\\?%*:|"<>]/g, '_');
          const fileName = `بطاقة_عميل_${i + 1}_${cleanName}.png`;

          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          link.click();
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      setExportProgress(`تم بنجاح تنزيل ${clientsToPrint.length} ملف صورة لكافة العملاء!`);
      setTimeout(() => setExportProgress(null), 4000);
    } catch (err: any) {
      console.error('Batch image export failed:', err);
      setExportProgress('تعذر إكمال التنزيل الدفعي للصور');
      setTimeout(() => setExportProgress(null), 3500);
    } finally {
      setIsExportingImage(false);
    }
  };

  // 3. Regular Print
  const handlePrint = () => {
    window.print();
  };

  const createdDate = currentClient?.createdAt
    ? new Date(currentClient.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'غير محدد';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 dark:border-slate-800">
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <FileImage className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                معاينة وطباعة بطاقة العميل الضريبية
              </h3>
              <p className="text-[10px] text-slate-400">
                يمكنك تحميلها كملف صورة (PNG) للرفع، أو طباعتها ورقياً
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Download as Image Button */}
            <button
              type="button"
              onClick={handleDownloadSingleImage}
              disabled={isExportingImage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-60"
              title="تنزيل بطاقة العميل كصورة PNG قابلة للرفع والمشاركة على واتساب والمواقع"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل كملف صورة (PNG)</span>
            </button>

            {/* Print Document Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isExportingImage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar: Client Count Selection & Navigation */}
        <div className="print:hidden px-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Client Count Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>عدد العملاء المطلوب:</span>
            </span>
            <select
              value={selectedCountLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSelectedCountLimit(val);
                setCurrentIndex(0);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
            >
              <option value={1}>العميل الحالي فقط (1)</option>
              {effectiveClients.length >= 3 && <option value={3}>أول 3 عملاء</option>}
              {effectiveClients.length >= 5 && <option value={5}>أول 5 عملاء</option>}
              {effectiveClients.length >= 10 && <option value={10}>أول 10 عملاء</option>}
              {effectiveClients.length >= 25 && <option value={25}>أول 25 عميل</option>}
              {effectiveClients.length > 1 && (
                <option value={effectiveClients.length}>
                  كافة العملاء المحددين ({effectiveClients.length})
                </option>
              )}
            </select>
          </div>

          {/* If multiple clients selected, show navigation and batch download */}
          {clientsToPrint.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                disabled={currentIndex === 0 || isExportingImage}
                className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                title="العميل السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {currentIndex + 1} من {clientsToPrint.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(clientsToPrint.length - 1, idx + 1))}
                disabled={currentIndex >= clientsToPrint.length - 1 || isExportingImage}
                className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                title="العميل التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadBatchImages}
                disabled={isExportingImage}
                className="mr-2 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>تنزيل الكل كصور ({clientsToPrint.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Status notification banner for Image Export */}
        {exportProgress && (
          <div className="print:hidden px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Printable & Image-Exportable Card Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/50 flex justify-center">
          <div
            ref={dossierRef}
            id="printable-dossier"
            className="w-full max-w-2xl bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-300 font-sans"
            style={{ minHeight: '520px' }}
          >
            {/* Official Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider text-slate-600 block">
                  منظومة أرشيف الضرائب المتكاملة
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  بطاقة قيد وسجل عميل ضريبي
                </h2>
                <span className="text-[11px] text-slate-500 block font-mono">
                  رقم مسلسل الأرشيف: #{String(currentClient.serialNumber || 1).padStart(5, '0')}
                </span>
              </div>

              <div className="text-left space-y-1">
                <div className="inline-block px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-center">
                  <span className="text-[10px] text-slate-400 block">الرقم القومي:</span>
                  <span className="font-mono text-xs font-bold block" dir="ltr">
                    {currentClient.nationalId}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">تاريخ القيد: {createdDate}</span>
              </div>
            </div>

            {/* Client Details Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5 border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">اسم العميل بالكامل:</span>
                  <span className="text-sm font-black text-slate-900">{currentClient.fullName}</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">الرقم القومي (14 رقم):</span>
                  <span className="text-sm font-bold font-mono text-slate-900" dir="ltr">{currentClient.nationalId}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">رقم الموبايل المسجل:</span>
                  <span className="text-sm font-bold font-mono text-slate-900" dir="ltr">
                    {currentClient.phone || 'غير مسجل'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">المدينة / المركز / القرية:</span>
                  <span className="text-sm font-bold text-slate-900">{currentClient.city || 'غير محدد'}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">عدد المنشآت / البيوت:</span>
                  <span className="text-sm font-bold text-slate-900">{currentClient.propertiesCount || 0} منشأة</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">النوع:</span>
                  <span className="text-sm font-bold text-slate-900">{currentClient.gender || 'غير محدد'}</span>
                </div>
              </div>

              {/* Detailed Address */}
              {currentClient.detailedAddress && (
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-white">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    العنوان التفصيلي ومحل الإقامة / المنشأة:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {currentClient.detailedAddress}
                  </p>
                </div>
              )}

              {/* Alternative Phones */}
              {currentClient.alternativePhones && currentClient.alternativePhones.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-white">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    أرقام هواتف بديلة للتواصل:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentClient.alternativePhones.map((ph, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-900"
                        dir="ltr"
                      >
                        {ph}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {currentClient.notes && (
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-amber-50/40">
                  <span className="text-[11px] font-bold text-amber-800 block mb-1">
                    الملاحظات والإجراءات المسجلة:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {currentClient.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Official Verification Stamp & Signature */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block font-medium">اعتماد مأمور الضبط / المشرف:</span>
                <div className="h-8 w-28 border-b border-dashed border-slate-400" />
              </div>

              <div className="w-20 h-20 rounded-full border-2 border-slate-400 border-dashed flex flex-col items-center justify-center text-slate-500 rotate-6 p-1.5 text-center">
                <span className="text-[9px] font-black leading-tight">خاتم الأرشيف</span>
                <span className="text-[8px]">معتمد رسمياً</span>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-500 block font-medium">توقيع المستلم / العميل:</span>
                <div className="h-8 w-28 border-b border-dashed border-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
