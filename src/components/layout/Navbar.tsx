import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSchools, exportDatabaseBackup, restoreDatabaseBackup } from '../../services/storage';
import {
  Building,
  Shield,
  Languages,
  LogOut,
  LogIn,
  KeyRound,
  Download,
  Upload,
  School as SchoolIcon,
  ChevronDown,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDossierPrint?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenDossierPrint }) => {
  const { currentUser, currentSchool, isAEO, isSupervisor, isSchoolUser, logout, selectedSchoolEmis, setSelectedSchoolEmis } = useAuth();
  const { language, setLanguage, t, isUrdu } = useLanguage();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const schools = getSchools();

  const handleDownloadBackup = () => {
    const backupJson = exportDatabaseBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEO_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice(isUrdu ? 'بیک اپ ڈاؤن لوڈ ہو گیا!' : 'Database Backup Downloaded!');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreDatabaseBackup(content);
      if (success) {
        setBackupNotice(isUrdu ? 'ڈیٹا کامیابی سے بحال ہو گیا! صفحہ ریفریش ہو رہا ہے...' : 'Database restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(isUrdu ? 'غلط بیک اپ فائل۔ بحالی ناکام ہو گئی۔' : 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        {/* Top Official Banner */}
        <div className="bg-emerald-900 text-emerald-50 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="tracking-wide">
              {isUrdu ? 'حکومت پنجاب · محکمہ سکول ایجوکیشن' : 'GOVERNMENT OF THE PUNJAB · SCHOOL EDUCATION DEPARTMENT'}
            </span>
            <span className="text-emerald-400/80">/</span>
            <span className="text-emerald-200">
              {isUrdu ? 'دفتر معاون تعلیمی افسر (AEO) تحصیل پنڈی گھیب، ضلع اٹک' : 'Office of the Assistant Education Officer (AEO), Tehsil Pindi Gheb'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {backupNotice && (
              <span className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {backupNotice}
              </span>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-950/60 rounded-md p-0.5 border border-emerald-800">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  language === 'en' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-200 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors font-urdu ${
                  language === 'ur' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-200 hover:text-white'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                  AEO
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-800 transition-colors">
                    {t('appTitle')}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'عوامی، پرائیویٹ، پیما اور پیف سکول مانیٹرنگ' : 'Public · Private · PEIMA · PEF Schools Monitoring'}
                  </p>
                </div>
              </button>
            </div>

            {/* School Selector for AEO / Supervisor */}
            {(isAEO || isSupervisor) && (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
                <SchoolIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  {isUrdu ? 'منتخب سکول:' : 'Focus School:'}
                </span>
                <select
                  value={selectedSchoolEmis || ''}
                  onChange={e => setSelectedSchoolEmis(e.target.value || null)}
                  className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer max-w-[220px] truncate"
                >
                  <option value="">{isUrdu ? 'تمام سکول (مرکزی جائزہ)' : 'Cluster Overview (All Schools)'}</option>
                  {schools.map(s => (
                    <option key={s.emisCode} value={s.emisCode}>
                      {s.emisCode} - {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Right User Status & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <>
                  {/* Role indicator pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {isAEO ? (
                          <span className="text-emerald-800 font-medium">AEO Admin</span>
                        ) : isSupervisor ? (
                          <span className="text-blue-800 font-medium">Supervisor (Read-Only)</span>
                        ) : (
                          <span className="text-amber-800 font-medium">EMIS: {currentUser.username}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Backup / Export Menu */}
                  <div className="hidden lg:flex items-center gap-1">
                    <button
                      onClick={handleDownloadBackup}
                      title="Download JSON Database Backup"
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{isUrdu ? 'بیک اپ' : 'Backup'}</span>
                    </button>

                    <label
                      title="Restore JSON Database Backup"
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{isUrdu ? 'بحالی' : 'Restore'}</span>
                      <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                    </label>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </button>
              )}

              {/* Fast switch login modal trigger */}
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-2.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors hidden sm:flex items-center gap-1"
                title="Switch School or Admin Role"
              >
                <span>{isUrdu ? 'صارف بدلیں' : 'Switch Role'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};
