import * as XLSX from 'xlsx';
import { Client } from '../types';

export function exportClientsToExcel(clients: Client[], fileName?: string) {
  const rows = clients.map((c, index) => ({
    'مسلسل': index + 1,
    'الاسم بالكامل': c.fullName || '',
    'رقم الموبايل': c.phone || '',
    'الرقم القومي': c.nationalId || '',
    'كلمة السر': c.password || '',
    'المدينة / القرية': c.city || '',
    'العنوان بالتفصيل': c.detailedAddress || '',
    'عدد المنشآت والبيوت': c.propertiesCount || 0,
    'النوع': c.gender || '',
    'أرقام بديلة': Array.isArray(c.alternativePhones) ? c.alternativePhones.join(', ') : '',
    'رابط الإقرار الضريبي': c.declarationLink || '',
    'درجة الأهمية / اللون': getImportanceLabel(c.colorTag),
    'تاريخ الإضافة': c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '',
    'تاريخ آخر تعديل': c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('ar-EG') : '',
    'الملاحظات': c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set RTL direction on worksheet view
  worksheet['!views'] = [{ rightToLeft: true }];

  // Column widths
  worksheet['!cols'] = [
    { wch: 8 },  // مسلسل
    { wch: 28 }, // الاسم
    { wch: 15 }, // هاتف
    { wch: 18 }, // قومي
    { wch: 14 }, // كلمة سر
    { wch: 16 }, // مدينة
    { wch: 30 }, // عنوان
    { wch: 18 }, // منشآت
    { wch: 10 }, // نوع
    { wch: 22 }, // بدائل
    { wch: 25 }, // إقرار
    { wch: 15 }, // أهمية
    { wch: 15 }, // إضافة
    { wch: 15 }, // تعديل
    { wch: 35 }, // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل العملاء');

  const today = new Date().toISOString().split('T')[0];
  const outputName = fileName || `archive-tax-clients-${today}.xlsx`;

  XLSX.writeFile(workbook, outputName);
}

function getImportanceLabel(tag?: string) {
  switch (tag) {
    case 'green': return 'أخضر (هام / ممتاز)';
    case 'blue': return 'أزرق (عادي)';
    case 'red': return 'أحمر (عاجل / متأخر)';
    case 'yellow': return 'أصفر (متابعة)';
    case 'gray': return 'رمادي (غير نشط)';
    default: return 'افتراضي';
  }
}
