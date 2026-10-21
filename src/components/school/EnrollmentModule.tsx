import React, { useState, useEffect } from 'react';
import { School, EnrollmentData, GradeEnrollment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getEnrollment, saveEnrollment } from '../../services/storage';
import { Users, Save, Check, Plus, Trash2, Calculator } from 'lucide-react';

interface EnrollmentModuleProps {
  school: School;
}

export const EnrollmentModule: React.FC<EnrollmentModuleProps> = ({ school }) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [enrollment, setEnrollment] = useState<EnrollmentData>(() => {
    return (
      getEnrollment(school.emisCode) || {
        schoolEmisCode: school.emisCode,
        academicYear: '2026-2027',
        reportingMonth: 'October 2026',
        grades: [],
        totalBoys: 0,
        totalGirls: 0,
        grandTotal: 0,
        minorityStudents: 0,
        cwsnStudents: 0,
        bFormVerifiedCount: 0,
        averageAttendancePercent: 90,
        dropoutCount: 0,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System'
      }
    );
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const data = getEnrollment(school.emisCode);
    if (data) setEnrollment(data);
  }, [school.emisCode]);

  const canEdit = isDyDEO || isAEO || (currentUser?.role === 'school_user' && currentUser.schoolEmisCode === school.emisCode);

  const handleGradeChange = (index: number, field: 'boys' | 'girls', value: number) => {
    const updatedGrades = [...enrollment.grades];
    const val = Math.max(0, Number(value) || 0);
    updatedGrades[index] = {
      ...updatedGrades[index],
      [field]: val,
      total:
        field === 'boys'
          ? val + (updatedGrades[index].girls || 0)
          : (updatedGrades[index].boys || 0) + val
    };

    let totalBoys = 0;
    let totalGirls = 0;
    updatedGrades.forEach(g => {
      totalBoys += g.boys;
      totalGirls += g.girls;
    });

    setEnrollment({
      ...enrollment,
      grades: updatedGrades,
      totalBoys,
      totalGirls,
      grandTotal: totalBoys + totalGirls
    });
  };

  const handleAddGradeRow = () => {
    const nextGradeNumber = enrollment.grades.length + 1;
    const newGrade: GradeEnrollment = {
      grade: `Class ${nextGradeNumber}`,
      boys: 0,
      girls: 0,
      total: 0
    };
    const updatedGrades = [...enrollment.grades, newGrade];
    setEnrollment({ ...enrollment, grades: updatedGrades });
  };

  const handleRemoveGradeRow = (index: number) => {
    const updatedGrades = enrollment.grades.filter((_, i) => i !== index);
    let totalBoys = 0;
    let totalGirls = 0;
    updatedGrades.forEach(g => {
      totalBoys += g.boys;
      totalGirls += g.girls;
    });
    setEnrollment({
      ...enrollment,
      grades: updatedGrades,
      totalBoys,
      totalGirls,
      grandTotal: totalBoys + totalGirls
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    saveEnrollment(enrollment, currentUser);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'کلاس و صنف وار طلباء داخلہ ریکارڈ' : 'Grade- & Gender-Wise Enrollment Register'}
            </h2>
            <p className="text-xs text-slate-500">
              {school.name} (EMIS: {school.emisCode}) · {isUrdu ? 'تعلیمی سیشن 2026-27' : 'Academic Year 2026-2027'}
            </p>
          </div>
        </div>

        {/* Live Total KPI Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-right">
            <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              {isUrdu ? 'کل طلباء و طالبات' : 'Grand Total'}
            </div>
            <div className="text-2xl font-black font-mono text-emerald-800">
              {enrollment.grandTotal}
            </div>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{isUrdu ? 'داخلہ ریکارڈ کامیابی سے محفوظ ہو گیا!' : 'Enrollment data saved and synced successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Grade Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isUrdu ? 'کلاس / جماعت' : 'Grade / Class'}</th>
                <th className="py-3 px-4">{isUrdu ? 'طلباء (لڑکے)' : 'Boys'}</th>
                <th className="py-3 px-4">{isUrdu ? 'طالبات (لڑکیاں)' : 'Girls'}</th>
                <th className="py-3 px-4 font-mono">{isUrdu ? 'کل داخلہ' : 'Class Total'}</th>
                {canEdit && <th className="py-3 px-4 text-right">{isUrdu ? 'حذف' : 'Action'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {enrollment.grades.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                    {row.grade}
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      min="0"
                      disabled={!canEdit}
                      value={row.boys}
                      onChange={e => handleGradeChange(idx, 'boys', Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      min="0"
                      disabled={!canEdit}
                      value={row.girls}
                      onChange={e => handleGradeChange(idx, 'girls', Number(e.target.value))}
                      className="w-24 px-2.5 py-1 text-xs border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {row.total}
                  </td>
                  {canEdit && (
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveGradeRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold font-mono text-slate-900 text-xs">
              <tr>
                <td className="py-3 px-4 font-sans">{isUrdu ? 'میزان کل (مجموعہ):' : 'Sum Total:'}</td>
                <td className="py-3 px-4 text-blue-800">{enrollment.totalBoys}</td>
                <td className="py-3 px-4 text-rose-800">{enrollment.totalGirls}</td>
                <td className="py-3 px-4 text-emerald-900 font-extrabold text-sm">{enrollment.grandTotal}</td>
                {canEdit && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {canEdit && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddGradeRow}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'نئی کلاس شامل کریں' : 'Add Higher Class'}</span>
            </button>
          </div>
        )}

        {/* Supplementary Demographic & Attendance Metrics */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {isUrdu ? 'حاضری اور خصوصی طلباء اعداد و شمار' : 'Attendance & Special Cohort Data'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'نادرا بی فارم تصدیق شدہ' : 'NADRA B-Form Verified'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={enrollment.bFormVerifiedCount}
                onChange={e => setEnrollment({ ...enrollment, bFormVerifiedCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'اقلیتی طلباء' : 'Minority Students'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={enrollment.minorityStudents}
                onChange={e => setEnrollment({ ...enrollment, minorityStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'خصوصی بچے (CWSN)' : 'Special Needs (CWSN)'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!canEdit}
                value={enrollment.cwsnStudents}
                onChange={e => setEnrollment({ ...enrollment, cwsnStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'اوسط ماہانہ حاضری شرح (%)' : 'Avg Attendance Rate (%)'}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                disabled={!canEdit}
                value={enrollment.averageAttendancePercent}
                onChange={e => setEnrollment({ ...enrollment, averageAttendancePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
              />
            </div>
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
