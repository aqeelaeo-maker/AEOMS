import React, { useState, useEffect } from 'react';
import { School } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { saveSchool, resetSchoolPasswordToDefault, getSchoolByEmis } from '../../services/storage';
import { School as SchoolIcon, Save, KeyRound, Check, ShieldCheck, MapPin, Phone, User } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface SchoolProfileViewProps {
  school: School;
  onRefresh?: () => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({ school, onRefresh }) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [formData, setFormData] = useState<School>(school);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setFormData(school);
  }, [school]);

  const canEdit = isDyDEO || isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);
  const canReset = isDyDEO || isAEO;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    saveSchool(formData, currentUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onRefresh) onRefresh();
  };

  const handleExecuteResetPassword = async () => {
    if (!currentUser || !canReset) return;
    await resetSchoolPasswordToDefault(school.emisCode, currentUser);
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Module Title Banner */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <SchoolIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{formData.name}</h2>
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-100 text-emerald-900 rounded">
                EMIS: {formData.emisCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-urdu mt-0.5">{formData.nameUrdu}</p>
          </div>
        </div>

        {(isAEO || isDyDEO) && (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            title="Reset School Password to default EMIS code"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>{isUrdu ? 'پاس ورڈ ری سیٹ (ای ایم آئی ایس)' : 'Reset Initial Password'}</span>
          </button>
        )}
      </div>

      {resetSuccess && (
        <div className="m-6 mb-0 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>
            {isUrdu
              ? `سکول کا پاس ورڈ بحال کر دیا گیا۔ اب وہ اپنے EMIS کوڈ (${school.emisCode}) سے لاگ ان کر سکتے ہیں اور فوری نیا پاس ورڈ بنائیں گے۔`
              : `Password successfully reset to default EMIS code (${school.emisCode}). School will be prompted to set a new password upon login.`}
          </span>
        </div>
      )}

      {savedSuccess && (
        <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'سکول پروفائل کامیابی سے محفوظ ہو گیا!' : 'School profile updated successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EMIS Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('emisCode')} (Read-Only)
            </label>
            <input
              type="text"
              readOnly
              value={formData.emisCode}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'سکول کا انگریزی نام' : 'Official School Name'}
            </label>
            <input
              type="text"
              required
              disabled={!canEdit}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Urdu Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 font-urdu">
              سکول کا نام (اردو)
            </label>
            <input
              type="text"
              dir="rtl"
              disabled={!canEdit}
              value={formData.nameUrdu}
              onChange={e => setFormData({ ...formData, nameUrdu: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-urdu disabled:bg-slate-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'انتظامی کیٹیگری' : 'Administrative Category'}
            </label>
            <select
              disabled={!isAEO}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            >
              <option value="Public">Public (Government)</option>
              <option value="Private">Private Registered</option>
              <option value="PEIMA">PEIMA (Public-Private Partnership)</option>
              <option value="PEF">PEF (Punjab Education Foundation)</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'تعلیمی درجہ / لیول' : 'Educational Level'}
            </label>
            <select
              disabled={!canEdit}
              value={formData.level}
              onChange={e => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            >
              <option value="Primary">Primary (Class 1-5)</option>
              <option value="Elementary">Elementary (Class 1-8)</option>
              <option value="High">High (Class 1-10)</option>
              <option value="Higher Secondary">Higher Secondary (Class 1-12)</option>
            </select>
          </div>

          {/* Gender Policy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'صنف داخلہ' : 'Gender Admission'}
            </label>
            <select
              disabled={!canEdit}
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            >
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Co-Education">Co-Education</option>
            </select>
          </div>

          {/* Tehsil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'تحصیل' : 'Tehsil'}
            </label>
            <input
              type="text"
              disabled={!isAEO}
              value={formData.tehsil}
              onChange={e => setFormData({ ...formData, tehsil: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Markaz / Cluster */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'مرکز / کلسٹر' : 'Markaz / Cluster'}
            </label>
            <input
              type="text"
              disabled={!isAEO}
              value={formData.markaz}
              onChange={e => setFormData({ ...formData, markaz: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Union Council */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'یونین کونسل' : 'Union Council'}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.unionCouncil}
              onChange={e => setFormData({ ...formData, unionCouncil: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'مکمل پتہ / محل وقوع' : 'School Physical Location / Address'}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'شفٹ' : 'Operational Shift'}
            </label>
            <select
              disabled={!canEdit}
              value={formData.shift}
              onChange={e => setFormData({ ...formData, shift: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening (Insaf Afternoon / Evening)</option>
              <option value="Double Shift">Double Shift</option>
            </select>
          </div>

          {/* Head Teacher Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'ہیڈ ٹیچر / سربراہ ادارہ کا نام' : 'Head Teacher / Principal Full Name'}
            </label>
            <input
              type="text"
              required
              disabled={!canEdit}
              value={formData.headTeacherName}
              onChange={e => setFormData({ ...formData, headTeacherName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Head Teacher CNIC */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'ہیڈ ٹیچر قومی شناختی کارڈ نمبر' : 'Head Teacher CNIC (13 digits)'}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.headTeacherCnic}
              onChange={e => setFormData({ ...formData, headTeacherCnic: e.target.value })}
              placeholder="37102-XXXXXXX-X"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>

          {/* Head Teacher Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'رابطہ فون نمبر' : 'Official Mobile Number'}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.headTeacherPhone}
              onChange={e => setFormData({ ...formData, headTeacherPhone: e.target.value })}
              placeholder="0300-XXXXXXX"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
            />
          </div>
        </div>

        {canEdit && (
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveChanges')}</span>
            </button>
          </div>
        )}
      </form>

      {/* In-app Password Reset Confirm Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title={isUrdu ? 'پاس ورڈ ری سیٹ کریں' : 'Reset School Password'}
        message={
          isUrdu
            ? `کیا آپ واقعی اس سکول (${school.name}) کا پاس ورڈ ری سیٹ کر کے واپس EMIS کوڈ (${school.emisCode}) پر بحال کرنا چاہتے ہیں؟`
            : `Reset initial password for ${school.name} to default EMIS code (${school.emisCode})? The school head will be forced to set a new password on their next login.`
        }
        confirmText={isUrdu ? 'ری سیٹ کریں' : 'Reset to EMIS'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteResetPassword}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
