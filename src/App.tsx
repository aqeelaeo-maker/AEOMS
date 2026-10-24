import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PasswordChangeModal } from './components/auth/PasswordChangeModal';
import { SignInPage } from './components/auth/SignInPage';
import { AeoDashboard } from './components/dashboard/AeoDashboard';
import { SchoolsListView } from './components/school/SchoolsListView';
import { SchoolProfileView } from './components/school/SchoolProfileView';
import { EnrollmentModule } from './components/school/EnrollmentModule';
import { NSBModule } from './components/school/NSBModule';
import { FTFModule } from './components/school/FTFModule';
import { FacilitiesModule } from './components/school/FacilitiesModule';
import { StaffModule } from './components/school/StaffModule';
import { DocumentsModule } from './components/school/DocumentsModule';
import { SubmissionWorkflow } from './components/school/SubmissionWorkflow';
import { ReportsHub } from './components/reports/ReportsHub';
import { OfficialDossierPrint } from './components/reports/OfficialDossierPrint';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { AeoCredentialsManager } from './components/auth/AeoCredentialsManager';
import { SchoolCredentialsManager } from './components/auth/SchoolCredentialsManager';
import { CredentialsManagementHub } from './components/auth/CredentialsManagementHub';
import { SchoolEducationDeptLogo } from './components/common/OfficialLogos';
import { getSchools, getSubmissions, getSchoolByEmis, getSubmissionBySchool } from './services/storage';
import { SchoolQuickSubmitModal } from './components/school/SchoolQuickSubmitModal';
import {
  School as SchoolIcon,
  ArrowLeft,
  ChevronDown,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  SendHorizontal,
  Award,
  Filter
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    allowedSchools,
    isDyDEO,
    isAEO,
    isSupervisor,
    isSchoolUser,
    selectedSchoolEmis,
    setSelectedSchoolEmis
  } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return isDyDEO ? 'credentials' : 'schools';
  });

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [printDossierSchoolEmis, setPrintDossierSchoolEmis] = useState<string | null>(null);
  const [topMarkazFilter, setTopMarkazFilter] = useState<string>('all');
  const [isSchoolSubmitModalOpen, setIsSchoolSubmitModalOpen] = useState(false);

  const schools = allowedSchools;
  const submissions = getSubmissions();
  const pendingReviewsCount = submissions.filter(
    s => s.status === 'submitted' || s.status === 'under_review'
  ).length;

  const allMarkazOptions = React.useMemo(() => {
    return Array.from(new Set(getSchools().map(s => s.markaz))).filter(Boolean);
  }, []);

  const displayedSwitcherSchools = isDyDEO && topMarkazFilter !== 'all'
    ? schools.filter(s => s.markaz === topMarkazFilter)
    : schools;

  // Active target school:
  // If school user, ALWAYS their assigned school. If AEO, their markaz schools.
  const activeSchool = currentSchool || (schools.length > 0 ? schools[0] : null);
  const schoolSubmission = activeSchool ? getSubmissionBySchool(activeSchool.emisCode) : undefined;

  const handleSelectSchoolFromDashboard = (emisCode: string, targetTab: string = 'enrollment') => {
    setSelectedSchoolEmis(emisCode);
    setActiveTab(targetTab === 'profile' ? 'enrollment' : targetTab);
  };

  const handleOpenPrintDossier = (emisCode?: string) => {
    const target = emisCode || activeSchool?.emisCode;
    if (target) {
      setPrintDossierSchoolEmis(target);
    }
  };

  const printSchool = printDossierSchoolEmis ? getSchoolByEmis(printDossierSchoolEmis) || null : null;

  const isSchoolModule = [
    'schools',
    'enrollment',
    'nsb',
    'ftf',
    'facilities',
    'staff'
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Panel (Green Header) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDossierPrint={() => handleOpenPrintDossier()}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
      />

      {/* Main Layout: Left Pane (Green Sidebar with Tabs) + Right Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane in Green */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingReviewsCount={isAEO ? pendingReviewsCount : undefined}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          onOpenDossierPrint={() => handleOpenPrintDossier()}
        />

        {/* Right Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* School-Wise Context Inspection Bar */}
          {isSchoolModule && activeSchool && (
            <div className="bg-emerald-950 text-white px-4 sm:px-6 py-2.5 border-b border-emerald-900 shrink-0 shadow-2xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* School Details & Identification */}
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 border border-emerald-600 font-bold">
                    <SchoolIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-sm text-white truncate">{activeSchool.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                        EMIS: {activeSchool.emisCode}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-800 text-emerald-100">
                        {activeSchool.category} · {activeSchool.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-300 truncate">
                      {isUrdu ? 'ہیڈ ٹیچر:' : 'Head Teacher:'} {activeSchool.headTeacherName} ({activeSchool.headTeacherPhone}) · Markaz: {activeSchool.markaz}
                    </div>
                  </div>
                </div>

                {/* Quick Switcher for Dy. DEO / AEO / Supervisor */}
                {(isAEO || isSupervisor || isDyDEO) && (
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Dy. DEO Markaz Selector */}
                    {isDyDEO && (
                      <div className="relative">
                        <select
                          value={topMarkazFilter}
                          onChange={e => {
                            const newM = e.target.value;
                            setTopMarkazFilter(newM);
                            if (newM !== 'all') {
                              const firstInM = schools.find(s => s.markaz === newM);
                              if (firstInM) setSelectedSchoolEmis(firstInM.emisCode);
                            }
                          }}
                          className="text-xs bg-emerald-900 border border-emerald-700 text-amber-300 font-semibold rounded-lg py-1.5 px-2.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[170px] truncate"
                          title="Filter schools by Markaz Name"
                        >
                          <option value="all" className="bg-emerald-950 text-white">All Markazes</option>
                          {allMarkazOptions.map(m => (
                            <option key={m} value={m} className="bg-emerald-950 text-white">
                              Markaz {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-amber-300 absolute right-2 top-2.5 pointer-events-none" />
                      </div>
                    )}

                    {/* School Switcher */}
                    <div className="relative">
                      <select
                        value={selectedSchoolEmis || activeSchool.emisCode}
                        onChange={e => setSelectedSchoolEmis(e.target.value)}
                        className="text-xs bg-emerald-900 border border-emerald-700 text-white rounded-lg py-1.5 px-2.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[210px] truncate"
                      >
                        {displayedSwitcherSchools.map(s => (
                          <option key={s.emisCode} value={s.emisCode} className="bg-emerald-950 text-white">
                            {s.emisCode} - {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-300 absolute right-2 top-2.5 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('schools')}
                      className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border border-emerald-600 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'تمام سکولز لسٹ' : 'All Schools'}</span>
                    </button>
                  </div>
                )}

                {/* For School Users: Submission Status & Action Button */}
                {isSchoolUser && (
                  <div className="flex items-center gap-2 shrink-0">
                    {schoolSubmission?.status === 'approved' && (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approved & Verified</span>
                      </span>
                    )}
                    {(schoolSubmission?.status === 'submitted' || schoolSubmission?.status === 'under_review') && (
                      <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submitted · Under Review</span>
                      </span>
                    )}
                    {schoolSubmission?.status === 'returned' && (
                      <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                        <span>Returned for Correction</span>
                      </span>
                    )}
                    {!schoolSubmission?.status && (
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                        Draft (In Progress)
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsSchoolSubmitModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <SendHorizontal className="w-3.5 h-3.5 text-slate-950" />
                      <span>
                        {schoolSubmission?.status === 'returned'
                          ? (isUrdu ? 'درست شدہ کوائف بھیجیں' : 'Resubmit Data')
                          : (isUrdu ? 'کوائف AEO کو جمع کروائیں' : 'Submit School Data')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module Views (7 Official Tabs) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* 1. Credentials Hub (Dy. DEO full CRUD over AEOs and School credentials; AEO manages Markaz schools) */}
            {(activeTab === 'credentials' || activeTab === 'aeo_credentials' || activeTab === 'school_credentials') && (
              <CredentialsManagementHub />
            )}

            {/* 2. Schools Information (Schools Management List, Add, Edit, Delete, Inspect) */}
            {activeTab === 'schools' && (
              <SchoolsListView
                onInspectSchool={handleSelectSchoolFromDashboard}
                onOpenPrintDossier={handleOpenPrintDossier}
              />
            )}

            {/* 3. Enrollment and Attendance View */}
            {activeTab === 'enrollment' && activeSchool && (
              <EnrollmentModule school={activeSchool} />
            )}

            {/* 4. NSB Funds and Expenditure View */}
            {activeTab === 'nsb' && activeSchool && (
              <NSBModule school={activeSchool} />
            )}

            {/* 5. FTF Collection and Expenditures View */}
            {activeTab === 'ftf' && activeSchool && (
              <FTFModule school={activeSchool} />
            )}

            {/* 6. Building and Facilities View */}
            {activeTab === 'facilities' && activeSchool && (
              <FacilitiesModule school={activeSchool} />
            )}

            {/* 7. Staff Information View */}
            {activeTab === 'staff' && activeSchool && (
              <StaffModule school={activeSchool} />
            )}

            {/* Fallbacks for any legacy / direct navigations */}
            {activeTab === 'profile' && activeSchool && (
              <SchoolProfileView school={activeSchool} />
            )}
            {activeTab === 'submission' && activeSchool && (
              <SubmissionWorkflow
                school={activeSchool}
                onOpenOfficialPrint={() => handleOpenPrintDossier(activeSchool.emisCode)}
              />
            )}
            {activeTab === 'reports' && (
              <ReportsHub onOpenDossierPrint={handleOpenPrintDossier} />
            )}
            {activeTab === 'audit' && (
              <AuditTrailView />
            )}
            {activeTab === 'dashboard' && (
              <SchoolsListView
                onInspectSchool={handleSelectSchoolFromDashboard}
                onOpenPrintDossier={handleOpenPrintDossier}
              />
            )}
          </main>

          {/* Official Footer with School Education Department Logo */}
          <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SchoolEducationDeptLogo size="xs" />
                <span className="font-semibold text-slate-700">
                  {isUrdu
                    ? 'حکومت پنجاب · محکمہ سکول ایجوکیشن · دفتر ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر (Dy. DEO)'
                    : 'Govt. of the Punjab · School Education Dept · Office of Deputy District Education Officer (Dy. DEO)'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                Tehsil Pindi Gheb · District Attock · Session 2026-27
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Official Dossier Printable Modal */}
      {printSchool && (
        <OfficialDossierPrint
          school={printSchool}
          onClose={() => setPrintDossierSchoolEmis(null)}
        />
      )}

      {/* School Quick Submit Modal for School Users */}
      {isSchoolSubmitModalOpen && activeSchool && (
        <SchoolQuickSubmitModal
          school={activeSchool}
          isOpen={isSchoolSubmitModalOpen}
          onClose={() => setIsSchoolSubmitModalOpen(false)}
          onSubmitted={() => {
            if (activeSchool) {
              setSelectedSchoolEmis(activeSchool.emisCode);
            }
          }}
        />
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!currentUser || !isAuthenticated) {
    return <SignInPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
