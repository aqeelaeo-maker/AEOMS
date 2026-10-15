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
  ShieldCheck,
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
  const { isAEO, isSupervisor, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const schools = getSchools();
  const submissions = getSubmissions();

  // Aggregate stats across cluster
  let totalEnrollment = 0;
  let totalBoys = 0;
  let totalGirls = 0;
  let totalNsbReceived = 0;
  let totalNsbSpent = 0;
  let dangerousRoomsCount = 0;
  let totalVacantPosts = 0;
  let schoolsWithoutSolar = 0;
  let damagedBoundaryWalls = 0;

  schools.forEach(school => {
    const enr = getEnrollment(school.emisCode);
    if (enr) {
      totalEnrollment += enr.grandTotal || 0;
      totalBoys += enr.totalBoys || 0;
      totalGirls += enr.totalGirls || 0;
    }

    const nsb = getNSB(school.emisCode);
    if (nsb) {
      totalNsbReceived += nsb.totalReceived || 0;
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

  // Submission statuses breakdown
  const pendingCount = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const returnedCount = submissions.filter(s => s.status === 'returned').length;
  const draftCount = schools.length - (pendingCount + approvedCount + returnedCount);

  // Filtered schools
  const filteredSchools = schools.filter(s => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emisCode.includes(searchQuery) ||
      s.markaz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    Public: schools.filter(s => s.category === 'Public').length,
    Private: schools.filter(s => s.category === 'Private').length,
    PEIMA: schools.filter(s => s.category === 'PEIMA').length,
    PEF: schools.filter(s => s.category === 'PEF').length
  };

  return (
    <div className="space-y-6">
      {/* Officer Welcome & Authority Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Markaz Pindi Gheb Jurisdiction · Attock District</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isUrdu ? 'مرکزی کلسٹر مانیٹرنگ اور کوائف تصدیق ڈیش بورڈ' : 'Consolidated Cluster Oversight & Verification Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              {isUrdu
                ? 'تمام سرکاری، پرائیویٹ، پیما (PEIMA) اور پیف (PEF) سکولوں کے داخلہ، بجٹ اخراجات، عمارات و عملہ کی آن لائن توثیق۔'
                : 'Centralized administration for Public, Private, PEIMA, and PEF schools with real-time audit of enrollment, NSB funds, infrastructure safety, and quarterly submission approvals.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold font-mono text-emerald-300">{schools.length}</div>
              <div className="text-[11px] text-emerald-100 font-medium">
                {isUrdu ? 'کل سکولز' : 'Total Schools'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold font-mono text-amber-300">{pendingCount}</div>
              <div className="text-[11px] text-amber-100 font-medium">
                {isUrdu ? 'زیرِ توثیق فائلیں' : 'Pending Review'}
              </div>
            </div>
          </div>
        </div>
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

      {/* Verification Pipeline Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUrdu ? 'سہ ماہی کوائف جمع اور توثیقی مراحل (Q1 2026-27)' : 'Quarterly Submission & Verification Pipeline (Q1 2026-27)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'ڈرافٹ سے منظوری تک سکولوں کی پیش رفت' : 'Progress tracker from School Draft to AEO Final Approval'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium">{t('submitted')} / {t('underReview')}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-900 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-amber-700 mt-1">{isUrdu ? 'اے ای او کارروائی کے منتظر' : 'Awaiting AEO Action'}</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-medium">{t('approved')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-900 mt-1">{approvedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-1">{isUrdu ? 'تصدیق شدہ و سند یافتہ' : 'Verified with Certificate'}</div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/80">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-medium">{t('returned')}</span>
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-900 mt-1">{returnedCount}</div>
            <div className="text-[11px] text-rose-700 mt-1">{isUrdu ? 'اعتراضات کے ساتھ واپس' : 'Returned with Objections'}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-xs font-medium">{t('draft')} / Unsubmitted</span>
              <School className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-800 mt-1">{draftCount}</div>
            <div className="text-[11px] text-slate-600 mt-1">{isUrdu ? 'ابھی جمع نہیں کروائے گئے' : 'Not yet submitted'}</div>
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
            {isUrdu ? 'تمام سکولز' : 'All Categories'} ({schools.length})
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
