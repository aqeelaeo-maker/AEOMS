import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getSchools,
  getSubmissions,
  getEnrollment,
  getNSB,
  getFacilities,
  getStaff,
  updateSubmissionStatus
} from '../../services/storage';
import {
  Building2,
  Users,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowUpRight,
  Search,
  Filter,
  School,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SchoolCategory } from '../../types';

interface AeoDashboardProps {
  onSelectSchool: (emisCode: string, targetTab?: string) => void;
  onOpenSubmissionReview: (submissionId: string) => void;
}

export const AeoDashboard: React.FC<AeoDashboardProps> = ({
  onSelectSchool,
  onOpenSubmissionReview
}) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser, allowedSchools } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [markazFilter, setMarkazFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // If AEO, their schools are strictly scoped to their own markaz
  const baseSchools = isAEO && currentUser?.assignedMarkaz
    ? allowedSchools.filter(s => s.markaz && s.markaz.trim().toLowerCase() === currentUser.assignedMarkaz!.trim().toLowerCase())
    : allowedSchools;

  const markazOptions = Array.from(new Set(getSchools().map(s => s.markaz))).filter(Boolean);

  const displaySchools = isDyDEO && markazFilter !== 'all'
    ? baseSchools.filter(s => s.markaz === markazFilter)
    : baseSchools;

  const submissions = getSubmissions();

  // Aggregate stats across jurisdiction
  let totalEnrollment = 0;
  let totalBoys = 0;
  let totalGirls = 0;
  let totalNsbReceived = 0;
  let totalNsbSpent = 0;
  let dangerousRoomsCount = 0;
  let totalVacantPosts = 0;
  let schoolsWithoutSolar = 0;
  let damagedBoundaryWalls = 0;

  displaySchools.forEach(school => {
    const enr = getEnrollment(school.emisCode);
    if (enr) {
      totalEnrollment += enr.grandTotal || 0;
      totalBoys += enr.totalBoys || 0;
      totalGirls += enr.totalGirls || 0;
    }

    const nsb = getNSB(school.emisCode);
    if (nsb) {
      totalNsbReceived += (nsb.totalIncome ?? nsb.totalReceived ?? 0);
      totalNsbSpent += nsb.totalExpenditure || 0;
    }

    const fac = getFacilities(school.emisCode);
    if (fac) {
      dangerousRoomsCount += fac.dangerousClassrooms || 0;
      if (!fac.solarInstalled) schoolsWithoutSolar++;
      if (fac.boundaryWallStatus !== 'Satisfactory') damagedBoundaryWalls++;
    }

    const stf = getStaff(school.emisCode);
    if (stf) {
      totalVacantPosts += (stf.vacantTeaching || 0) + (stf.vacantNonTeaching || 0);
    }
  });

  // Filtered schools
  const filteredSchools = displaySchools.filter(s => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emisCode.includes(searchQuery) ||
      s.markaz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    all: displaySchools.length,
    Public: displaySchools.filter(s => s.category === 'Public').length,
    Private: displaySchools.filter(s => s.category === 'Private').length,
    PEIMA: displaySchools.filter(s => s.category === 'PEIMA').length,
    PEF: displaySchools.filter(s => s.category === 'PEF').length
  };

  return (
    <div className="space-y-6">
      {/* Jurisdiction Status Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-4 sm:p-5 border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
              {isDyDEO
                ? (isUrdu ? 'ڈپٹی ڈی ای او نگرانی مرکز' : 'Deputy DEO Tehsil Supervision')
                : (isUrdu ? `معاون تعلیمی افسر (AEO) · مرکز ${currentUser?.assignedMarkaz || ''}` : `Assistant Education Officer (AEO) · Markaz ${currentUser?.assignedMarkaz || ''}`)}
            </span>
          </div>
          <h2 className="text-lg font-bold mt-1 text-white">
            {isDyDEO
              ? (isUrdu ? 'تحصیل پنڈی گھیب کلسٹر مانیٹرنگ ڈیش بورڈ' : 'Tehsil Pindi Gheb Cluster Monitoring Dashboard')
              : (isUrdu ? `مرکز ${currentUser?.assignedMarkaz || 'پنڈی گھیب'} - سکول ریکارڈ و نگرانی` : `Markaz ${currentUser?.assignedMarkaz || 'Pindi Gheb'} - School Records & Monitoring`)}
          </h2>
          <p className="text-xs text-emerald-200/90 mt-0.5">
            {isAEO
              ? (isUrdu ? `آپ کے مرکز کے کل ${displaySchools.length} سکولز کا مصدقہ ڈیٹا دکھایا جا رہا ہے۔` : `Displaying authenticated data for your ${displaySchools.length} schools in Markaz ${currentUser?.assignedMarkaz || ''}.`)
              : (isUrdu ? `تمام کلسٹرز اور اے ای اوز کے کل ${displaySchools.length} سکولز۔` : `Consolidated oversight of ${displaySchools.length} schools across jurisdiction.`)}
          </p>
        </div>

        {/* For Dy. DEO: Markaz Switcher / Filter */}
        {isDyDEO && (
          <div className="flex items-center gap-2 shrink-0 bg-emerald-950/80 p-2 rounded-lg border border-emerald-700/80">
            <span className="text-xs text-emerald-200 font-semibold">{isUrdu ? 'مرکز منتخب کریں:' : 'Filter Markaz:'}</span>
            <select
              value={markazFilter}
              onChange={e => setMarkazFilter(e.target.value)}
              className="text-xs bg-emerald-900 border border-emerald-700 text-white rounded-md py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="all">{isUrdu ? 'تمام مراکز (All Markazes)' : 'All Markazes (Tehsil Wide)'}</option>
              {markazOptions.map(m => (
                <option key={m} value={m}>Markaz {m}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrollment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isUrdu ? 'کل داخلہ طلباء و طالبات' : 'Total Enrollment'}
            </span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalEnrollment.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-3">
            <span>
              <strong className="text-blue-700">{totalBoys.toLocaleString()}</strong> {isUrdu ? 'طلباء' : 'Boys'}
            </span>
            <span>·</span>
            <span>
              <strong className="text-rose-700">{totalGirls.toLocaleString()}</strong> {isUrdu ? 'طالبات' : 'Girls'}
            </span>
          </div>
        </div>

        {/* NSB Funds Utilization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isUrdu ? 'نان سیلری بجٹ اخراجات' : 'NSB Expenditure'}
            </span>
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            Rs. {totalNsbSpent.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
            <span>
              {isUrdu ? 'موصولہ بجٹ:' : 'Received:'} Rs. {totalNsbReceived.toLocaleString()}
            </span>
            <span className="font-semibold text-emerald-700">
              {totalNsbReceived > 0 ? Math.round((totalNsbSpent / totalNsbReceived) * 100) : 0}% {isUrdu ? 'استعمال' : 'Spent'}
            </span>
          </div>
        </div>

        {/* Vacant Teaching Posts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isUrdu ? 'خالی آسامیاں (اساتذہ و عملہ)' : 'Staff Vacancies'}
            </span>
            <School className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalVacantPosts}
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            {totalVacantPosts > 0
              ? isUrdu ? `${totalVacantPosts} آسامیاں خالی ہیں` : `${totalVacantPosts} vacant posts reported`
              : isUrdu ? 'کوئی آسامی خالی نہیں ہے' : '100% sanctioned posts filled'}
          </div>
        </div>

        {/* Critical Safety Hazards Alert */}
        <div className={`p-5 rounded-xl border shadow-2xs ${dangerousRoomsCount > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              {isUrdu ? 'خستہ حال / خطرناک کمرے' : 'Dilapidated Rooms Alert'}
            </span>
            <AlertTriangle className={`w-5 h-5 ${dangerousRoomsCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900">
            {dangerousRoomsCount}
          </div>
          <div className="mt-2 text-xs text-rose-700 font-medium">
            {dangerousRoomsCount > 0
              ? isUrdu ? 'فوری فیلڈ معائنہ اور مرمت درکار ہے' : 'Urgent engineer inspection required'
              : isUrdu ? 'تمام عمارات محفوظ ہیں' : 'All structures reported safe'}
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isUrdu ? 'تمام سکولز' : 'All Categories'} ({displaySchools.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Public')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'Public'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('publicSchool')} ({categoryCounts.Public})
          </button>
          <button
            onClick={() => setCategoryFilter('Private')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'Private'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('privateSchool')} ({categoryCounts.Private})
          </button>
          <button
            onClick={() => setCategoryFilter('PEIMA')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'PEIMA'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('peimaSchool')} ({categoryCounts.PEIMA})
          </button>
          <button
            onClick={() => setCategoryFilter('PEF')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'PEF'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('pefSchool')} ({categoryCounts.PEF})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Schools Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isUrdu ? 'کلسٹر سکولز تفصیلی فہرست و ریکارڈ' : 'Schools In Jurisdiction (Click to Inspect Records)'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredSchools.length} {isUrdu ? 'سکولز' : 'records found'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('emisCode')}</th>
                <th className="py-3 px-4">{isUrdu ? 'سکول کا نام' : 'School Name'}</th>
                <th className="py-3 px-4">{isUrdu ? 'کیٹیگری و لیول' : 'Category & Level'}</th>
                <th className="py-3 px-4">{isUrdu ? 'مرکز / کلسٹر' : 'Markaz'}</th>
                <th className="py-3 px-4">{isUrdu ? 'داخلہ طلباء' : 'Enrollment'}</th>
                <th className="py-3 px-4">{isUrdu ? 'نان سیلری بجٹ' : 'NSB Spent'}</th>
                <th className="py-3 px-4">{isUrdu ? 'حالت عمارات' : 'Infrastructure'}</th>
                <th className="py-3 px-4">{isUrdu ? 'توثیقی حیثیت' : 'Submission Status'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map(school => {
                const enr = getEnrollment(school.emisCode);
                const nsb = getNSB(school.emisCode);
                const fac = getFacilities(school.emisCode);
                const sub = submissions.find(s => s.schoolEmisCode === school.emisCode);

                const statusColor =
                  sub?.status === 'approved'
                    ? 'text-emerald-700 font-semibold'
                    : sub?.status === 'submitted' || sub?.status === 'under_review'
                    ? 'text-amber-700 font-semibold'
                    : sub?.status === 'returned'
                    ? 'text-rose-700 font-semibold'
                    : 'text-slate-500';

                return (
                  <tr
                    key={school.emisCode}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectSchool(school.emisCode, 'profile')}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {school.emisCode}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-800">
                        {school.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-urdu">{school.nameUrdu}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span className="font-medium">{school.category}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{school.level}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{school.gender}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{school.markaz}</div>
                      <div className="text-[10px] text-slate-400">{school.unionCouncil}</div>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums">
                      <span className="font-bold text-slate-900">{enr ? enr.grandTotal : 0}</span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        ({enr?.totalBoys || 0}B / {enr?.totalGirls || 0}G)
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      Rs. {nsb ? nsb.totalExpenditure.toLocaleString() : 0}
                    </td>

                    <td className="py-3 px-4">
                      {fac?.dangerousClassrooms && fac.dangerousClassrooms > 0 ? (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {fac.dangerousClassrooms} Dangerous Room
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          {fac ? `${fac.totalClassrooms} Rooms · ${fac.drinkingWaterSource}` : 'Standard'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className={`text-xs ${statusColor}`}>
                        {sub?.status === 'approved' && `✓ ${t('approved')}`}
                        {(sub?.status === 'submitted' || sub?.status === 'under_review') && `⏳ ${t('underReview')}`}
                        {sub?.status === 'returned' && `↩ ${t('returned')}`}
                        {!sub?.status && '— Draft'}
                      </div>
                      {sub?.approvalCertificateNumber && (
                        <div className="text-[10px] font-mono text-emerald-800">
                          {sub.approvalCertificateNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSchool(school.emisCode, 'submission');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>{isUrdu ? 'کوائف دیکھیں' : 'Inspect'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
