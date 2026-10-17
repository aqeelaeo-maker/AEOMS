import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAccount } from '../../types';
import {
  getAeoAccounts,
  saveAeoAccount,
  deleteAeoAccount,
  getSchools
} from '../../services/storage';
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
  X
} from 'lucide-react';

export const AeoCredentialsManager: React.FC = () => {
  const { isDyDEO, currentUser } = useAuth();
  const { isUrdu } = useLanguage();

  const [aeoList, setAeoList] = useState<UserAccount[]>(() => getAeoAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    displayName: '',
    assignedMarkaz: 'Pindi Gheb City',
    email: '',
    phone: '',
    passwordPlain: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const refreshList = () => {
    setAeoList(getAeoAccounts());
  };

  const markazOptions = Array.from(
    new Set([...getSchools().map(s => s.markaz), 'Pindi Gheb City', 'Khaur', 'Malhuwali', 'Ikhlas'])
  ).filter(Boolean);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      username: '',
      displayName: '',
      assignedMarkaz: markazOptions[0] || 'Pindi Gheb City',
      email: '',
      phone: '',
      passwordPlain: 'AeoAdmin@2026'
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (aeo: UserAccount) => {
    setIsEditing(true);
    setFormData({
      id: aeo.id,
      username: aeo.username,
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

    if (!formData.username.trim() || !formData.displayName.trim() || !formData.assignedMarkaz.trim()) {
      setErrorMsg('Please fill in all mandatory fields (Username, Name, and Markaz).');
      return;
    }

    const res = await saveAeoAccount(formData, currentUser);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save AEO credentials');
      return;
    }

    refreshList();
    setModalOpen(false);
    setNotice(
      isEditing
        ? (isUrdu ? `اے ای او "${formData.displayName}" کی اسناد اپ ڈیٹ کر دی گئیں۔` : `Updated credentials for AEO "${formData.displayName}".`)
        : (isUrdu ? `نئے اے ای او "${formData.displayName}" کی لاگ ان اسناد جاری کر دی گئیں۔` : `Issued new credentials for AEO "${formData.displayName}".`)
    );
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDelete = async (aeo: UserAccount) => {
    if (!currentUser) return;
    const confirm = window.confirm(
      isUrdu
        ? `کیا آپ واقعی اسسٹنٹ ایجوکیشن آفیسر "${aeo.displayName}" (مرکز: ${aeo.assignedMarkaz}) کا اکاؤنٹ منسوخ کرنا چاہتے ہیں؟`
        : `Are you sure you want to revoke credentials for AEO "${aeo.displayName}" (Markaz: ${aeo.assignedMarkaz})?`
    );
    if (!confirm) return;

    const res = await deleteAeoAccount(aeo.id, currentUser);
    if (!res.success) {
      alert(res.error);
      return;
    }

    refreshList();
    setNotice(isUrdu ? `اے ای او "${aeo.displayName}" کا اکاؤنٹ منسوخ کر دیا گیا۔` : `Revoked AEO account for ${aeo.displayName}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const filteredAeos = aeoList.filter(
    a =>
      a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedMarkaz && a.assignedMarkaz.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Directive Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 sm:p-6 border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 border border-emerald-600 font-bold">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                {isUrdu ? 'صرف مجاز اتھارٹی: ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر' : 'Authorized Authority: Deputy DEO Only'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-800 text-amber-200 font-bold">
                dydeowpindigheb@gmail.com
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {isUrdu ? 'اے ای اوز کے لاگ ان اسناد اور مرکز تفویض مینجمنٹ' : 'AEO Credentials & Markaz Assignment Management'}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {isUrdu
                ? 'تمام اسسٹنٹ ایجوکیشن آفیسرز کے لاگ ان اسناد صرف ڈپٹی ڈی ای او ہی جاری اور تبدیل کر سکتے ہیں۔'
                : 'Login credentials of all AEOs are configured and maintained exclusively by dydeowpindigheb@gmail.com.'}
            </p>
          </div>
        </div>

        {isDyDEO && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm border border-emerald-500 transition-colors flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا اے ای او اکاؤنٹ جاری کریں' : 'Issue New AEO Credentials'}</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {isUrdu ? 'کل رجسٹرڈ اے ای اوز:' : 'Registered AEOs:'}
          </span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded text-xs font-mono">
            {aeoList.length}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'اے ای او یا مرکز تلاش کریں...' : 'Search AEO or Markaz...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* AEO Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isUrdu ? 'اسسٹنٹ ایجوکیشن آفیسرز سرکاری اسناد ریکارڈ' : 'Assistant Education Officers Roster & Credentials'}
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
                <th className="py-3 px-4">{isUrdu ? 'سرکاری یوزر نیم' : 'Official Username'}</th>
                <th className="py-3 px-4">{isUrdu ? 'تفویض شدہ مرکز' : 'Assigned Markaz'}</th>
                <th className="py-3 px-4">{isUrdu ? 'رابطہ و ای میل' : 'Contact & Official Email'}</th>
                <th className="py-3 px-4">{isUrdu ? 'حالت' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'کارروائی' : 'Actions'}</th>
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
                  const markazSchoolCount = getSchools().filter(s => s.markaz === aeo.assignedMarkaz).length;

                  return (
                    <tr key={aeo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{aeo.displayName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {aeo.id}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {aeo.username}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <Building className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{aeo.assignedMarkaz || 'Unassigned'}</span>
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {markazSchoolCount} {isUrdu ? 'سکولز زیرِ نگرانی' : 'schools in jurisdiction'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active · Authorized
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(aeo)}
                            className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={isUrdu ? 'اسناد تبدیل کریں' : 'Edit Credentials'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(aeo)}
                            className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                            title={isUrdu ? 'اکاؤنٹ منسوخ کریں' : 'Revoke Account'}
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

      {/* Modal for Add / Edit AEO Credentials */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-800 border border-emerald-600 flex items-center justify-center text-white">
                  <KeyRound className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isEditing
                      ? (isUrdu ? 'اے ای او کی اسناد میں ترمیم' : 'Update AEO Credentials')
                      : (isUrdu ? 'نئے اے ای او کیلئے لاگ ان اسناد جاری کریں' : 'Issue New AEO Login Credentials')}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {isUrdu ? 'صرف مجاز اتھارٹی: ڈپٹی ڈی ای او' : 'Authorized Authority: Dy. DEO Pindi Gheb'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'اے ای او کا مکمل نام' : 'AEO Officer Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Assistant Education Officer (Markaz Khaur)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سرکاری یوزر نیم' : 'Official Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. aeo.khaur"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'تفویض شدہ مرکز' : 'Assigned Markaz *'}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'لاگ ان پاس ورڈ' : isEditing ? 'New Password (Leave blank to keep unchanged)' : 'Login Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordPlain}
                    onChange={e => setFormData({ ...formData, passwordPlain: e.target.value })}
                    placeholder={isEditing ? 'Enter new password or leave blank' : 'e.g. AeoAdmin@2026'}
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
                <p className="text-[10px] text-slate-500 mt-1">
                  {isUrdu
                    ? 'پہلے سے طے شدہ معیاری پاس ورڈ: AeoAdmin@2026'
                    : 'Standard default password: AeoAdmin@2026'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سرکاری ای میل' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aeo.khaur@punjab.gov.pk"
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
                    placeholder="0300-1234567"
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
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? (isUrdu ? 'اسناد محفوظ کریں' : 'Save Changes') : (isUrdu ? 'اکاؤنٹ جاری کریں' : 'Issue Credentials')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
