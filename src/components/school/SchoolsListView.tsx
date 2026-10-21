import React, { useState } from 'react';
import { School, SchoolCategory, SchoolLevel, GenderPolicy } from '../../types';
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
  getFacilities,
  getSubmissions
} from '../../services/storage';
import {
  School as SchoolIcon,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';

interface SchoolsListViewProps {
  onInspectSchool: (emisCode: string, targetTab?: string) => void;
}

export const SchoolsListView: React.FC<SchoolsListViewProps> = ({ onInspectSchool }) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [schools, setSchools] = useState<School[]>(() => getSchoolsForUser(currentUser));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const refreshSchools = () => {
    setSchools(getSchoolsForUser(currentUser));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setModalForm({
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
      establishmentYear: new Date().getFullYear().toString(),
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setIsEditing(true);
    setModalForm({ ...school });
    setModalOpen(true);
  };

  const canManageSchool = isAEO || isDyDEO;

  const handleDelete = (emisCode: string, schoolName: string) => {
    if (!currentUser || !canManageSchool) return;
    const confirmDelete = window.confirm(
      isUrdu
        ? `کیا آپ واقعی اس سکول "${schoolName}" (EMIS: ${emisCode}) کو حذف کرنا چاہتے ہیں؟ اس سے منسلک صارف اکاؤنٹ بھی ختم ہو جائے گا۔`
        : `Are you sure you want to delete "${schoolName}" (EMIS: ${emisCode})? This will also remove the school's account credentials.`
    );
    if (!confirmDelete) return;

    deleteSchool(emisCode, currentUser);
    refreshSchools();
    setStatusNotice(isUrdu ? `سکول "${schoolName}" کو حذف کر دیا گیا۔` : `School "${schoolName}" was deleted.`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleResetPassword = async (emisCode: string, schoolName: string) => {
    if (!currentUser || !canManageSchool) return;
    const confirmReset = window.confirm(
      isUrdu
        ? `اس سکول (${schoolName}) کا پاس ورڈ واپس ابتدائی عارضی EMIS کوڈ (${emisCode}) پر ری سیٹ کریں؟`
        : `Reset password for ${schoolName} to initial default EMIS code (${emisCode})?`
    );
    if (!confirmReset) return;

    await resetSchoolPasswordToDefault(emisCode, currentUser);
    setStatusNotice(
      isUrdu
        ? `پاس ورڈ ری سیٹ ہو گیا۔ ابتدائی پاس ورڈ اب ${emisCode} ہے۔`
        : `Password reset successfully. Initial temporary password is now ${emisCode}.`
    );
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedEmis = modalForm.emisCode.trim();
    if (!trimmedEmis) {
      alert('EMIS code is required');
      return;
    }

    if (!isEditing) {
      // Check for duplicate EMIS
      if (schools.some(s => s.emisCode === trimmedEmis)) {
        alert(isUrdu ? 'یہ ای ایم آئی ایس کوڈ پہلے سے موجود ہے!' : 'This EMIS code already exists!');
        return;
      }
    }

    const toSave: School = {
      ...modalForm,
      emisCode: trimmedEmis,
      name: modalForm.name.trim()
    };

    saveSchool(toSave, currentUser);
    refreshSchools();
    setModalOpen(false);
    setStatusNotice(
      isEditing
        ? (isUrdu ? `سکول "${toSave.name}" کی معلومات اپ ڈیٹ ہو گئیں!` : `School "${toSave.name}" updated successfully!`)
        : (isUrdu ? `نیا سکول "${toSave.name}" شامل کر دیا گیا۔` : `New school "${toSave.name}" registered successfully!`)
    );
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const submissions = getSubmissions();

  const filteredSchools = schools.filter(s => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emisCode.includes(searchQuery) ||
      s.markaz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.headTeacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    all: schools.length,
    Public: schools.filter(s => s.category === 'Public').length,
    Private: schools.filter(s => s.category === 'Private').length,
    PEIMA: schools.filter(s => s.category === 'PEIMA').length,
    PEF: schools.filter(s => s.category === 'PEF').length
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <SchoolIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'سکولز فہرست و انتظام' : 'Schools Management Directory'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'مرکز پنڈی گھیب کے تمام سرکاری، پرائیویٹ، پیما اور پیف سکولز کا اندراج اور انتظام'
                : 'Registered institutions in Markaz Pindi Gheb · Add, edit, remove, and inspect data'}
            </p>
          </div>
        </div>

        {canManageSchool && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا سکول شامل کریں' : 'Add New School'}</span>
          </button>
        )}
      </div>

      {statusNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isUrdu ? 'تمام سکولز' : 'All Schools'} ({categoryCounts.all})
          </button>
          <button
            onClick={() => setCategoryFilter('Public')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'Public'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('publicSchool')} ({categoryCounts.Public})
          </button>
          <button
            onClick={() => setCategoryFilter('Private')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'Private'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('privateSchool')} ({categoryCounts.Private})
          </button>
          <button
            onClick={() => setCategoryFilter('PEIMA')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'PEIMA'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('peimaSchool')} ({categoryCounts.PEIMA})
          </button>
          <button
            onClick={() => setCategoryFilter('PEF')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              categoryFilter === 'PEF'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('pefSchool')} ({categoryCounts.PEF})
          </button>
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

      {/* Schools Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('emisCode')}</th>
                <th className="py-3 px-4">{isUrdu ? 'سکول کا نام' : 'School Name'}</th>
                <th className="py-3 px-4">{isUrdu ? 'کیٹیگری و درجہ' : 'Category & Level'}</th>
                <th className="py-3 px-4">{isUrdu ? 'مرکز و یونین کونسل' : 'Markaz / Location'}</th>
                <th className="py-3 px-4">{isUrdu ? 'ہیڈ ٹیچر و فون' : 'Head Teacher'}</th>
                <th className="py-3 px-4">{isUrdu ? 'داخلہ و بجٹ' : 'Enrollment & NSB'}</th>
                <th className="py-3 px-4">{isUrdu ? 'توثیقی سٹیٹس' : 'Submission'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'سکول ڈیٹا دیکھیں / کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {isUrdu ? 'کوئی سکول نہیں ملا۔' : 'No schools found matching your search.'}
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

                      <td className="py-3 px-4 text-slate-600">
                        <div>{school.markaz}</div>
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
                          NSB: Rs. {nsb ? nsb.totalExpenditure.toLocaleString() : 0}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {sub?.status === 'approved' && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        )}
                        {(sub?.status === 'submitted' || sub?.status === 'under_review') && (
                          <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Under Review
                          </span>
                        )}
                        {sub?.status === 'returned' && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1 text-[11px]">
                            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                            Returned
                          </span>
                        )}
                        {!sub?.status && (
                          <span className="text-slate-400 text-[11px]">— Draft</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click School-Wise Data Inspector */}
                          <button
                            type="button"
                            onClick={() => onInspectSchool(school.emisCode, 'profile')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                            title="Inspect complete school records (Profile, Enrollment, NSB, FTF, Facilities, Staff)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'کوائف دیکھیں' : 'Inspect'}</span>
                          </button>

                          {/* Edit School Button */}
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

                          {/* Reset Initial Password Button */}
                          {canManageSchool && (
                            <button
                              type="button"
                              onClick={() => handleResetPassword(school.emisCode, school.name)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                              title="Reset Password to initial EMIS code"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete School Button */}
                          {canManageSchool && (
                            <button
                              type="button"
                              onClick={() => handleDelete(school.emisCode, school.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete School"
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

      {/* Add / Edit School Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isEditing
                    ? (isUrdu ? 'سکول کوائف میں ترمیم کریں' : 'Edit School Information')
                    : (isUrdu ? 'نیا سکول رجسٹر کریں' : 'Register New Institution')}
                </h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  {isEditing
                    ? `Updating ${modalForm.name} (EMIS: ${modalForm.emisCode})`
                    : 'Initial temporary password will be set automatically to the EMIS code'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
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
                    onChange={e => setModalForm({ ...modalForm, markaz: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Pindi Gheb City">Pindi Gheb City</option>
                    <option value="Ikhlas">Ikhlas</option>
                    <option value="Malhuwali">Malhuwali</option>
                    <option value="Khaur">Khaur</option>
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
