import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  School,
  Users,
  Coins,
  Receipt,
  Building2,
  GraduationCap,
  KeyRound,
  X
} from 'lucide-react';
import { SchoolEducationDeptLogo } from '../common/OfficialLogos';

interface NavTab {
  id: string;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: number | string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingReviewsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenDossierPrint?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const {
    currentUser,
    isDyDEO,
    isAEO,
    isSupervisor
  } = useAuth();
  const { isUrdu } = useLanguage();

  const currentRole = currentUser?.role || (currentUser?.email === 'dydeowpindigheb@gmail.com' ? 'dy_deo' : 'aeo_admin');

  // ONLY the specified tabs for Deputy District Education Officer & Authorized Officers:
  // 1. Credentials
  // 2. Schools Information
  // 3. Enrollment
  // 4. NSB Funds and Expenditures
  // 5. FTF Collection and Expenditures
  // 6. Building and Facilities
  // 7. Staff Information
  // All remaining tabs removed from left pan.
  const officialTabs: NavTab[] = [
    {
      id: 'credentials',
      number: '1',
      label: isUrdu ? 'سرکاری اسناد و پاس ورڈز' : 'Credentials',
      icon: KeyRound,
      roles: ['dy_deo', 'aeo_admin']
    },
    {
      id: 'schools',
      number: '2',
      label: isUrdu ? 'سکولز کی معلومات' : 'Schools Information',
      icon: School,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'enrollment',
      number: '3',
      label: isUrdu ? 'داخلہ اور حاضری' : 'Enrollment',
      icon: Users,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'nsb',
      number: '4',
      label: isUrdu ? 'نان سیلری بجٹ و اخراجات' : 'NSB Funds and Expenditures',
      icon: Coins,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'ftf',
      number: '5',
      label: isUrdu ? 'فروغِ تعلیم فنڈ و اخراجات' : 'FTF Collection and Expenditures',
      icon: Receipt,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'facilities',
      number: '6',
      label: isUrdu ? 'عمارات اور سہولیات' : 'Building and Facilities',
      icon: Building2,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'staff',
      number: '7',
      label: isUrdu ? 'اساتذہ و عملہ کی معلومات' : 'Staff Information',
      icon: GraduationCap,
      roles: ['dy_deo', 'aeo_admin', 'supervisor', 'school_user']
    }
  ];

  const visibleTabs = officialTabs.filter(tab => tab.roles.includes(currentRole));

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Left Pane in Rich Green Colour */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-emerald-950 text-white border-r border-emerald-900 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Left Pane Header with Official School Education Department Logo */}
        <div className="p-3.5 border-b border-emerald-900 bg-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Official School Education Department Logo */}
            <SchoolEducationDeptLogo size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white tracking-tight leading-tight truncate">
                {isUrdu ? 'محکمہ سکول ایجوکیشن' : 'School Education Dept'}
              </div>
              <div className="text-[10px] text-emerald-300 font-medium truncate">
                {isDyDEO
                  ? (isUrdu ? 'دفتر ڈپٹی ڈی ای او پنڈی گھیب' : 'Dy. DEO · Pindi Gheb')
                  : isAEO && currentUser?.assignedMarkaz
                  ? (isUrdu ? `مرکز: ${currentUser.assignedMarkaz}` : `Markaz: ${currentUser.assignedMarkaz}`)
                  : (isUrdu ? 'مرکز پنڈی گھیب · اٹک' : 'Markaz Pindi Gheb · Attock')}
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-emerald-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Navigation Section Title */}
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            {isUrdu ? 'سرکاری ماڈیولز و اختیارات' : 'Official Modules'}
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-semibold">
            {visibleTabs.length} Tabs
          </span>
        </div>

        {/* Scrollable Navigation Items (Exact 7 Tabs, All others removed) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            // Handle matching activeTab
            const isActive =
              activeTab === tab.id ||
              (tab.id === 'credentials' && (activeTab === 'aeo_credentials' || activeTab === 'school_credentials'));

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-sm border-l-4 border-amber-400 translate-x-0.5'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-900/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-emerald-900/80 text-emerald-300 group-hover:bg-emerald-800 group-hover:text-white'
                    }`}
                  >
                    {tab.number}
                  </span>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-300' : 'text-emerald-300 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full shrink-0 ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Left Pane Footer with User Details */}
        <div className="p-3 border-t border-emerald-900 bg-emerald-900/40 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></div>
              <div className="min-w-0">
                <div className="font-semibold text-white text-[11px] truncate">
                  {currentUser?.displayName}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono truncate">
                  {isDyDEO ? (
                    <span className="text-amber-300 font-bold">Dy. DEO (Super Admin)</span>
                  ) : isAEO ? (
                    'AEO Administrator'
                  ) : isSupervisor ? (
                    'Supervisor (Read-Only)'
                  ) : (
                    `EMIS: ${currentUser?.username}`
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
