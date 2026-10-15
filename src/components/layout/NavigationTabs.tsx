import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
  History
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingReviewsCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  pendingReviewsCount = 0
}) => {
  const { isSchoolUser, currentSchool, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const tabs = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      roles: ['aeo_admin', 'supervisor']
    },
    {
      id: 'schools',
      label: isUrdu ? 'تمام سکول لسٹ' : 'Schools Directory',
      icon: School,
      roles: ['aeo_admin', 'supervisor']
    },
    {
      id: 'profile',
      label: t('schoolProfile'),
      icon: School,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'enrollment',
      label: t('enrollment'),
      icon: Users,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'nsb',
      label: t('nsbFunds'),
      icon: Coins,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'ftf',
      label: t('ftfFunds'),
      icon: Receipt,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'facilities',
      label: t('buildingFacilities'),
      icon: Building2,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'staff',
      label: t('teachersStaff'),
      icon: GraduationCap,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'documents',
      label: t('documentUploads'),
      icon: FileCheck,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'submission',
      label: t('submissionsVerification'),
      icon: SendHorizontal,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'reports',
      label: t('reportsAnalytics'),
      icon: FileSpreadsheet,
      roles: ['aeo_admin', 'supervisor', 'school_user']
    },
    {
      id: 'audit',
      label: t('auditTrail'),
      icon: History,
      roles: ['aeo_admin', 'supervisor']
    }
  ];

  const currentRole = currentUser?.role || 'aeo_admin';
  const visibleTabs = tabs.filter(tab => tab.roles.includes(currentRole));

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'
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
    </div>
  );
};
