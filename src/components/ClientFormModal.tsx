import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, Eye, EyeOff, Save, ShieldAlert, Phone, User, CreditCard, Building2, MapPin, FileText, Link, Palette } from 'lucide-react';
import { Client, ColorTag, Gender } from '../types';
import { sanitizeString } from '../utils/security';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>, id?: string) => void;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const isEditing = !!clientToEdit;

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional fields
  const [city, setCity] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [propertiesCount, setPropertiesCount] = useState<number | ''>(1);
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [alternativePhones, setAlternativePhones] = useState<string[]>([]);
  const [declarationLink, setDeclarationLink] = useState('');
  const [colorTag, setColorTag] = useState<ColorTag>('blue');

  // Error validation states
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    nationalId?: string;
    password?: string;
  }>({});

  // Populate form if editing
  useEffect(() => {
    if (clientToEdit) {
      setFullName(clientToEdit.fullName || '');
      setPhone(clientToEdit.phone || '');
      setNationalId(clientToEdit.nationalId || '');
      setPassword(clientToEdit.password || '');
      setCity(clientToEdit.city || '');
      setDetailedAddress(clientToEdit.detailedAddress || '');
      setPropertiesCount(clientToEdit.propertiesCount ?? 1);
      setNotes(clientToEdit.notes || '');
      setGender(clientToEdit.gender || '');
      setAlternativePhones(clientToEdit.alternativePhones ? [...clientToEdit.alternativePhones] : []);
      setDeclarationLink(clientToEdit.declarationLink || '');
      setColorTag(clientToEdit.colorTag || 'blue');
    } else {
      // Reset
      setFullName('');
      setPhone('');
      setNationalId('');
      setPassword('');
      setCity('');
      setDetailedAddress('');
      setPropertiesCount(1);
      setNotes('');
      setGender('ذكر');
      setAlternativePhones([]);
      setDeclarationLink('');
      setColorTag('blue');
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  // Validation
  const validate = () => {
    const errs: typeof errors = {};

    // Full name check
    if (!fullName.trim()) {
      errs.fullName = 'الاسم بالكامل حقل إجباري مطلوب';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'يرجى كتابة الاسم بالكامل بشكل صحيح (3 أحرف على الأقل)';
    }

    // Phone check: optional, but if entered must be 11 digits starting with 010, 011, 012, or 015
    const cleanPhone = phone.trim();
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      errs.phone = 'رقم الموبايل غير صحيح (يجب أن يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015)';
    }

    // National ID: exactly 14 digits
    const cleanNationalId = nationalId.trim();
    const nationalIdRegex = /^[0-9]{14}$/;
    if (!cleanNationalId) {
      errs.nationalId = 'الرقم القومي حقل إجباري مطلوب';
    } else if (!nationalIdRegex.test(cleanNationalId)) {
      errs.nationalId = 'الرقم القومي غير صحيح (يجب أن يتكون من 14 رقماً بالضبط)';
    }

    // Note: Password is NOT mandatory. If empty, a gentle notice is displayed in UI but validation passes.

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        fullName: sanitizeString(fullName),
        phone: sanitizeString(phone),
        nationalId: sanitizeString(nationalId),
        password: password.trim(),
        city: sanitizeString(city),
        detailedAddress: sanitizeString(detailedAddress),
        propertiesCount: typeof propertiesCount === 'number' && isFinite(propertiesCount) ? Math.max(0, propertiesCount) : 0,
        notes: sanitizeString(notes),
        gender: gender || undefined,
        alternativePhones: alternativePhones.map(sanitizeString).filter((p) => p.length > 0),
        declarationLink: sanitizeString(declarationLink),
        colorTag,
      },
      clientToEdit?.id
    );
  };

  const handleAddAltPhone = () => {
    setAlternativePhones([...alternativePhones, '']);
  };

  const handleUpdateAltPhone = (index: number, val: string) => {
    const updated = [...alternativePhones];
    updated[index] = val;
    setAlternativePhones(updated);
  };

  const handleRemoveAltPhone = (index: number) => {
    setAlternativePhones(alternativePhones.filter((_, i) => i !== index));
  };

  const colorOptions: { tag: ColorTag; label: string; bg: string; border: string }[] = [
    { tag: 'green', label: 'أخضر (ممتاز / هام)', bg: 'bg-emerald-500', border: 'border-emerald-600' },
    { tag: 'blue', label: 'أزرق (عادي)', bg: 'bg-blue-500', border: 'border-blue-600' },
    { tag: 'red', label: 'أحمر (عاجل / متأخر)', bg: 'bg-rose-500', border: 'border-rose-600' },
    { tag: 'yellow', label: 'أصفر (متابعة)', bg: 'bg-amber-500', border: 'border-amber-600' },
    { tag: 'gray', label: 'رمادي (غير نشط)', bg: 'bg-slate-400', border: 'border-slate-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد للأرشيف'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'قم بتحديث بيانات العميل ثم اضغط حفظ' : 'يرجى استيفاء الحقول الإجبارية والاختيارية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Required Fields */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                البيانات الإجبارية (مطلوبة)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="مثال: أحمد محمود إبراهيم"
                    className={`w-full pr-3.5 pl-3 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition ${
                      errors.fullName
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Mobile Phone (Optional with Attention Notice) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم الموبايل <span className="text-slate-400 font-normal text-[11px]">(اختياري - ليس إلزامي)</span>
                  </label>
                  {!phone.trim() && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      غير محدد
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="01012345678 (اختياري)"
                    dir="ltr"
                    maxLength={11}
                    className={`w-full pr-3 pl-3 py-2.5 rounded-xl border text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition text-right ${
                      errors.phone
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                ) : !phone.trim() ? (
                  <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/60">
                    <span>⚠️</span>
                    <span><strong>انتباه:</strong> لم تقم بكتابة رقم موبايل. يمكنك حفظ العميل بدونه أو إضافته لاحقاً.</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ رقم الموبايل صالح (11 رقماً)
                  </p>
                )}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم القومي <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value.replace(/\D/g, ''));
                      if (errors.nationalId) setErrors({ ...errors, nationalId: undefined });
                    }}
                    placeholder="29001011234567"
                    dir="ltr"
                    maxLength={14}
                    className={`w-full pr-3 pl-3 py-2.5 rounded-xl border text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 transition text-right ${
                      errors.nationalId
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {errors.nationalId ? (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errors.nationalId}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-400">14 رقماً بالضبط</p>
                )}
              </div>

              {/* Password (Optional with Attention Notice) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    كلمة السر لحساب العميل <span className="text-slate-400 font-normal text-[11px]">(اختيارية - ليست إلزامية)</span>
                  </label>
                  {!password && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      غير محددة
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="يمكنك تركها فارغة أو كتابة كلمة سر لحساب العميل"
                    dir="ltr"
                    className="w-full pr-3.5 pl-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {!password.trim() ? (
                  <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/60">
                    <span>⚠️</span>
                    <span><strong>انتباه:</strong> لم تقم بكتابة كلمة سر لهذا العميل. يمكنك حفظ العميل بدونها، أو كتابتها في أي وقت.</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ تم تحديد كلمة سر للعميل
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            {/* Section 2: Optional Fields */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                البيانات الاختيارية
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City / Village */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المدينة / القرية
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: بركة السبع، ميت غمر، طنطا..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Number of Properties */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عدد المنشآت / البيوت
                </label>
                <input
                  type="number"
                  min="0"
                  value={propertiesCount}
                  onChange={(e) => setPropertiesCount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  النوع
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">غير محدد</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              {/* Color Tag / Importance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تحديد لون العميل (درجة الأهمية)
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.tag}
                      type="button"
                      onClick={() => setColorTag(opt.tag)}
                      title={opt.label}
                      className={`w-7 h-7 rounded-full ${opt.bg} transition-transform ${
                        colorTag === opt.tag ? 'ring-4 ring-blue-600/40 scale-110 shadow' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-medium text-slate-500 mr-2">
                    {colorOptions.find((c) => c.tag === colorTag)?.label}
                  </span>
                </div>
              </div>

              {/* Detailed Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  العنوان بالتفصيل (مكان السكن أو المنشأة)
                </label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="الشارع، رقم العقار، الدور أو العلامة المميزة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Tax Declaration Link */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الإقرار الضريبي أو المستند
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={declarationLink}
                    onChange={(e) => setDeclarationLink(e.target.value)}
                    placeholder="https://tax-portal.gov.eg/dec/..."
                    dir="ltr"
                    className="w-full pr-3.5 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 text-left"
                  />
                </div>
              </div>

              {/* Alternative Phones */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    أرقام تليفون بديلة (إضافية)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAltPhone}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة رقم آخر</span>
                  </button>
                </div>

                {alternativePhones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">لا توجد أرقام بديلة مضافة</p>
                ) : (
                  <div className="space-y-2">
                    {alternativePhones.map((alt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={alt}
                          onChange={(e) => handleUpdateAltPhone(idx, e.target.value)}
                          placeholder="رقم هاتف بديل"
                          dir="ltr"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-right"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAltPhone(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                          title="حذف هذا الرقم"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الملحوظة (ملاحظات خاصة عن العميل أو الملف الضريبي)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب هنا أي تفاصيل تخص الملف، أرقام السجلات، التراخيص، أو مواعيد المأموريات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'حفظ وإضافة العميل'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
