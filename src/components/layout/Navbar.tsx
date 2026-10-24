import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSchools, exportDatabaseBackup, restoreDatabaseBackup } from '../../services/storage';
import {
  Menu,
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
import { SchoolEducationDeptLogo } from '../common/OfficialLogos';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDossierPrint?: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDossierPrint,
  onToggleSidebar
}) => {
  const {
    currentUser,
    currentSchool,
    isDyDEO,
    isAEO,
    isSupervisor,
    isSchoolUser,
    logout,
    openChangePasswordModal,
    selectedSchoolEmis,
    setSelectedSchoolEmis
  } = useAuth();
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
        setBackupNotice(isUrdu ? 'غلط بیک اپ فائل۔ بحالی ناکام ہو گئی۔' : 'Invalid backup JSON file.');
        setTimeout(() => setBackupNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Top Panel in Green Colour */}
      <header className="sticky top-0 z-40 bg-emerald-900 border-b border-emerald-800 shadow-md text-white">
        {/* Top Official Sub-Banner */}
        <div className="bg-emerald-950 text-emerald-100 px-4 py-1.5 text-xs font-medium border-b border-emerald-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tracking-wide font-semibold text-emerald-200">
              {isUrdu ? 'حکومت پنجاب · محکمہ سکول ایجوکیشن' : 'GOVERNMENT OF THE PUNJAB · SCHOOL EDUCATION DEPARTMENT'}
            </span>
            <span className="text-emerald-500/80">/</span>
            <span className="text-emerald-300 hidden sm:inline">
              {isDyDEO
                ? (isUrdu ? 'دفتر ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر (Dy. DEO) پنڈی گھیب' : 'Office of Deputy District Education Officer (Dy. DEO) Pindi Gheb')
                : (isUrdu ? 'دفتر معاون تعلیمی افسر (AEO) تحصیل پنڈی گھیب، ضلع اٹک' : 'Office of the Assistant Education Officer (AEO), Tehsil Pindi Gheb, District Attock')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {backupNotice && (
              <span className="text-amber-300 font-semibold text-[11px] flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {backupNotice}
              </span>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-900/90 rounded-md p-0.5 border border-emerald-700/80">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  language === 'en' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors font-urdu ${
                  language === 'ur' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-300 hover:text-white'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>

        {/* Main Header Bar in Green Colour */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand with Mobile Sidebar Hamburger */}
            <div className="flex items-center gap-3">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="p-2 -ml-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg md:hidden transition-colors"
                  aria-label="Toggle navigation pane"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setActiveTab(isDyDEO ? 'credentials' : 'schools')}
                className="flex items-center gap-3 text-left group"
              >
                <SchoolEducationDeptLogo size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug group-hover:text-emerald-200 transition-colors">
                      {isDyDEO
                        ? (isUrdu ? 'دفتر ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر (Dy. DEO)' : 'Office of Dy. DEO Pindi Gheb')
                        : (isUrdu ? 'دفتر اسسٹنٹ ایجوکیشن آفیسر (AEO)' : 'Office of AEO Pindi Gheb')}
                    </h1>
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                      {isDyDEO ? 'Dy. DEO Super Admin' : isAEO ? 'AEO Admin' : 'Official'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 hidden sm:block">
                    {isUrdu
                      ? 'حکومت پنجاب · محکمہ سکول ایجوکیشن · تحصیل پنڈی گھیب، ضلع اٹک'
                      : 'Govt. of the Punjab · School Education Dept · Tehsil Pindi Gheb, District Attock'}
                  </p>
                </div>
              </button>
            </div>

            {/* Right User Status & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                <>
                  {/* Role indicator card */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/70 rounded-lg border border-emerald-700/80">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white leading-tight">
                        {currentUser.displayName}
                      </div>
                      <div className="text-[10px] text-emerald-300 font-mono">
                        {isDyDEO ? (
                          <span className="text-amber-300 font-bold">Dy. DEO (Super Admin)</span>
                        ) : isAEO ? (
                          <span className="text-amber-300 font-semibold">AEO · Markaz {currentUser.assignedMarkaz || ''}</span>
                        ) : isSupervisor ? (
                          <span className="text-blue-300 font-medium">Supervisor (Read-Only)</span>
                        ) : (
                          <span className="text-emerald-300 font-medium">EMIS: {currentUser.username}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Backup / Export Menu */}
                  <div className="hidden lg:flex items-center gap-1">
                    <button
                      onClick={handleDownloadBackup}
                      title="Download JSON Database Backup"
                      className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{isUrdu ? 'بیک اپ' : 'Backup'}</span>
                    </button>

                    <label
                      title="Restore JSON Database Backup"
                      className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{isUrdu ? 'بحالی' : 'Restore'}</span>
                      <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                    </label>
                  </div>

                  {/* Change Password Option for Every User */}
                  <button
                    type="button"
                    onClick={openChangePasswordModal}
                    title={isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
                    className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-emerald-700/60 bg-emerald-900/60"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[11px] font-semibold hidden md:inline">
                      {isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
                    </span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="p-2 text-emerald-200 hover:text-rose-200 hover:bg-rose-900/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm border border-emerald-600 flex items-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </button>
              )}

              {/* Fast switch login modal trigger */}
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-2.5 py-1.5 border border-emerald-700 bg-emerald-950/60 text-emerald-100 hover:bg-emerald-800 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                title="Switch School or Admin Role"
              >
                <span className="hidden sm:inline">{isUrdu ? 'صارف بدلیں' : 'Switch Role'}</span>
                <ChevronDown className="w-3 h-3 text-emerald-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};
