import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { PasswordChangeModal } from './components/auth/PasswordChangeModal';
import { AeoDashboard } from './components/dashboard/AeoDashboard';
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
import { getSchools, getSubmissions, getSchoolByEmis } from './services/storage';
import { School as SchoolIcon, ArrowLeft, Shield, Eye, AlertCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, currentSchool, isAEO, isSupervisor, isSchoolUser, selectedSchoolEmis, setSelectedSchoolEmis } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return isSchoolUser ? 'profile' : 'dashboard';
  });

  const [printDossierSchoolEmis, setPrintDossierSchoolEmis] = useState<string | null>(null);

  const schools = getSchools();
  const submissions = getSubmissions();
  const pendingReviewsCount = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;

  // Active target school:
  // If school user, ALWAYS their assigned school. If AEO or Supervisor, the selected school or first school fallback.
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDossierPrint={() => handleOpenPrintDossier()}
      />

      {/* Navigation Sub-Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReviewsCount={isAEO ? pendingReviewsCount : undefined}
      />

      {/* Focus School Notification Bar for AEO / Supervisor */}
      {(isAEO || isSupervisor) && selectedSchoolEmis && activeTab !== 'dashboard' && activeTab !== 'reports' && activeTab !== 'audit' && (
        <div className="bg-emerald-950 text-emerald-100 px-4 py-2 border-b border-emerald-800 text-xs flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-emerald-400" />
              <span>
                {isUrdu ? 'آپ اس وقت معائنہ کر رہے ہیں:' : 'Currently Inspecting Record for:'}{' '}
                <strong className="text-white font-bold">{activeSchool?.name}</strong>{' '}
                <span className="font-mono text-emerald-300">(EMIS: {selectedSchoolEmis})</span>
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedSchoolEmis(null);
                setActiveTab('dashboard');
              }}
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'کلسٹر جائزہ پر واپس جائیں' : 'Back to Cluster Overview'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Schools Directory View */}
        {activeTab === 'schools' && (
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

        {/* School Profile View */}
        {activeTab === 'profile' && activeSchool && (
          <SchoolProfileView school={activeSchool} />
        )}

        {/* Enrollment View */}
        {activeTab === 'enrollment' && activeSchool && (
          <EnrollmentModule school={activeSchool} />
        )}

        {/* NSB Funds View */}
        {activeTab === 'nsb' && activeSchool && (
          <NSBModule school={activeSchool} />
        )}

        {/* FTF Funds View */}
        {activeTab === 'ftf' && activeSchool && (
          <FTFModule school={activeSchool} />
        )}

        {/* Building & Facilities View */}
        {activeTab === 'facilities' && activeSchool && (
          <FacilitiesModule school={activeSchool} />
        )}

        {/* Staff & Teachers View */}
        {activeTab === 'staff' && activeSchool && (
          <StaffModule school={activeSchool} />
        )}

        {/* Documents & Photo Evidence View */}
        {activeTab === 'documents' && activeSchool && (
          <DocumentsModule school={activeSchool} />
        )}

        {/* Submission & Approval Workflow View */}
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

        {/* Audit Trail View */}
        {activeTab === 'audit' && (isAEO || isSupervisor) && (
          <AuditTrailView />
        )}
      </main>

      {/* Official Dossier Printable Modal */}
      {printSchool && (
        <OfficialDossierPrint
          school={printSchool}
          onClose={() => setPrintDossierSchoolEmis(null)}
        />
      )}

      {/* Mandatory Password Change Modal if account requires it */}
      <PasswordChangeModal />

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {isUrdu
              ? 'معاون تعلیمی افسر (AEO) سکول ڈیٹا مینجمنٹ سسٹم · حکومت پنجاب'
              : 'Assistant Education Officer (AEO) School Data Management System · Govt. of the Punjab'}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Cluster Markaz Pindi Gheb · District Attock · Academic Year 2026-27
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
