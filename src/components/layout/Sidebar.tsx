import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSchools } from '../../services/storage';
import {
  LayoutDashboard,
  School,
  Users,
  Coins,
  Receipt,
  Building2,
  GraduationCap,
  FileCheck,
  SendHorizontal,
  FileSpreadsheet,
  History,
  Shield,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronDown,
  X,
  FileText
} from 'lucide-react';

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
  pendingReviewsCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const {
    currentUser,
    currentSchool,
    isAEO,
    isSupervisor,
    isSchoolUser,
    selectedSchoolEmis,
    setSelectedSchoolEmis
  } = useAuth();
  const { t, isUrdu } = useLanguage();

  const schools = getSchools();
  const currentRole = currentUser?.role || 'aeo_admin';

  // Primary Sections for the Left Pane with Tabs
  const navigationGroups = [
    {
      groupTitle: isUrdu ? 'مرکزی جائزہ و فہرست' : 'Central Monitoring',
      tabs: [
        {
          id: 'dashboard',
          label: isUrdu ? 'ڈیش بورڈ' : 'Dashboard',
          icon: LayoutDashboard,
          roles: ['aeo_admin', 'supervisor']
        },
        {
          id: 'schools',
          label: isUrdu ? 'سکولز' : 'Schools',
          icon: School,
          roles: ['aeo_admin', 'supervisor']
        }
      ]
    },
    {
      groupTitle: isUrdu ? 'سکول ڈیٹا ماڈیولز (School-Wise)' : 'School Data Modules',
      tabs: [
        {
          id: 'profile',
          label: isUrdu ? 'سکول پروفائل' : 'School Profile',
          icon: FileText,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'enrollment',
          label: isUrdu ? 'داخلہ اور حاضری' : 'Enrollment and Attendance',
          icon: Users,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'nsb',
          label: isUrdu ? 'نان سیلری بجٹ و اخراجات' : 'NSB Funds and Expenditure',
          icon: Coins,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'ftf',
          label: isUrdu ? 'فروغِ تعلیم فنڈ رجسٹر' : 'FTF Collections and registers',
          icon: Receipt,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'facilities',
          label: isUrdu ? 'عمارات اور سہولیات' : 'Building and Facilities',
          icon: Building2,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'staff',
          label: isUrdu ? 'اساتذہ اور عملہ' : 'Teachers & Staff',
          icon: GraduationCap,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'documents',
          label: isUrdu ? 'دستاویزات و بلز' : 'Document Evidence & Photos',
          icon: FileCheck,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        }
      ]
    },
    {
      groupTitle: isUrdu ? 'توثیق و رپورٹس' : 'Verification & Reports',
      tabs: [
        {
          id: 'submission',
          label: isUrdu ? 'کوائف جمع و توثیق' : 'Submissions & Verification',
          icon: SendHorizontal,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'reports',
          label: isUrdu ? 'رپورٹس اور ایکسل برآمد' : 'Reports & Exports',
          icon: FileSpreadsheet,
          roles: ['aeo_admin', 'supervisor', 'school_user']
        },
        {
          id: 'audit',
          label: isUrdu ? 'سسٹم آڈٹ ٹریل' : 'System Audit Logs',
          icon: History,
          roles: ['aeo_admin', 'supervisor']
        }
      ]
    }
  ];

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
        {/* Left Pane Header */}
        <div className="p-4 border-b border-emerald-900 bg-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-emerald-500/40">
              AEO
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight leading-tight">
                {isUrdu ? 'سکول ڈیٹا مینجمنٹ سسٹم' : 'AEO School Portal'}
              </div>
              <div className="text-[10px] text-emerald-300 font-medium">
                {isUrdu ? 'مرکز پنڈی گھیب · اٹک' : 'Markaz Pindi Gheb · Attock'}
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

        {/* Selected School Context Indicator (School-Wise Mode) */}
        <div className="p-3 bg-emerald-900/40 border-b border-emerald-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between mb-1">
            <span>{isUrdu ? 'منتخب سکول (School-Wise):' : 'Focus School Record:'}</span>
            {isSchoolUser && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-700 text-white rounded font-bold">
                My School
              </span>
            )}
          </div>

          {(isAEO || isSupervisor) ? (
            <div className="relative">
              <select
                value={selectedSchoolEmis || ''}
                onChange={e => setSelectedSchoolEmis(e.target.value || null)}
                className="w-full text-xs font-semibold bg-emerald-900 border border-emerald-700 text-white rounded-lg py-1.5 px-2.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer shadow-2xs truncate"
              >
                <option value="" className="bg-emerald-950 text-white">
                  {isUrdu ? 'تمام سکولز (مرکزی جائزہ)' : 'Cluster Overview (All Schools)'}
                </option>
                {schools.map(s => (
                  <option key={s.emisCode} value={s.emisCode} className="bg-emerald-950 text-white">
                    {s.emisCode} - {s.name} ({s.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          ) : (
            <div className="bg-emerald-900/80 border border-emerald-700/80 rounded-lg p-2 text-white">
              <div className="text-xs font-bold text-white truncate">
                {currentSchool?.name}
              </div>
              <div className="text-[10px] text-emerald-200 font-mono mt-0.5 flex items-center gap-2">
                <span>EMIS: {currentSchool?.emisCode}</span>
                <span>·</span>
                <span className="font-sans text-amber-300 font-semibold">{currentSchool?.category}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navigationGroups.map((group, groupIdx) => {
            const visibleGroupTabs = group.tabs.filter(tab => tab.roles.includes(currentRole));
            if (visibleGroupTabs.length === 0) return null;

            return (
              <div key={groupIdx}>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {group.groupTitle}
                </div>
                <div className="space-y-0.5">
                  {visibleGroupTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left group ${
                          isActive
                            ? 'bg-emerald-700 text-white font-bold shadow-xs border-l-4 border-amber-400'
                            : 'text-emerald-100 hover:text-white hover:bg-emerald-900/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
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
                </div>
              </div>
            );
          })}
        </nav>

        {/* Left Pane Footer with Green Palette */}
        <div className="p-3 border-t border-emerald-900 bg-emerald-900/40 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></div>
              <div className="min-w-0">
                <div className="font-semibold text-white text-[11px] truncate">
                  {currentUser?.displayName}
                </div>
                <div className="text-[10px] text-emerald-300 font-mono">
                  {isAEO ? 'AEO Administrator' : isSupervisor ? 'Supervisor (Read-Only)' : `EMIS: ${currentUser?.username}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
