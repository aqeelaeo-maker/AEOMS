import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getSchools,
  getEnrollment,
  getNSB,
  getFacilities,
  getStaff,
  getSubmissions
} from '../../services/storage';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Table,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  Coins
} from 'lucide-react';

interface ReportsHubProps {
  onOpenDossierPrint: (emisCode: string) => void;
}

export const ReportsHub: React.FC<ReportsHubProps> = ({ onOpenDossierPrint }) => {
  const { isAEO, isSupervisor, currentSchool } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [activeReportType, setActiveReportType] = useState<
    'consolidated' | 'nsb_audit' | 'facilities_gap' | 'enrollment_register'
  >('consolidated');

  const schools = getSchools();
  const submissions = getSubmissions();

  // Helper to trigger direct CSV file download with UTF-8 BOM
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for perfect Excel rendering in Urdu and English
      [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export 1: Consolidated Cluster Report
  const exportConsolidatedCSV = () => {
    const headers = [
      'EMIS Code',
      'School Name',
      'Category',
      'Level',
      'Gender Policy',
      'Tehsil',
      'Markaz',
      'Head Teacher',
      'Contact',
      'Total Enrolled',
      'Boys',
      'Girls',
      'NSB Received (PKR)',
      'NSB Spent (PKR)',
      'NSB Balance (PKR)',
      'Classrooms',
      'Dangerous Rooms',
      'Boundary Wall',
      'Drinking Water',
      'Solar Power',
      'Submission Status',
      'Approval Certificate'
    ];

    const rows = schools.map(s => {
      const enr = getEnrollment(s.emisCode);
      const nsb = getNSB(s.emisCode);
      const fac = getFacilities(s.emisCode);
      const sub = submissions.find(x => x.schoolEmisCode === s.emisCode);

      return [
        s.emisCode,
        s.name,
        s.category,
        s.level,
        s.gender,
        s.tehsil,
        s.markaz,
        s.headTeacherName,
        s.headTeacherPhone,
        enr ? enr.grandTotal : 0,
        enr ? enr.totalBoys : 0,
        enr ? enr.totalGirls : 0,
        nsb ? nsb.totalReceived : 0,
        nsb ? nsb.totalExpenditure : 0,
        nsb ? nsb.currentBalance : 0,
        fac ? fac.totalClassrooms : 0,
        fac ? fac.dangerousClassrooms : 0,
        fac ? fac.boundaryWallStatus : 'Unknown',
        fac ? fac.drinkingWaterSource : 'Unknown',
        fac?.solarInstalled ? 'Installed' : 'No',
        sub ? sub.status : 'draft',
        sub?.approvalCertificateNumber || 'N/A'
      ];
    });

    downloadCSV(`AEO_Consolidated_Cluster_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // Export 2: NSB Financial Audit Report
  const exportNsbAuditCSV = () => {
    const headers = [
      'EMIS Code',
      'School Name',
      'Category',
      'Bank Account Number',
      'Total Allocation (PKR)',
      'Total Received (PKR)',
      'Total Spent (PKR)',
      'Remaining Balance (PKR)',
      'Cleaning & Hygiene',
      'Repair & Maintenance',
      'Stationery & Exam',
      'Utility Bills',
      'Instructional Aids',
      'IT Maintenance',
      'Sports',
      'Vouchers Count'
    ];

    const rows = schools.map(s => {
      const nsb = getNSB(s.emisCode);
      const heads = nsb.expendituresByHead || {};
      return [
        s.emisCode,
        s.name,
        s.category,
        nsb.accountNumber,
        nsb.totalAnnualAllocation,
        nsb.totalReceived,
        nsb.totalExpenditure,
        nsb.currentBalance,
        heads['School Cleaning & Hygiene'] || 0,
        heads['Minor Repair & Maintenance'] || 0,
        heads['Stationery & Examination'] || 0,
        heads['Utility Bills (Electricity/Water/Gas)'] || 0,
        heads['Instructional Aids & TLM'] || 0,
        heads['IT / Computer Lab Maintenance'] || 0,
        heads['Sports & Co-Curricular'] || 0,
        nsb.transactions.length
      ];
    });

    downloadCSV(`AEO_NSB_Financial_Audit_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // Export 3: Facilities Hazard & Gap Analysis
  const exportFacilitiesCSV = () => {
    const headers = [
      'EMIS Code',
      'School Name',
      'Ownership',
      'Total Land (Marlas)',
      'Total Classrooms',
      'Classrooms In Use',
      'Dangerous Classrooms (Hazard)',
      'Needs Repair Rooms',
      'Boundary Wall Condition',
      'Electricity Status',
      'Drinking Water Source',
      'Student Functional Toilets',
      'Staff Functional Toilets',
      'Solar Installed',
      'Solar Capacity (kW)',
      'Computer Lab'
    ];

    const rows = schools.map(s => {
      const fac = getFacilities(s.emisCode);
      return [
        s.emisCode,
        s.name,
        fac.ownership,
        fac.totalAreaMarlas,
        fac.totalClassrooms,
        fac.classroomsInUse,
        fac.dangerousClassrooms,
        fac.needsRepairClassrooms,
        fac.boundaryWallStatus,
        fac.electricityStatus,
        fac.drinkingWaterSource,
        fac.studentToiletsFunctional,
        fac.staffToiletsFunctional,
        fac.solarInstalled ? 'Yes' : 'No',
        fac.solarCapacityKw,
        fac.computerLab ? 'Yes' : 'No'
      ];
    });

    downloadCSV(`AEO_Facilities_Gap_Analysis_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'سرکاری رپورٹس، ایکسل برآمد و پرنٹنگ مرکز' : 'Reports Hub & Official Excel / PDF Exports'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'کلسٹر کی سطح پر کوائف، مالیاتی آڈٹ اور خستہ حال عمارات کی رپورٹس' : 'Standardized MIS reports formatted for School Education Department Punjab'}
            </p>
          </div>
        </div>

        {/* Global CSV Download Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeReportType === 'consolidated') exportConsolidatedCSV();
              else if (activeReportType === 'nsb_audit') exportNsbAuditCSV();
              else exportFacilitiesCSV();
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isUrdu ? 'ایکسل (CSV) فائل ڈاؤن لوڈ کریں' : 'Download Excel (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveReportType('consolidated')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeReportType === 'consolidated'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isUrdu ? 'مجموعی کلسٹر سمری' : 'Consolidated Markaz Summary'}
        </button>

        <button
          onClick={() => setActiveReportType('nsb_audit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeReportType === 'nsb_audit'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isUrdu ? 'نان سیلری بجٹ (NSB) مالیاتی آڈٹ' : 'NSB Financial Audit Ledger'}
        </button>

        <button
          onClick={() => setActiveReportType('facilities_gap')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeReportType === 'facilities_gap'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isUrdu ? 'عمارات و خطرات تجزیہ (Facilities Gap)' : 'Facilities & Hazard Analysis'}
        </button>
      </div>

      {/* Render Active Table Report */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {activeReportType === 'consolidated' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Markaz Pindi Gheb - Master School Dossier Status
              </h3>
              <span className="text-xs font-mono text-slate-500">{schools.length} Schools</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">EMIS</th>
                    <th className="py-3 px-4">School Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Enrollment</th>
                    <th className="py-3 px-4">NSB Spent (PKR)</th>
                    <th className="py-3 px-4">Classrooms</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {schools.map(s => {
                    const enr = getEnrollment(s.emisCode);
                    const nsb = getNSB(s.emisCode);
                    const fac = getFacilities(s.emisCode);
                    const sub = submissions.find(x => x.schoolEmisCode === s.emisCode);

                    return (
                      <tr key={s.emisCode} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">
                          {s.emisCode}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {s.category} ({s.level})
                        </td>
                        <td className="py-2.5 px-4 font-mono tabular-nums font-bold">
                          {enr ? enr.grandTotal : 0}
                        </td>
                        <td className="py-2.5 px-4 font-mono tabular-nums">
                          Rs. {nsb ? nsb.totalExpenditure.toLocaleString() : 0}
                        </td>
                        <td className="py-2.5 px-4">
                          {fac ? `${fac.totalClassrooms} (${fac.dangerousClassrooms} Dangerous)` : 'N/A'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`capitalize font-semibold ${
                            sub?.status === 'approved' ? 'text-emerald-700' :
                            sub?.status === 'returned' ? 'text-rose-700' : 'text-amber-700'
                          }`}>
                            {sub?.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenDossierPrint(s.emisCode)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportType === 'nsb_audit' && (
          <div>
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Non-Salary Budget (NSB) Financial Utilization & Bank Balances
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 font-sans">
                  <tr>
                    <th className="py-3 px-4">EMIS Code</th>
                    <th className="py-3 px-4">School</th>
                    <th className="py-3 px-4">Received</th>
                    <th className="py-3 px-4">Spent</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Cleaning</th>
                    <th className="py-3 px-4">Repair</th>
                    <th className="py-3 px-4">Utilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map(s => {
                    const nsb = getNSB(s.emisCode);
                    const heads = nsb.expendituresByHead || {};
                    return (
                      <tr key={s.emisCode} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{s.emisCode}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">Rs. {nsb.totalReceived.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-rose-700 font-bold">Rs. {nsb.totalExpenditure.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-emerald-800 font-bold">Rs. {nsb.currentBalance.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-slate-600">Rs. {(heads['School Cleaning & Hygiene'] || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-slate-600">Rs. {(heads['Minor Repair & Maintenance'] || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-slate-600">Rs. {(heads['Utility Bills (Electricity/Water/Gas)'] || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportType === 'facilities_gap' && (
          <div>
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Infrastructure Vulnerabilities & Basic Facilities Inventory
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">EMIS</th>
                    <th className="py-3 px-4">School</th>
                    <th className="py-3 px-4">Classrooms</th>
                    <th className="py-3 px-4">Dangerous Rooms</th>
                    <th className="py-3 px-4">Boundary Wall</th>
                    <th className="py-3 px-4">Water Source</th>
                    <th className="py-3 px-4">Electricity</th>
                    <th className="py-3 px-4">Solar Power</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map(s => {
                    const fac = getFacilities(s.emisCode);
                    return (
                      <tr key={s.emisCode} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.emisCode}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-4 font-mono">{fac.totalClassrooms}</td>
                        <td className="py-2.5 px-4">
                          {fac.dangerousClassrooms > 0 ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {fac.dangerousClassrooms} Dilapidated
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={fac.boundaryWallStatus === 'Satisfactory' ? 'text-emerald-700' : 'text-rose-700 font-semibold'}>
                            {fac.boundaryWallStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{fac.drinkingWaterSource}</td>
                        <td className="py-2.5 px-4 text-slate-700">{fac.electricityStatus}</td>
                        <td className="py-2.5 px-4">
                          {fac.solarInstalled ? (
                            <span className="text-emerald-700 font-semibold">{fac.solarCapacityKw} kW Installed</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
