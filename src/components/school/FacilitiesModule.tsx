import React, { useState, useEffect } from 'react';
import { School, BuildingAndFacilitiesData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getFacilities, saveFacilities } from '../../services/storage';
import {
  Building2,
  Save,
  Check,
  AlertTriangle,
  Sun,
  Droplets,
  Zap,
  Shield,
  Monitor,
  Flame,
  Camera
} from 'lucide-react';

interface FacilitiesModuleProps {
  school: School;
}

export const FacilitiesModule: React.FC<FacilitiesModuleProps> = ({ school }) => {
  const { isDyDEO, isAEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [facilities, setFacilities] = useState<BuildingAndFacilitiesData>(() => {
    return getFacilities(school.emisCode);
  });
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setFacilities(getFacilities(school.emisCode));
  }, [school.emisCode]);

  const canEdit = isDyDEO || isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    saveFacilities(facilities, currentUser);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'سکول عمارات، اراضی و بنیادی سہولیات' : 'School Infrastructure & Basic Facilities'}
            </h2>
            <p className="text-xs text-slate-500">
              {school.name} · {facilities.ownership} · {facilities.totalAreaMarlas} Marlas
            </p>
          </div>
        </div>

        {facilities.dangerousClassrooms > 0 && (
          <div className="px-3.5 py-1.5 bg-rose-100 border border-rose-300 text-rose-900 rounded-lg text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>
              {isUrdu ? `${facilities.dangerousClassrooms} کمرے خستہ حال / مخدوش ہیں!` : `${facilities.dangerousClassrooms} Dilapidated Classroom(s) Reported!`}
            </span>
          </div>
        )}
      </div>

      {savedNotice && (
        <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'عمارات و سہولیات کا ریکارڈ محفوظ ہو گیا!' : 'Facilities & infrastructure record updated successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Land & Classrooms */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            01. {isUrdu ? 'اراضی و کمرہ جات جماعت' : 'Land Area & Classroom Availability'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'ملکیت اراضی' : 'Building Ownership'}
              </label>
              <select
                disabled={!canEdit}
                value={facilities.ownership}
                onChange={e => setFacilities({ ...facilities, ownership: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              >
                <option value="Government Owned">Government Owned</option>
                <option value="Rented">Rented</option>
                <option value="Donated">Donated</option>
                <option value="Shelterless">Shelterless (No Building)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'کل رقبہ (مرلے)' : 'Total Land Area (Marlas)'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.totalAreaMarlas}
                onChange={e => setFacilities({ ...facilities, totalAreaMarlas: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'کورڈ ایریا (مربع فٹ)' : 'Covered Area (Sq Ft)'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.coveredAreaSqFt}
                onChange={e => setFacilities({ ...facilities, coveredAreaSqFt: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'کل کمرہ جات' : 'Total Classrooms'}
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={!canEdit}
                value={facilities.totalClassrooms}
                onChange={e => setFacilities({ ...facilities, totalClassrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'زیر استعمال کمرے' : 'Classrooms In-Use'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.classroomsInUse}
                onChange={e => setFacilities({ ...facilities, classroomsInUse: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                {isUrdu ? 'خستہ حال / خطرناک کمرے' : 'Dangerous Classrooms (ALERT)'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.dangerousClassrooms}
                onChange={e => setFacilities({ ...facilities, dangerousClassrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-rose-900 bg-rose-50 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'مرمت طلب کمرے' : 'Needs Repair Classrooms'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.needsRepairClassrooms}
                onChange={e => setFacilities({ ...facilities, needsRepairClassrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'چار دیواری کی حالت' : 'Boundary Wall Condition'}
              </label>
              <select
                disabled={!canEdit}
                value={facilities.boundaryWallStatus}
                onChange={e => setFacilities({ ...facilities, boundaryWallStatus: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              >
                <option value="Satisfactory">Satisfactory (Complete & Safe)</option>
                <option value="Damaged / Partial">Damaged / Partial</option>
                <option value="No Boundary Wall">No Boundary Wall (Security Hazard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Utilities & Water */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            02. {isUrdu ? 'بجلی، صاف پانی و واش رومز' : 'Utilities, Drinking Water & Sanitation'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'پینے کا صاف پانی' : 'Drinking Water Source'}
              </label>
              <select
                disabled={!canEdit}
                value={facilities.drinkingWaterSource}
                onChange={e => setFacilities({ ...facilities, drinkingWaterSource: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              >
                <option value="Filtration Plant">Filtration Plant</option>
                <option value="Electric Pump">Electric Water Pump</option>
                <option value="Hand Pump">Hand Pump</option>
                <option value="Tap Water">Tap Water Supply</option>
                <option value="None">None (Severe Deficiency)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'بجلی کی فراہمی (IESCO)' : 'Electricity Status'}
              </label>
              <select
                disabled={!canEdit}
                value={facilities.electricityStatus}
                onChange={e => setFacilities({ ...facilities, electricityStatus: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              >
                <option value="Connected">Connected & Functional</option>
                <option value="Disconnected">Disconnected</option>
                <option value="No Connection">No Connection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'طلباء کیلئے فعال واش رومز' : 'Functional Student Toilets'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.studentToiletsFunctional}
                onChange={e => setFacilities({ ...facilities, studentToiletsFunctional: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'اساتذہ کیلئے فعال واش رومز' : 'Functional Staff Toilets'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={facilities.staffToiletsFunctional}
                onChange={e => setFacilities({ ...facilities, staffToiletsFunctional: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'سولر سسٹم نصب ہے؟' : 'Solar Power System'}
              </label>
              <select
                disabled={!canEdit}
                value={facilities.solarInstalled ? 'yes' : 'no'}
                onChange={e => setFacilities({ ...facilities, solarInstalled: e.target.value === 'yes' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              >
                <option value="yes">Yes (Installed)</option>
                <option value="no">No</option>
              </select>
            </div>

            {facilities.solarInstalled && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isUrdu ? 'سولر کپیسٹی (kW)' : 'Solar Capacity (Kilowatt)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  disabled={!canEdit}
                  value={facilities.solarCapacityKw}
                  onChange={e => setFacilities({ ...facilities, solarCapacityKw: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Specialized Facilities & Labs */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            03. {isUrdu ? 'لیبارٹریز، کتب خانہ و سیکیورٹی' : 'Laboratories, Library & Safety Checklist'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.computerLab}
                onChange={e => setFacilities({ ...facilities, computerLab: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Computer / IT Lab</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.scienceLab}
                onChange={e => setFacilities({ ...facilities, scienceLab: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Science Lab</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.library}
                onChange={e => setFacilities({ ...facilities, library: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Library Room</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.playground}
                onChange={e => setFacilities({ ...facilities, playground: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Playground</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.mainGate}
                onChange={e => setFacilities({ ...facilities, mainGate: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Iron Main Gate</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={facilities.cctvCameras}
                onChange={e => setFacilities({ ...facilities, cctvCameras: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">CCTV Cameras</span>
            </label>
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
    </div>
  );
};
