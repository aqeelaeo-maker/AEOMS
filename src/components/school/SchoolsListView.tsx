import React, { useState, useEffect } from 'react';
import { School, SchoolCategory, SchoolLevel, GenderPolicy, SubmissionRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getSchools,
  getSchoolsForUser,
  saveSchool,
  deleteSchool,
  resetSchoolPasswordToDefault,
  getEnrollment,
  getNSB,
  getFTF,
  getFacilities,
  getStaff,
  getSubmissions
} from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';
import { SubmissionReviewModal } from './SubmissionReviewModal';
import { SchoolQuickSubmitModal } from './SchoolQuickSubmitModal';
import {
  School as SchoolIcon,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check,
  Eye,
  ChevronRight,
  X,
  Building,
  Layers,
  FileSpreadsheet,
  LayoutGrid,
  SendHorizontal,
  Award,
  Coins,
  Users,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SchoolsListViewProps {
  onInspectSchool: (emisCode: string, targetTab?: string) => void;
  onOpenPrintDossier?: (emisCode: string) => void;
}

export const SchoolsListView: React.FC<SchoolsListViewProps> = ({
  onInspectSchool,
  onOpenPrintDossier
}) => {
  const { isDyDEO, isAEO, isSupervisor, isSchoolUser, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [schools, setSchools] = useState<School[]>(() => getSchoolsForUser(currentUser));
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => getSubmissions());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [markazFilter, setMarkazFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'standard' | 'data_ledger'>('standard');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Review & Submit Modals
  const [reviewSchool, setReviewSchool] = useState<School | null>(null);
  const [submitModalSchool, setSubmitModalSchool] = useState<School | null>(null);

  // In-app Confirmation Modals (Replaces window.confirm for reliable iframe operation)
  const [deleteTarget, setDeleteTarget] = useState<{ emis: string; name: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<{ emis: string; name: string } | null>(null);

  // Modal State for Add / Edit School
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState<School>({
    emisCode: '',
    name: '',
    nameUrdu: '',
    category: 'Public',
    level: 'Primary',
    gender: 'Boys',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: currentUser?.assignedMarkaz || 'Pindi Gheb City',
    unionCouncil: '',
    address: '',
    addressUrdu: '',
    headTeacherName: '',
    headTeacherCnic: '',
    headTeacherPhone: '',
    shift: 'Morning',
    establishmentYear: '2000',
    status: 'active'
  });

  const refreshData = () => {
    setSchools(getSchoolsForUser(currentUser));
    setSubmissions(getSubmissions());
  };

  useEffect(() => {
    refreshData();

    const handleSchoolsUpdate = () => refreshData();
    const handleSubmissionsUpdate = () => refreshData();

    window.addEventListener('schools_updated', handleSchoolsUpdate);
    window.addEventListener('submissions_updated', handleSubmissionsUpdate);

    return () => {
      window.removeEventListener('schools_updated', handleSchoolsUpdate);
      window.removeEventListener('submissions_updated', handleSubmissionsUpdate);
    };
  }, [currentUser]);

  // Extract all Markazes dynamically from existing schools
  const allMasterSchools = getSchools();
  const markazOptions = Array.from(new Set(allMasterSchools.map(s => s.markaz))).filter(Boolean);

  // For AEO, base list is locked to their assignedMarkaz
  const baseSchools = isAEO && currentUser?.assignedMarkaz
    ? schools.filter(s => s.markaz && s.markaz.trim().toLowerCase() === currentUser.assignedMarkaz!.trim().toLowerCase())
    : schools;

  // For Dy. DEO (and supervisor), filter by selected Markaz Name
  const markazScopedSchools = (isDyDEO || isSupervisor) && markazFilter !== 'all'
    ? baseSchools.filter(s => s.markaz === markazFilter)
    : baseSchools;

  // Filter by category and search
  const filteredSchools = markazScopedSchools.filter(s => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emisCode.includes(searchQuery) ||
      s.markaz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.headTeacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate aggregated Markaz stats for the selected scope
  const markazStats = React.useMemo(() => {
    let totalEnr = 0;
    let boys = 0;
    let girls = 0;
    let nsbIncome = 0;
    let nsbSpent = 0;
    let submittedCount = 0;
    let approvedCount = 0;
    let returnedCount = 0;

    markazScopedSchools.forEach(s => {
      const enr = getEnrollment(s.emisCode);
      if (enr) {
        totalEnr += enr.grandTotal || 0;
        boys += enr.totalBoys || 0;
        girls += enr.totalGirls || 0;
      }
      const nsb = getNSB(s.emisCode);
      if (nsb) {
        nsbIncome += nsb.totalIncome || nsb.totalReceived || 0;
        nsbSpent += nsb.totalExpenditure || 0;
      }
      const sub = submissions.find(x => x.schoolEmisCode === s.emisCode);
      if (sub?.status === 'approved') approvedCount++;
      else if (sub?.status === 'submitted' || sub?.status === 'under_review') submittedCount++;
      else if (sub?.status === 'returned') returnedCount++;
    });

    return {
      totalSchools: markazScopedSchools.length,
      totalEnr,
      boys,
      girls,
      nsbIncome,
      nsbSpent,
      nsbBalance: nsbIncome - nsbSpent,
      submittedCount,
      approvedCount,
      returnedCount,
      draftCount: Math.max(0, markazScopedSchools.length - (submittedCount + approvedCount + returnedCount))
    };
  }, [markazScopedSchools, submissions]);

  const canManageSchool = isAEO || isDyDEO;

  const handleOpenAdd = () => {
    setIsEditing(false);
    setModalError(null);
    setModalForm({
      emisCode: '',
      name: '',
      nameUrdu: '',
      category: 'Public',
      level: 'Primary',
      gender: 'Boys',
      district: 'Attock',
      tehsil: 'Pindi Gheb',
      markaz: currentUser?.assignedMarkaz || (markazFilter !== 'all' ? markazFilter : 'Pindi Gheb City'),
      unionCouncil: '',
      address: '',
      addressUrdu: '',
      headTeacherName: '',
      headTeacherCnic: '',
      headTeacherPhone: '',
      shift: 'Morning',
      establishmentYear: new Date().getFullYear().toString(),
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setIsEditing(true);
    setModalError(null);
    setModalForm({ ...school });
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || !currentUser || !canManageSchool) return;
    deleteSchool(deleteTarget.emis, currentUser);
    refreshData();
    setStatusNotice(isUrdu ? `سکول "${deleteTarget.name}" کو حذف کر دیا گیا۔` : `School "${deleteTarget.name}" was deleted successfully.`);
    setDeleteTarget(null);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleConfirmReset = async () => {
    if (!resetTarget || !currentUser || !canManageSchool) return;
    await resetSchoolPasswordToDefault(resetTarget.emis, currentUser);
    setStatusNotice(
      isUrdu
        ? `پاس ورڈ ری سیٹ ہو گیا۔ ابتدائی پاس ورڈ اب ${resetTarget.emis} ہے۔`
        : `Password reset successfully. Initial temporary password is now ${resetTarget.emis}.`
    );
    setResetTarget(null);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setModalError(null);

    const trimmedEmis = modalForm.emisCode.trim();
    if (!trimmedEmis) {
      setModalError(isUrdu ? 'براہ کرم ای ایم آئی ایس کوڈ درج کریں۔' : 'EMIS code is required');
      return;
    }

    if (!isEditing) {
      const allExisting = getSchools();
      if (allExisting.some(s => s.emisCode === trimmedEmis)) {
        setModalError(isUrdu ? 'یہ ای ایم آئی ایس کوڈ پہلے سے موجود ہے!' : `EMIS code "${trimmedEmis}" already exists in records!`);
        return;
      }
    }

    if (!modalForm.name.trim()) {
      setModalError(isUrdu ? 'سکول کا نام درکار ہے۔' : 'School name is required');
      return;
    }

    const toSave: School = {
      ...modalForm,
      emisCode: trimmedEmis,
      name: modalForm.name.trim(),
      markaz: isAEO && currentUser.assignedMarkaz ? currentUser.assignedMarkaz : modalForm.markaz
    };

    saveSchool(toSave, currentUser);
    refreshData();
    setModalOpen(false);
    setModalError(null);
    setStatusNotice(
      isEditing
        ? (isUrdu ? `سکول "${toSave.name}" کی معلومات اپ ڈیٹ ہو گئیں!` : `School "${toSave.name}" updated successfully!`)
        : (isUrdu ? `نیا سکول "${toSave.name}" شامل کر دیا گیا۔` : `New school "${toSave.name}" registered successfully!`)
    );
    setTimeout(() => setStatusNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Authority Banner & Markaz Jurisdiction Header */}
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-900 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs border border-emerald-700">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {isDyDEO
                    ? (isUrdu ? 'ڈپٹی ڈی ای او نگرانی · تحصیل پنڈی گھیب' : 'Deputy DEO Supervision · Tehsil Pindi Gheb')
                    : isAEO
                    ? (isUrdu ? `معاون تعلیمی افسر (AEO) · مرکز ${currentUser?.assignedMarkaz || ''}` : `Assistant Education Officer (AEO) · Markaz ${currentUser?.assignedMarkaz || ''}`)
                    : (isUrdu ? 'سکول انتظامی پورٹل' : 'School Administrative Portal')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {isDyDEO
                  ? (isUrdu ? 'سکولز ریکارڈز و ڈیٹا نگران ڈائرکٹری (تمام مراکز)' : 'Schools Data Directory & Submission Management')
                  : isAEO
                  ? (isUrdu ? `مرکز ${currentUser?.assignedMarkaz || 'پنڈی گھیب'} کے تمام سکولز کا ڈیٹا` : `All Schools Data · Markaz ${currentUser?.assignedMarkaz || ''}`)
                  : (isUrdu ? 'سکولز ریکارڈ' : 'Schools Information')}
              </h2>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {isDyDEO
                  ? (isUrdu ? 'مرکز منتخب کر کے متعلقہ سکولز کا مصدقہ داخلہ، این ایس بی اخراجات اور جمع شدہ ڈیٹا دیکھیں' : 'Select any Markaz name to inspect schools, verify quarterly submissions, and review financial balances.')
                  : isAEO
                  ? (isUrdu ? `آپ کے مرکز کے تمام ${schools.length} سکولز کا مصدقہ ڈیٹا اور جمع کروائی گئی فائلز` : `Authenticated records of all ${schools.length} schools in your Markaz jurisdiction.`)
                  : (isUrdu ? 'آپ کے سکول کے کوائف' : 'School Profile & Records')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-emerald-900/90 rounded-lg p-1 border border-emerald-700">
              <button
                type="button"
                onClick={() => setViewMode('standard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'standard' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ڈائرکٹری ویو' : 'Directory View'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('data_ledger')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'data_ledger' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'تمام سکولز ڈیٹا شیٹ' : 'All Schools Data Ledger'}</span>
              </button>
            </div>

            {canManageSchool && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>{isUrdu ? 'نیا سکول شامل کریں' : 'Add New School'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Deputy DEO: Markaz Selector Bar */}
        {(isDyDEO || isSupervisor) && (
          <div className="mt-5 pt-4 border-t border-emerald-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'مرکز منتخب کریں:' : 'Select Markaz:'}</span>
              </span>

              {/* All Markazes Pill */}
              <button
                type="button"
                onClick={() => setMarkazFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  markazFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                }`}
              >
                {isUrdu ? 'تمام مراکز' : 'All Markazes'} ({allMasterSchools.length})
              </button>

              {/* Individual Markaz Pills */}
              {markazOptions.map(m => {
                const count = allMasterSchools.filter(s => s.markaz === m).length;
                const isSelected = markazFilter === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarkazFilter(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm ring-1 ring-amber-300'
                        : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                    }`}
                  >
                    Markaz {m} ({count})
                  </button>
                );
              })}
            </div>

            {/* Quick dropdown fallback */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={markazFilter}
                onChange={e => setMarkazFilter(e.target.value)}
                className="text-xs bg-emerald-900 border border-emerald-700 text-white rounded-lg py-1 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="all">All Markazes (Consolidated Tehsil)</option>
                {markazOptions.map(m => (
                  <option key={m} value={m}>Markaz {m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* For AEO: Show their fixed Markaz banner */}
        {isAEO && (
          <div className="mt-4 pt-3 border-t border-emerald-900/80 flex items-center justify-between text-xs">
            <span className="text-emerald-200">
              Jurisdiction: <strong>Markaz {currentUser?.assignedMarkaz}</strong> ({schools.length} Schools Registered)
            </span>
            <span className="text-amber-300 font-medium">
              AEO Office Verified Portal · Pindi Gheb
            </span>
          </div>
        )}
      </div>

      {/* 3. Markaz Summary KPI Banner (Live Aggregation for the Selected Markaz) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
        {/* Total Schools */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              {markazFilter === 'all' ? 'Tehsil Schools' : `Markaz Schools`}
            </span>
            <Building className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {markazStats.totalSchools}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {markazFilter === 'all' ? 'All Markazes' : `Markaz ${markazFilter}`}
          </div>
        </div>

        {/* Enrollment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Total Enrollment</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {markazStats.totalEnr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            <strong className="text-blue-700">{markazStats.boys}</strong> Boys · <strong className="text-rose-700">{markazStats.girls}</strong> Girls
          </div>
        </div>

        {/* NSB Budget Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider">NSB Net Balance</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800">
            Rs. {markazStats.nsbBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Spent: Rs. {markazStats.nsbSpent.toLocaleString()}
          </div>
        </div>

        {/* Submission Verification Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider">Dossier Submissions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {markazStats.approvedCount + markazStats.submittedCount} / {markazStats.totalSchools}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-emerald-700 font-semibold">{markazStats.approvedCount} Approved</span>
            <span>·</span>
            <span className="text-amber-700 font-semibold">{markazStats.submittedCount} Submitted</span>
            {markazStats.returnedCount > 0 && (
              <>
                <span>·</span>
                <span className="text-rose-700 font-semibold">{markazStats.returnedCount} Returned</span>
              </>
            )}
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 4. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {['all', 'Public', 'Private', 'PEIMA', 'PEF'].map(cat => {
            const count = markazScopedSchools.filter(s => cat === 'all' || s.category === cat).length;
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isSelected ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'سکول نام، EMIS یا ہیڈ ٹیچر سے تلاش کریں...' : 'Search by EMIS, name, or head...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          />
        </div>
      </div>

      {/* 5. Main View: Standard Directory Table OR All Schools Data Ledger */}
      {viewMode === 'standard' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('emisCode')}</th>
                  <th className="py-3 px-4">{isUrdu ? 'سکول کا نام' : 'School Name'}</th>
                  <th className="py-3 px-4">{isUrdu ? 'کیٹیگری و درجہ' : 'Category & Level'}</th>
                  <th className="py-3 px-4">{isUrdu ? 'مرکز و مقام' : 'Markaz'}</th>
                  <th className="py-3 px-4">{isUrdu ? 'ہیڈ ٹیچر' : 'Head Teacher'}</th>
                  <th className="py-3 px-4">{isUrdu ? 'داخلہ و این ایس بی' : 'Enrollment & NSB'}</th>
                  <th className="py-3 px-4">{isUrdu ? 'توثیقی حیثیت' : 'Submission Status'}</th>
                  <th className="py-3 px-4 text-right">{isUrdu ? 'کارروائی' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {isUrdu ? 'کوئی سکول نہیں ملا۔' : 'No schools found matching your search or Markaz filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map(school => {
                    const enr = getEnrollment(school.emisCode);
                    const nsb = getNSB(school.emisCode);
                    const sub = submissions.find(s => s.schoolEmisCode === school.emisCode);

                    return (
                      <tr key={school.emisCode} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                          {school.emisCode}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{school.name}</div>
                          {school.nameUrdu && (
                            <div className="text-[11px] text-slate-500 font-urdu">{school.nameUrdu}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{school.category}</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-600">{school.level}</span>
                          <div className="text-[10px] text-slate-400">{school.gender}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <div className="font-medium">{school.markaz}</div>
                          <div className="text-[10px] text-slate-400">{school.unionCouncil}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <div className="font-medium text-slate-900">{school.headTeacherName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{school.headTeacherPhone}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div>
                            <strong className="text-slate-900">{enr ? enr.grandTotal : 0}</strong>{' '}
                            <span className="text-[10px] text-slate-500 font-sans">students</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            NSB Bal: Rs. {nsb ? nsb.currentBalance.toLocaleString() : 0}
                          </div>
                        </td>

                        {/* Submission Status Badge with Review Action */}
                        <td className="py-3 px-4">
                          {sub?.status === 'approved' && (
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded inline-flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Approved
                              </span>
                              {sub.approvalCertificateNumber && (
                                <span className="block text-[9px] font-mono text-emerald-700 mt-0.5 truncate max-w-[130px]">
                                  {sub.approvalCertificateNumber}
                                </span>
                              )}
                            </div>
                          )}
                          {(sub?.status === 'submitted' || sub?.status === 'under_review') && (
                            <div>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded inline-flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Submitted
                              </span>
                              <span className="block text-[10px] text-amber-800 mt-0.5 truncate max-w-[130px]">
                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Awaiting Review'}
                              </span>
                            </div>
                          )}
                          {sub?.status === 'returned' && (
                            <div>
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-semibold rounded inline-flex items-center gap-1 text-[11px]">
                                <RotateCcw className="w-3 h-3 text-rose-600" />
                                Returned
                              </span>
                              <span className="block text-[10px] text-rose-700 mt-0.5 truncate max-w-[130px]">
                                Action required
                              </span>
                            </div>
                          )}
                          {!sub?.status && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* For School Users: Direct Submit Button */}
                            {isSchoolUser && currentUser?.schoolEmisCode === school.emisCode && (
                              <button
                                type="button"
                                onClick={() => setSubmitModalSchool(school)}
                                className="px-2.5 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-xs inline-flex items-center gap-1 transition-colors"
                              >
                                <SendHorizontal className="w-3.5 h-3.5" />
                                <span>Submit Data</span>
                              </button>
                            )}

                            {/* For AEO and Dy. DEO: Review Submission Dossier Button */}
                            {(isDyDEO || isAEO || isSupervisor) && (
                              <button
                                type="button"
                                onClick={() => setReviewSchool(school)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1 ${
                                  sub?.status === 'submitted'
                                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500 font-bold shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                }`}
                                title="Review complete submitted dossier"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{sub?.status === 'submitted' ? 'Review & Verify' : 'Dossier'}</span>
                              </button>
                            )}

                            {/* Inspect School Modules (Enrollment, NSB, FTF, Facilities, Staff) */}
                            <button
                              type="button"
                              onClick={() => onInspectSchool(school.emisCode, 'enrollment')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                              title="Inspect complete school records (Profile, Enrollment, NSB, FTF, Facilities, Staff)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'کوائف دیکھیں' : 'Inspect'}</span>
                            </button>

                            {/* Edit School Record */}
                            {canManageSchool && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(school)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                title="Edit School Master Record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Reset Password */}
                            {canManageSchool && (
                              <button
                                type="button"
                                onClick={() => setResetTarget({ emis: school.emisCode, name: school.name })}
                                className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                title="Reset Password to initial EMIS code"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete School */}
                            {canManageSchool && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ emis: school.emisCode, name: school.name })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete School Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 6. Comprehensive "All Schools Data Ledger Table" (Exhaustive Columns) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                <span>
                  {markazFilter === 'all'
                    ? 'All Schools Comprehensive Data Ledger (Tehsil Pindi Gheb)'
                    : `Markaz ${markazFilter} · Comprehensive Schools Data Ledger`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Displays Enrollment, NSB Income/Expenditure/Balance, FTF, Facilities, Staff, and Submission Status side-by-side.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded border border-slate-200 shadow-2xs">
              {filteredSchools.length} Schools Listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 font-sans text-[11px]">
                <tr>
                  <th className="py-3 px-3">EMIS Code</th>
                  <th className="py-3 px-3">School Name</th>
                  <th className="py-3 px-3">Markaz</th>
                  <th className="py-3 px-3">Submission</th>
                  <th className="py-3 px-3">Enrollment</th>
                  <th className="py-3 px-3">Bal. 30-06-2026</th>
                  <th className="py-3 px-3">NSB Total Income</th>
                  <th className="py-3 px-3">NSB Spent</th>
                  <th className="py-3 px-3">NSB Current Bal.</th>
                  <th className="py-3 px-3">FTF Bal.</th>
                  <th className="py-3 px-3">Staff</th>
                  <th className="py-3 px-3">Rooms</th>
                  <th className="py-3 px-3 text-right font-sans">Review / Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredSchools.map(school => {
                  const enr = getEnrollment(school.emisCode);
                  const nsb = getNSB(school.emisCode);
                  const ftf = getFTF(school.emisCode);
                  const fac = getFacilities(school.emisCode);
                  const stf = getStaff(school.emisCode);
                  const sub = submissions.find(s => s.schoolEmisCode === school.emisCode);

                  return (
                    <tr key={school.emisCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-emerald-900">{school.emisCode}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900 truncate max-w-[180px]">
                        {school.name}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{school.markaz}</td>

                      {/* Submission Status */}
                      <td className="py-2.5 px-3 font-sans">
                        {sub?.status === 'approved' && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                          </span>
                        )}
                        {(sub?.status === 'submitted' || sub?.status === 'under_review') && (
                          <span className="text-amber-700 font-bold flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" /> Submitted
                          </span>
                        )}
                        {sub?.status === 'returned' && (
                          <span className="text-rose-700 font-bold flex items-center gap-1 text-[10px]">
                            <RotateCcw className="w-3 h-3 text-rose-600" /> Returned
                          </span>
                        )}
                        {!sub?.status && (
                          <span className="text-slate-400 text-[10px]">Draft</span>
                        )}
                      </td>

                      {/* Enrollment */}
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900">{enr ? enr.grandTotal : 0}</strong>{' '}
                        <span className="text-[10px] text-slate-400 font-sans">({enr ? enr.totalBoys : 0}B/{enr ? enr.totalGirls : 0}G)</span>
                      </td>

                      {/* NSB Balance 30-06-2026 */}
                      <td className="py-2.5 px-3 text-slate-700">
                        Rs. {(nsb?.balanceOn30June2026 || 0).toLocaleString()}
                      </td>

                      {/* NSB Total Income */}
                      <td className="py-2.5 px-3 font-bold text-emerald-900">
                        Rs. {(nsb?.totalIncome || 0).toLocaleString()}
                      </td>

                      {/* NSB Expenditure */}
                      <td className="py-2.5 px-3 text-rose-700 font-semibold">
                        Rs. {(nsb?.totalExpenditure || 0).toLocaleString()}
                      </td>

                      {/* NSB Current Balance */}
                      <td className="py-2.5 px-3 font-black text-emerald-800">
                        Rs. {(nsb?.currentBalance || 0).toLocaleString()}
                      </td>

                      {/* FTF Balance */}
                      <td className="py-2.5 px-3 text-slate-800">
                        Rs. {(ftf?.currentBalance || 0).toLocaleString()}
                      </td>

                      {/* Staff */}
                      <td className="py-2.5 px-3 text-slate-700 font-sans">
                        {stf?.teachers?.length || 0} teachers
                      </td>

                      {/* Classrooms */}
                      <td className="py-2.5 px-3 text-slate-700 font-sans">
                        {fac?.totalClassrooms || 0} ({fac?.dangerousClassrooms ? `${fac.dangerousClassrooms} danger` : 'safe'})
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isDyDEO || isAEO || isSupervisor) && (
                            <button
                              type="button"
                              onClick={() => setReviewSchool(school)}
                              className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px] shadow-2xs transition-colors"
                            >
                              Review
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onInspectSchool(school.emisCode, 'enrollment')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold border transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Submission Review Modal for AEO & Deputy DEO */}
      {reviewSchool && (
        <SubmissionReviewModal
          school={reviewSchool}
          isOpen={!!reviewSchool}
          onClose={() => setReviewSchool(null)}
          onInspectSchool={onInspectSchool}
          onOpenPrintDossier={onOpenPrintDossier}
          onStatusUpdated={() => refreshData()}
        />
      )}

      {/* 8. Quick Submit Modal for School Users */}
      {submitModalSchool && (
        <SchoolQuickSubmitModal
          school={submitModalSchool}
          isOpen={!!submitModalSchool}
          onClose={() => setSubmitModalSchool(null)}
          onSubmitted={() => refreshData()}
        />
      )}

      {/* 9. In-App Safe Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={isUrdu ? 'سکول حذف کرنے کی تصدیق' : 'Confirm School Deletion'}
        message={
          isUrdu
            ? `کیا آپ واقعی سکول "${deleteTarget?.name}" (EMIS: ${deleteTarget?.emis}) کا مکمل ریکارڈ اور فائلز حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔`
            : `Are you sure you want to permanently delete "${deleteTarget?.name}" (EMIS: ${deleteTarget?.emis}) and all associated records? This action cannot be undone.`
        }
        confirmText={isUrdu ? 'ہاں، حذف کریں' : 'Delete School'}
        isDestructive={true}
        icon="trash"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 10. In-App Safe Password Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={!!resetTarget}
        title={isUrdu ? 'پاس ورڈ ری سیٹ کی تصدیق' : 'Reset School Password'}
        message={
          isUrdu
            ? `سکول "${resetTarget?.name}" کا پاس ورڈ اس کے EMIS کوڈ (${resetTarget?.emis}) پر ری سیٹ ہو جائے گا۔`
            : `This will reset the login password for "${resetTarget?.name}" back to its EMIS code (${resetTarget?.emis}). Continue?`
        }
        confirmText={isUrdu ? 'ری سیٹ کریں' : 'Reset Password'}
        isDestructive={false}
        icon="key"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetTarget(null)}
      />

      {/* 11. Add / Edit School Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="text-base font-bold">
                  {isEditing
                    ? (isUrdu ? 'سکول ریکارڈ میں ترمیم' : 'Edit School Record')
                    : (isUrdu ? 'نیا تعلیمی ادارہ شامل کریں' : 'Register New Institution')}
                </h3>
                <p className="text-xs text-emerald-300">
                  {isEditing ? `EMIS: ${modalForm.emisCode}` : 'Register new Public, Private, PEIMA, or PEF institution'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* EMIS Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    EMIS Code (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={modalForm.emisCode}
                    onChange={e => setModalForm({ ...modalForm, emisCode: e.target.value })}
                    placeholder="e.g. 37120108"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100"
                  />
                </div>

                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    School Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={e => setModalForm({ ...modalForm, name: e.target.value })}
                    placeholder="e.g. Govt. Primary School Khaur"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Urdu Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-urdu">
                    سکول کا نام (اردو)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={modalForm.nameUrdu}
                    onChange={e => setModalForm({ ...modalForm, nameUrdu: e.target.value })}
                    placeholder="گورنمنٹ پرائمری سکول کھوڑ"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 font-urdu"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={modalForm.category}
                    onChange={e => setModalForm({ ...modalForm, category: e.target.value as SchoolCategory })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Public">Public (Government)</option>
                    <option value="Private">Private Registered</option>
                    <option value="PEIMA">PEIMA (PPP)</option>
                    <option value="PEF">PEF (Foundation)</option>
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level *
                  </label>
                  <select
                    value={modalForm.level}
                    onChange={e => setModalForm({ ...modalForm, level: e.target.value as SchoolLevel })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Primary">Primary (Class 1-5)</option>
                    <option value="Elementary">Elementary (Class 1-8)</option>
                    <option value="High">High (Class 1-10)</option>
                    <option value="Higher Secondary">Higher Secondary (Class 1-12)</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender Policy *
                  </label>
                  <select
                    value={modalForm.gender}
                    onChange={e => setModalForm({ ...modalForm, gender: e.target.value as GenderPolicy })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-Education">Co-Education</option>
                  </select>
                </div>

                {/* Markaz */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Markaz / Cluster *
                  </label>
                  <select
                    value={modalForm.markaz}
                    disabled={isAEO && !!currentUser?.assignedMarkaz}
                    onChange={e => setModalForm({ ...modalForm, markaz: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
                  >
                    {markazOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Union Council */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Union Council
                  </label>
                  <input
                    type="text"
                    value={modalForm.unionCouncil}
                    onChange={e => setModalForm({ ...modalForm, unionCouncil: e.target.value })}
                    placeholder="e.g. UC Khaur Company"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift
                  </label>
                  <select
                    value={modalForm.shift}
                    onChange={e => setModalForm({ ...modalForm, shift: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Double Shift">Double Shift</option>
                  </select>
                </div>

                {/* Head Teacher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Head Teacher Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.headTeacherName}
                    onChange={e => setModalForm({ ...modalForm, headTeacherName: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* CNIC */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Head Teacher CNIC
                  </label>
                  <input
                    type="text"
                    value={modalForm.headTeacherCnic}
                    onChange={e => setModalForm({ ...modalForm, headTeacherCnic: e.target.value })}
                    placeholder="37102-XXXXXXX-X"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Mobile Contact
                  </label>
                  <input
                    type="text"
                    value={modalForm.headTeacherPhone}
                    onChange={e => setModalForm({ ...modalForm, headTeacherPhone: e.target.value })}
                    placeholder="0300-XXXXXXX"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Village Address
                  </label>
                  <input
                    type="text"
                    value={modalForm.address}
                    onChange={e => setModalForm({ ...modalForm, address: e.target.value })}
                    placeholder="Location, street, or landmark"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  {isEditing ? 'Save Changes' : 'Register Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
