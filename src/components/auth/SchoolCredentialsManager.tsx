import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { School, UserAccount } from '../../types';
import {
  getSchools,
  getUsers,
  saveSchoolCredentials,
  resetSchoolPasswordToDefault
} from '../../services/storage';
import {
  KeyRound,
  Shield,
  School as SchoolIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  Printer,
  Edit2,
  Sparkles,
  Phone,
  User,
  Check,
  Building,
  X
} from 'lucide-react';

export const SchoolCredentialsManager: React.FC = () => {
  const { isDyDEO, isAEO, currentUser, allowedSchools } = useAuth();
  const { isUrdu } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    passwordPlain: '',
    headTeacherName: '',
    headTeacherPhone: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Print Slip Modal
  const [printSlipSchool, setPrintSlipSchool] = useState<{
    school: School;
    user: UserAccount | undefined;
  } | null>(null);

  // Scoped strictly to the AEO's assigned Markaz (or all if Dy. DEO)
  const scopedSchools = isAEO && currentUser?.assignedMarkaz
    ? allowedSchools.filter(s => s.markaz && s.markaz.trim().toLowerCase() === currentUser.assignedMarkaz!.trim().toLowerCase())
    : allowedSchools;

  const users = getUsers();

  const handleOpenSetCredentials = (school: School) => {
    setSelectedSchool(school);
    const existingUser = users.find(u => u.username === school.emisCode || u.schoolEmisCode === school.emisCode);
    setFormData({
      username: existingUser?.username || school.emisCode,
      passwordPlain: '',
      headTeacherName: school.headTeacherName || '',
      headTeacherPhone: school.headTeacherPhone || ''
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, passwordPlain: result }));
    setShowPassword(true);
  };

  const handleUseDefaultEmis = () => {
    if (selectedSchool) {
      setFormData(prev => ({ ...prev, passwordPlain: selectedSchool.emisCode }));
      setShowPassword(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedSchool) return;

    const res = await saveSchoolCredentials(
      selectedSchool.emisCode,
      formData,
      currentUser
    );

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save school credentials');
      return;
    }

    setModalOpen(false);
    setNotice(
      isUrdu
        ? `سکول "${selectedSchool.name}" (EMIS: ${selectedSchool.emisCode}) کے لاگ ان اسناد کامیابی سے محفوظ ہو گئے۔`
        : `Login credentials successfully set for ${selectedSchool.name} (EMIS: ${selectedSchool.emisCode}).`
    );
    setTimeout(() => setNotice(null), 3500);
  };

  const handleQuickReset = async (school: School) => {
    if (!currentUser) return;
    const confirm = window.confirm(
      isUrdu
        ? `کیا آپ واقعی اس سکول "${school.name}" کا پاس ورڈ واپس ابتدائی عارضی EMIS کوڈ (${school.emisCode}) پر ری سیٹ کرنا چاہتے ہیں؟`
        : `Reset password for "${school.name}" back to default initial EMIS code (${school.emisCode})?`
    );
    if (!confirm) return;

    await resetSchoolPasswordToDefault(school.emisCode, currentUser);
    setNotice(
      isUrdu
        ? `پاس ورڈ ری سیٹ ہو گیا۔ عارضی پاس ورڈ اب ${school.emisCode} ہے۔`
        : `Password reset to default EMIS code ${school.emisCode}.`
    );
    setTimeout(() => setNotice(null), 3500);
  };

  const filteredSchools = scopedSchools.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emisCode.includes(searchQuery) ||
      s.headTeacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Directive Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 sm:p-6 border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 border border-emerald-600 font-bold">
            <KeyRound className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                {isUrdu ? 'مجاز اتھارٹی: معاون تعلیمی افسر (AEO)' : 'Authorized Authority: AEO of the Markaz'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-800 text-amber-200 font-bold">
                {currentUser?.assignedMarkaz ? `Markaz: ${currentUser.assignedMarkaz}` : 'Markaz Jurisdiction'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {isUrdu ? 'سکولوں کے لاگ ان اسناد اور پاس ورڈ مینجمنٹ' : 'School Credentials & Password Provisioning'}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {isUrdu
                ? `مرکز ${currentUser?.assignedMarkaz || ''} کے تمام سکولوں کے لاگ ان اسناد اسی مرکز کے اے ای او کے ذریعے جاری اور تبدیل کیے جاتے ہیں۔`
                : `Login credentials for each school in Markaz ${currentUser?.assignedMarkaz || ''} are issued and configured by the respective AEO.`}
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-emerald-950/70 border border-emerald-700/80 rounded-lg text-xs font-mono text-emerald-200 shrink-0">
          <span>{filteredSchools.length} {isUrdu ? 'سکولز زیرِ انتظام' : 'Markaz Schools'}</span>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-700">
          {isUrdu ? 'سکولز کی لاگ ان تفصیلات' : 'Schools Account Roster in Your Markaz'}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'سکول کا نام یا EMIS تلاش کریں...' : 'Search school name or EMIS...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* School Credentials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isUrdu ? 'مرکز کے سکولز اور سرکاری اسناد' : 'Markaz School Credentials Roster'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredSchools.length} {isUrdu ? 'سکولز' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isUrdu ? 'EMIS کوڈ' : 'EMIS Code'}</th>
                <th className="py-3 px-4">{isUrdu ? 'سکول کا نام' : 'School Name'}</th>
                <th className="py-3 px-4">{isUrdu ? 'ہیڈ ٹیچر و رابطہ' : 'Head Teacher & Contact'}</th>
                <th className="py-3 px-4">{isUrdu ? 'سرکاری یوزر نیم' : 'Login Username'}</th>
                <th className="py-3 px-4">{isUrdu ? 'پاس ورڈ کی حالت' : 'Password Status'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {isUrdu ? 'اس مرکز میں کوئی سکول نہیں ملا۔' : 'No schools found for your Markaz.'}
                  </td>
                </tr>
              ) : (
                filteredSchools.map(school => {
                  const schoolUser = users.find(
                    u => u.username === school.emisCode || u.schoolEmisCode === school.emisCode
                  );
                  const isInitial = schoolUser?.mustChangePassword;

                  return (
                    <tr key={school.emisCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {school.emisCode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{school.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {school.category} · {school.level} · Markaz {school.markaz}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{school.headTeacherName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{school.headTeacherPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {schoolUser?.username || school.emisCode}
                      </td>

                      <td className="py-3 px-4">
                        {isInitial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span>Initial Temporary (EMIS)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Custom Secured</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSetCredentials(school)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                            title={isUrdu ? 'اسناد سیٹ کریں' : 'Set Credentials'}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'اسناد سیٹ کریں' : 'Set Credentials'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickReset(school)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                            title={isUrdu ? 'ابتدائی EMIS پاس ورڈ پر ری سیٹ کریں' : 'Reset to Default EMIS Password'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintSlipSchool({ school, user: schoolUser })}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title={isUrdu ? 'سرکاری اسناد سلپ پرنٹ کریں' : 'Print Official Credentials Slip'}
                          >
                            <Printer className="w-4 h-4" />
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

      {/* Modal: Set / Update School Credentials */}
      {modalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-800 border border-emerald-600 flex items-center justify-center text-white">
                  <KeyRound className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isUrdu ? 'سکول لاگ ان اسناد کا تعین' : 'Set School Login Credentials'}
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-mono">
                    EMIS: {selectedSchool.emisCode} · {selectedSchool.name}
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
                  {isUrdu ? 'سرکاری لاگ ان یوزر نیم' : 'Official Login Username (Default: EMIS)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isUrdu ? 'نیا پاس ورڈ سیٹ کریں' : 'Set New Password'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseDefaultEmis}
                      className="text-[10px] text-emerald-800 hover:underline font-semibold"
                    >
                      {isUrdu ? 'EMIS کوڈ رکھیں' : 'Use EMIS Code'}
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] text-emerald-800 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isUrdu ? 'خودکار مضبوط پاس ورڈ' : 'Generate Strong'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordPlain}
                    onChange={e => setFormData({ ...formData, passwordPlain: e.target.value })}
                    placeholder={isUrdu ? 'نیا پاس ورڈ درج کریں یا خالی چھوڑیں...' : 'Enter new password or click generate'}
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
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isUrdu ? 'ہیڈ ٹیچر رابطہ کوائف' : 'Head Teacher Contact Details'}
                </span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isUrdu ? 'ہیڈ ٹیچر کا نام' : 'Head Teacher Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.headTeacherName}
                      onChange={e => setFormData({ ...formData, headTeacherName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isUrdu ? 'موبائل نمبر' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.headTeacherPhone}
                      onChange={e => setFormData({ ...formData, headTeacherPhone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white"
                    />
                  </div>
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
                  <span>{isUrdu ? 'اسناد محفوظ کریں' : 'Save Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {printSlipSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6">
            <div className="text-center border-b pb-4 mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                GOVERNMENT OF THE PUNJAB · SCHOOL EDUCATION DEPARTMENT
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                OFFICE OF THE ASSISTANT EDUCATION OFFICER (AEO)
              </div>
              <div className="text-xs text-slate-500">
                Markaz: {printSlipSchool.school.markaz} · Tehsil Pindi Gheb, District Attock
              </div>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded font-bold text-xs">
                OFFICIAL SCHOOL PORTAL CREDENTIALS SLIP
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">School Name:</span>
                <span className="font-bold text-slate-900">{printSlipSchool.school.name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">EMIS Code:</span>
                <span className="font-mono font-bold text-emerald-800">{printSlipSchool.school.emisCode}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">Category & Level:</span>
                <span className="font-semibold text-slate-800">{printSlipSchool.school.category} · {printSlipSchool.school.level}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">Head Teacher:</span>
                <span className="font-semibold text-slate-800">{printSlipSchool.school.headTeacherName} ({printSlipSchool.school.headTeacherPhone})</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">Official Login Username:</span>
                <span className="font-mono font-bold text-slate-900">{printSlipSchool.user?.username || printSlipSchool.school.emisCode}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500 font-semibold">Initial Password Policy:</span>
                <span className="font-mono text-emerald-800">
                  {printSlipSchool.user?.mustChangePassword ? 'Same as 8-digit EMIS Code (Must change on first login)' : 'Custom Password Configured by AEO'}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
              <strong>Notice for Head Teacher:</strong> Please keep these login credentials strictly confidential. All quarterly data submissions, NSB funds, FTF registers, and staff records submitted under this account are legally binding.
            </div>

            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="text-[10px] text-slate-400">
                Issued by AEO Office · Date: {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintSlipSchool(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
