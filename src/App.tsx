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
import { getSchools, getSubmissions, getSchoolByEmis } from './services/storage';
import { School as SchoolIcon, ArrowLeft, ChevronDown, Eye, CheckCircle2 } from 'lucide-react';

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
    return isSchoolUser ? 'profile' : 'dashboard';
  });

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [printDossierSchoolEmis, setPrintDossierSchoolEmis] = useState<string | null>(null);

  const schools = allowedSchools;
  const submissions = getSubmissions();
  const pendingReviewsCount = submissions.filter(
    s => s.status === 'submitted' || s.status === 'under_review'
  ).length;

  // Active target school:
  // If school user, ALWAYS their assigned school. If AEO, their markaz schools.
  const activeSchool = currentSchool || (schools.length > 0 ? schools[0] : null);

  const handleSelectSchoolFromDashboard = (emisCode: string, targetTab: string = 'profile') => {
    setSelectedSchoolEmis(emisCode);
    setActiveTab(targetTab);
  };

  const handleOpenPrintDossier = (emisCode?: string) => {
    const target = emisCode || activeSchool?.emisCode;
    if (target) {
      setPrintDossierSchoolEmis(target);
    }
  };

  const printSchool = printDossierSchoolEmis ? getSchoolByEmis(printDossierSchoolEmis) || null : null;

  const isSchoolModule = [
    'profile',
    'enrollment',
    'nsb',
    'ftf',
    'facilities',
    'staff',
    'documents',
    'submission'
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

                {/* Quick School Switcher & Actions for AEO / Supervisor */}
                {(isAEO || isSupervisor) && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={selectedSchoolEmis || activeSchool.emisCode}
                        onChange={e => setSelectedSchoolEmis(e.target.value)}
                        className="text-xs bg-emerald-900 border border-emerald-700 text-white rounded-lg py-1.5 px-2.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[210px] truncate"
                      >
                        {schools.map(s => (
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
              </div>
            </div>
          )}

          {/* Module Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <AeoDashboard
                onSelectSchool={handleSelectSchoolFromDashboard}
                onOpenSubmissionReview={(subId) => {
                  const sub = submissions.find(s => s.id === subId);
                  if (sub) {
                    setSelectedSchoolEmis(sub.schoolEmisCode);
                    setActiveTab('submission');
                  }
                }}
              />
            )}

            {/* Schools Management List View (Add, Edit, Delete, Inspect) */}
            {activeTab === 'schools' && (
              <SchoolsListView
                onInspectSchool={handleSelectSchoolFromDashboard}
              />
            )}

            {/* School Profile View */}
            {activeTab === 'profile' && activeSchool && (
              <SchoolProfileView school={activeSchool} />
            )}

            {/* Enrollment and Attendance View */}
            {activeTab === 'enrollment' && activeSchool && (
              <EnrollmentModule school={activeSchool} />
            )}

            {/* NSB Funds and Expenditure View */}
            {activeTab === 'nsb' && activeSchool && (
              <NSBModule school={activeSchool} />
            )}

            {/* FTF Collections and registers View */}
            {activeTab === 'ftf' && activeSchool && (
              <FTFModule school={activeSchool} />
            )}

            {/* Building and Facilities View */}
            {activeTab === 'facilities' && activeSchool && (
              <FacilitiesModule school={activeSchool} />
            )}

            {/* Teachers & Staff View */}
            {activeTab === 'staff' && activeSchool && (
              <StaffModule school={activeSchool} />
            )}

            {/* Evidence & Documents View */}
            {activeTab === 'documents' && activeSchool && (
              <DocumentsModule school={activeSchool} />
            )}

            {/* Submissions & Verification View */}
            {activeTab === 'submission' && activeSchool && (
              <SubmissionWorkflow
                school={activeSchool}
                onOpenOfficialPrint={() => handleOpenPrintDossier(activeSchool.emisCode)}
              />
            )}

            {/* Reports & Exports View */}
            {activeTab === 'reports' && (
              <ReportsHub onOpenDossierPrint={handleOpenPrintDossier} />
            )}

            {/* AEO Credentials Management (Dy. DEO exclusive) */}
            {activeTab === 'aeo_credentials' && isDyDEO && (
              <AeoCredentialsManager />
            )}

            {/* School Credentials Management (AEO & Dy. DEO) */}
            {activeTab === 'school_credentials' && (isAEO || isDyDEO) && (
              <SchoolCredentialsManager />
            )}

            {/* System Audit Logs View */}
            {activeTab === 'audit' && (isAEO || isSupervisor || isDyDEO) && (
              <AuditTrailView />
            )}
          </main>

          {/* Official Footer */}
          <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                {isUrdu
                  ? 'معاون تعلیمی افسر (AEO) سکول ڈیٹا مینجمنٹ سسٹم · حکومت پنجاب'
                  : 'Assistant Education Officer (AEO) School Data Management System · Govt. of the Punjab'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Markaz Pindi Gheb · District Attock · Academic Year 2026-27
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
