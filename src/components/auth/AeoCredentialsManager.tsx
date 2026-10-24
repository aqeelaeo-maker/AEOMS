import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAccount, School } from '../../types';
import {
  getAeoAccounts,
  saveAeoAccount,
  deleteAeoAccount,
  resetAeoPasswordToDefaultCnic,
  getSchools
} from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  KeyRound,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  Building,
  Phone,
  Mail,
  User,
  School as SchoolIcon,
  X,
  CreditCard,
  Check
} from 'lucide-react';

export const AeoCredentialsManager: React.FC = () => {
  const { isDyDEO, currentUser } = useAuth();
  const { isUrdu } = useLanguage();

  const [aeoList, setAeoList] = useState<UserAccount[]>(() => getAeoAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarkazFilter, setSelectedMarkazFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-app Confirmation Modal States (Iframe-safe)
  const [resetTargetAeo, setResetTargetAeo] = useState<UserAccount | null>(null);
  const [deleteTargetAeo, setDeleteTargetAeo] = useState<UserAccount | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    cnic: '',
    displayName: '',
    assignedMarkaz: 'Pindi Gheb City',
    email: '',
    phone: '',
    passwordPlain: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Modal State for Inspecting an AEO's Jurisdiction Schools
  const [inspectAeo, setInspectAeo] = useState<UserAccount | null>(null);

  const refreshList = () => {
    setAeoList(getAeoAccounts());
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('aeo_updated', handleUpdate);
    return () => window.removeEventListener('aeo_updated', handleUpdate);
  }, []);

  const markazOptions = Array.from(
    new Set([...getSchools().map(s => s.markaz), 'Pindi Gheb City', 'Khaur', 'Malhuwali', 'Ikhlas'])
  ).filter(Boolean);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      cnic: '',
      displayName: '',
      assignedMarkaz: markazOptions[0] || 'Pindi Gheb City',
      email: '',
      phone: '',
      passwordPlain: ''
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (aeo: UserAccount) => {
    setIsEditing(true);
    setFormData({
      id: aeo.id,
      cnic: aeo.cnic || aeo.username,
      displayName: aeo.displayName,
      assignedMarkaz: aeo.assignedMarkaz || 'Pindi Gheb City',
      email: aeo.email || '',
      phone: aeo.phone || '',
      passwordPlain: ''
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedCnic = formData.cnic.trim();
    if (!trimmedCnic || !formData.displayName.trim() || !formData.assignedMarkaz.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم نام، شناختی کارڈ (CNIC) اور تفویض شدہ مرکز درج کریں۔' : 'Please fill in Name, CNIC number, and Assigned Markaz.');
      return;
    }

    const payload = {
      ...formData,
      username: trimmedCnic,
      cnic: trimmedCnic
    };

    const res = await saveAeoAccount(payload, currentUser);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save AEO credentials');
      return;
    }

    refreshList();
    setModalOpen(false);
    setNotice(
      isEditing
        ? (isUrdu ? `اے ای او "${formData.displayName}" کی اسناد کامیابی سے اپ ڈیٹ ہو گئیں۔` : `Updated credentials for AEO "${formData.displayName}".`)
        : (isUrdu ? `نئے اے ای او "${formData.displayName}" کا اندراج مکمل۔ یوزر نیم و پاس ورڈ CNIC پر سیٹ ہو گیا ہے۔` : `Registered AEO "${formData.displayName}". Username & Password set to CNIC.`)
    );
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExecuteResetToCnic = async () => {
    if (!currentUser || !resetTargetAeo) return;
    const aeo = resetTargetAeo;
    const cnicVal = aeo.cnic || aeo.username;

    const res = await resetAeoPasswordToDefaultCnic(aeo.id, currentUser);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reset password');
      setResetTargetAeo(null);
      return;
    }

    refreshList();
    setNotice(
      isUrdu
        ? `اے ای او "${aeo.displayName}" کا پاس ورڈ ان کے CNIC (${cnicVal}) پر ری سیٹ کر دیا گیا۔`
        : `Password for AEO "${aeo.displayName}" reset to default CNIC (${cnicVal}).`
    );
    setResetTargetAeo(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExecuteDeleteAeo = async () => {
    if (!currentUser || !deleteTargetAeo) return;
    const aeo = deleteTargetAeo;

    const res = await deleteAeoAccount(aeo.id, currentUser);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to revoke AEO account');
      setDeleteTargetAeo(null);
      return;
    }

    refreshList();
    setNotice(
      isUrdu
        ? `اے ای او "${aeo.displayName}" کا اکاؤنٹ منسوخ کر دیا گیا۔`
        : `Revoked AEO account for ${aeo.displayName}.`
    );
    setDeleteTargetAeo(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const allSchools = getSchools();

  const filteredAeos = aeoList.filter(a => {
    const matchesSearch =
      a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.cnic && a.cnic.includes(searchQuery)) ||
      (a.assignedMarkaz && a.assignedMarkaz.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMarkaz = selectedMarkazFilter === 'all' || a.assignedMarkaz === selectedMarkazFilter;
    return matchesSearch && matchesMarkaz;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Dy. DEO Authority Badge */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/70">
                {isUrdu ? 'ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر (Dy. DEO) کنٹرول' : 'Dy. DEO Command & Control'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-800 text-emerald-200">
                dydeowpindigheb@gmail.com
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {isUrdu ? 'اسسٹنٹ ایجوکیشن آفیسرز (AEOs) مکمل ریکارڈ و انتظام' : 'Assistant Education Officers (AEO) Directory & CRUD'}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {isUrdu
                ? 'ڈپٹی ڈی ای او تمام اے ای اوز کے ریکارڈ کا اندراج، تبدیلی، پاس ورڈ ری سیٹ اور نگرانی کر سکتے ہیں۔'
                : 'Deputy District Education Officer can view, add, edit, reset passwords, and revoke AEO accounts.'}
            </p>
          </div>
        </div>

        {isDyDEO && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>{isUrdu ? 'نیا اے ای او شامل کریں' : '+ Add New AEO'}</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold uppercase text-slate-500">{isUrdu ? 'کل اے ای اوز' : 'Total Registered AEOs'}</div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">{aeoList.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isUrdu ? 'تحصیل پنڈی گھیب' : 'Tehsil Pindi Gheb'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold uppercase text-slate-500">{isUrdu ? 'کل زیرِ نگرانی سکولز' : 'Total Schools in Clusters'}</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{allSchools.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isUrdu ? 'تمام مراکز' : 'Across all Markazes'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold uppercase text-slate-500">{isUrdu ? 'اسناد کا اصول' : 'Credentials Policy'}</div>
          <div className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Username & Password = CNIC</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{isUrdu ? 'ہر اے ای او کا شناختی کارڈ نمبر' : 'National Identity Card'}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Markaz Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedMarkazFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedMarkazFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isUrdu ? 'تمام مراکز' : 'All Markazes'} ({aeoList.length})
          </button>
          {markazOptions.map(m => {
            const count = aeoList.filter(a => a.assignedMarkaz === m).length;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMarkazFilter(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedMarkazFilter === m
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'اے ای او، CNIC یا مرکز تلاش کریں...' : 'Search AEO, CNIC, or Markaz...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
          />
        </div>
      </div>

      {/* AEO Accounts Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isUrdu ? 'اسسٹنٹ ایجوکیشن آفیسرز مکمل ریکارڈ' : 'Assistant Education Officers Roster & Master Records'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredAeos.length} {isUrdu ? 'ریکارڈ' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isUrdu ? 'اے ای او کا نام' : 'AEO Officer Name'}</th>
                <th className="py-3 px-4">{isUrdu ? 'شناختی کارڈ (CNIC / یوزر نیم)' : 'CNIC / Username'}</th>
                <th className="py-3 px-4">{isUrdu ? 'تفویض شدہ مرکز' : 'Assigned Markaz'}</th>
                <th className="py-3 px-4">{isUrdu ? 'رابطہ و ای میل' : 'Contact & Official Email'}</th>
                <th className="py-3 px-4">{isUrdu ? 'زیرِ نگرانی سکولز' : 'Schools Under Markaz'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'کارروائی (CRUD)' : 'Actions (CRUD)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAeos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {isUrdu ? 'کوئی اے ای او اکاؤنٹ نہیں ملا۔' : 'No AEO accounts found.'}
                  </td>
                </tr>
              ) : (
                filteredAeos.map(aeo => {
                  const markazSchools = allSchools.filter(
                    s => s.markaz && s.markaz.trim().toLowerCase() === (aeo.assignedMarkaz || '').trim().toLowerCase()
                  );
                  const displayCnic = aeo.cnic || aeo.username;

                  return (
                    <tr key={aeo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <User className="w-4 h-4 text-emerald-700 shrink-0" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{aeo.displayName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {aeo.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{displayCnic}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isUrdu ? 'ڈیفالٹ لاگ ان و پاس ورڈ' : 'Default Username & Password'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
                          <Building className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Markaz {aeo.assignedMarkaz || 'Unassigned'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{aeo.email || '—'}</span>
                        </div>
                        {aeo.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{aeo.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setInspectAeo(aeo)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 rounded-md transition-colors flex items-center gap-1.5"
                          title="View all schools under this AEO"
                        >
                          <SchoolIcon className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{markazSchools.length} {isUrdu ? 'سکولز' : 'Schools'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Jurisdiction Schools */}
                          <button
                            type="button"
                            onClick={() => setInspectAeo(aeo)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title={isUrdu ? 'مرکز کے سکولز دیکھیں' : 'Inspect Jurisdiction Schools'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit AEO Record */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(aeo)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={isUrdu ? 'اے ای او ریکارڈ میں ترمیم' : 'Edit AEO Master Record'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset Password to CNIC */}
                          <button
                            type="button"
                            onClick={() => setResetTargetAeo(aeo)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title={isUrdu ? 'پاس ورڈ واپس CNIC پر ری سیٹ کریں' : 'Reset Password to CNIC Number'}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete AEO */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetAeo(aeo)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isUrdu ? 'اے ای او اکاؤنٹ حذف کریں' : 'Delete AEO Record'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit AEO Record Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-800 border border-emerald-600 flex items-center justify-center text-white">
                  <KeyRound className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isEditing
                      ? (isUrdu ? 'اے ای او ریکارڈ و اسناد میں ترمیم' : 'Edit Assistant Education Officer Record')
                      : (isUrdu ? 'نیا اسسٹنٹ ایجوکیشن آفیسر رجسٹر کریں' : 'Register New Assistant Education Officer')}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {isUrdu ? 'صرف مجاز اتھارٹی: ڈپٹی ڈی ای او پنڈی گھیب' : 'Official Authority: Dy. DEO Pindi Gheb'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* AEO Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'اے ای او آفیسر کا مکمل نام' : 'AEO Officer Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. AEO Tariq Mehmood"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              {/* CNIC and Markaz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'شناختی کارڈ نمبر (CNIC)' : 'CNIC Number (Username & Password)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cnic}
                    onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="37102-XXXXXXX-X"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                  <div className="text-[10px] text-emerald-700 mt-1">
                    {isUrdu ? 'یہ CNIC ہی اے ای او کا سرکاری یوزر نیم اور پاس ورڈ ہوگا' : 'CNIC serves as official Username & default Password'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'تفویض شدہ مرکز' : 'Assigned Markaz'} *
                  </label>
                  <select
                    value={formData.assignedMarkaz}
                    onChange={e => setFormData({ ...formData, assignedMarkaz: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {markazOptions.map(m => (
                      <option key={m} value={m}>
                        Markaz {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Custom Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'خصوصی پاس ورڈ (اختیاری)' : 'Custom Password (Optional - defaults to CNIC)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordPlain}
                    onChange={e => setFormData({ ...formData, passwordPlain: e.target.value })}
                    placeholder={isEditing ? 'Leave blank to keep current password' : 'Leave blank to auto-use CNIC as password'}
                    className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {isUrdu
                    ? 'پاس ورڈ خالی چھوڑنے پر اے ای او کا شناختی کارڈ (CNIC) ہی پاس ورڈ بن جائے گا۔'
                    : 'If left blank, the AEO\'s CNIC number will automatically be used as password.'}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سرکاری ای میل' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aeo.name@punjab.gov.pk"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'موبائل نمبر' : 'Phone / Mobile'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300-XXXXXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? (isUrdu ? 'محفوظ کریں' : 'Save Changes') : (isUrdu ? 'اے ای او رجسٹر کریں' : 'Register AEO')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect AEO Jurisdiction Schools Modal */}
      {inspectAeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {inspectAeo.displayName}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Markaz {inspectAeo.assignedMarkaz} · CNIC: {inspectAeo.cnic || inspectAeo.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectAeo(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800">
                  {isUrdu ? `مرکز ${inspectAeo.assignedMarkaz} کے زیرِ انتظام سکولز:` : `Schools under Markaz ${inspectAeo.assignedMarkaz}:`}
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded">
                  {allSchools.filter(s => s.markaz === inspectAeo.assignedMarkaz).length} schools
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {allSchools
                  .filter(s => s.markaz === inspectAeo.assignedMarkaz)
                  .map(school => (
                    <div key={school.emisCode} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{school.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-800 font-bold">EMIS: {school.emisCode}</span>
                          <span>·</span>
                          <span>{school.category}</span>
                          <span>·</span>
                          <span>{school.level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-700">{school.headTeacherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{school.headTeacherPhone}</div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectAeo(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* In-app Reset Password Confirm Modal */}
      <ConfirmModal
        isOpen={resetTargetAeo !== null}
        title={isUrdu ? 'پاس ورڈ ری سیٹ کریں' : 'Reset AEO Password'}
        message={
          isUrdu
            ? `کیا آپ واقعی اسسٹنٹ ایجوکیشن آفیسر "${resetTargetAeo?.displayName}" کا پاس ورڈ واپس ان کے CNIC نمبر (${resetTargetAeo?.cnic || resetTargetAeo?.username}) پر ری سیٹ کرنا چاہتے ہیں؟`
            : `Reset password for AEO "${resetTargetAeo?.displayName}" back to default CNIC (${resetTargetAeo?.cnic || resetTargetAeo?.username})?`
        }
        confirmText={isUrdu ? 'ری سیٹ کریں' : 'Reset to CNIC'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteResetToCnic}
        onCancel={() => setResetTargetAeo(null)}
      />

      {/* In-app Delete / Revoke Account Confirm Modal */}
      <ConfirmModal
        isOpen={deleteTargetAeo !== null}
        title={isUrdu ? 'اے ای او اکاؤنٹ منسوخ کریں' : 'Revoke AEO Account'}
        message={
          isUrdu
            ? `کیا آپ واقعی اسسٹنٹ ایجوکیشن آفیسر "${deleteTargetAeo?.displayName}" (مرکز: ${deleteTargetAeo?.assignedMarkaz}) کے لاگ ان اختیارات منسوخ کرنا چاہتے ہیں؟`
            : `Are you sure you want to permanently revoke credentials and remove AEO "${deleteTargetAeo?.displayName}" (Markaz: ${deleteTargetAeo?.assignedMarkaz})?`
        }
        confirmText={isUrdu ? 'اکاؤنٹ منسوخ کریں' : 'Revoke & Delete'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteDeleteAeo}
        onCancel={() => setDeleteTargetAeo(null)}
      />
    </div>
  );
};
