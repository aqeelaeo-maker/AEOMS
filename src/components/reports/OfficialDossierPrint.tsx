import React from 'react';
import { School } from '../../types';
import {
  getEnrollment,
  getNSB,
  getFTF,
  getFacilities,
  getStaff,
  getSubmissionBySchool
} from '../../services/storage';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OfficialDossierPrintProps {
  school: School;
  onClose: () => void;
}

export const OfficialDossierPrint: React.FC<OfficialDossierPrintProps> = ({ school, onClose }) => {
  const enrollment = getEnrollment(school.emisCode);
  const nsb = getNSB(school.emisCode);
  const ftf = getFTF(school.emisCode);
  const facilities = getFacilities(school.emisCode);
  const staff = getStaff(school.emisCode);
  const submission = getSubmissionBySchool(school.emisCode);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-4 sm:p-6 print:p-0 print:bg-white print:fixed-none">
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as Official PDF</span>
        </button>
      </div>

      {/* Official Government Dossier Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 sm:p-12 text-slate-900 border border-slate-200 print:border-none print:shadow-none print:p-6 font-sans">
        {/* Punjab Government Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <div className="text-[13px] font-bold tracking-widest text-emerald-900 uppercase">
            Government of the Punjab · School Education Department
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            OFFICE OF THE ASSISTANT EDUCATION OFFICER (AEO)
          </div>
          <div className="text-xs font-semibold text-slate-700">
            Markaz Pindi Gheb · Tehsil Pindi Gheb · District Attock
          </div>
          <div className="text-xs font-serif font-bold text-slate-800 mt-2 bg-slate-100 py-1 border-y border-slate-300">
            COMPREHENSIVE QUARTERLY SCHOOL DATA & VERIFICATION DOSSIER
          </div>
        </div>

        {/* School Master Identification */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-300 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">School Name</span>
            <span className="font-bold text-slate-900">{school.name}</span>
            <span className="text-[11px] font-urdu block text-slate-600">{school.nameUrdu}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">EMIS Code</span>
            <span className="font-mono font-black text-sm text-emerald-900">{school.emisCode}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Category & Level</span>
            <span className="font-semibold text-slate-800">{school.category} · {school.level} ({school.gender})</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Head Teacher</span>
            <span className="font-semibold text-slate-800">{school.headTeacherName}</span>
            <span className="text-[10px] font-mono block text-slate-500">{school.headTeacherPhone}</span>
          </div>
        </div>

        {/* Section 1: Enrollment Matrix */}
        <div className="py-4 border-b border-slate-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            1. Gender-Wise Enrollment Register (Session 2026-27)
          </h4>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold">
              <tr>
                <th className="p-1.5 border border-slate-300">Class</th>
                {enrollment?.grades.map(g => (
                  <th key={g.grade} className="p-1.5 border border-slate-300 text-center font-mono">
                    {g.grade}
                  </th>
                ))}
                <th className="p-1.5 border border-slate-300 text-right bg-slate-200">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono text-center">
              <tr>
                <td className="p-1.5 border border-slate-300 text-left font-sans font-semibold">Boys</td>
                {enrollment?.grades.map(g => (
                  <td key={g.grade} className="p-1.5 border border-slate-300">{g.boys}</td>
                ))}
                <td className="p-1.5 border border-slate-300 text-right font-bold bg-slate-50">{enrollment?.totalBoys}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 text-left font-sans font-semibold">Girls</td>
                {enrollment?.grades.map(g => (
                  <td key={g.grade} className="p-1.5 border border-slate-300">{g.girls}</td>
                ))}
                <td className="p-1.5 border border-slate-300 text-right font-bold bg-slate-50">{enrollment?.totalGirls}</td>
              </tr>
              <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
                <td className="p-1.5 border border-slate-300 text-left font-sans">Total</td>
                {enrollment?.grades.map(g => (
                  <td key={g.grade} className="p-1.5 border border-slate-300">{g.total}</td>
                ))}
                <td className="p-1.5 border border-slate-300 text-right font-black text-sm text-emerald-950 bg-slate-200">
                  {enrollment?.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Minority Students: <strong>{enrollment?.minorityStudents || 0}</strong></span>
            <span>Special Needs (CWSN): <strong>{enrollment?.cwsnStudents || 0}</strong></span>
            <span>NADRA B-Form Verified: <strong>{enrollment?.bFormVerifiedCount || 0}</strong></span>
            <span>Average Attendance: <strong>{enrollment?.averageAttendancePercent || 0}%</strong></span>
          </div>
        </div>

        {/* Section 2: Financial Accounts (NSB & FTF) */}
        <div className="py-4 border-b border-slate-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            2. Financial Audit Statement (NSB & FTF Accounts)
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 border border-slate-300 rounded bg-slate-50">
              <div className="font-bold text-slate-900 border-b pb-1 mb-2">
                Non-Salary Budget (NSB) Statement
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Total Funds Available:</span>
                  <span className="font-bold">Rs. {nsb?.totalReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Total Expenditures:</span>
                  <span className="font-bold text-rose-800">Rs. {nsb?.totalExpenditure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-sans text-slate-900 font-bold">Unspent Balance:</span>
                  <span className="font-bold text-emerald-800">Rs. {nsb?.currentBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-300 rounded bg-slate-50">
              <div className="font-bold text-slate-900 border-b pb-1 mb-2">
                Farogh-e-Taleem Fund (FTF) Statement
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Total Available:</span>
                  <span className="font-bold">Rs. {ftf ? (ftf.openingBalance + ftf.totalCollected).toLocaleString() : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Total Spent:</span>
                  <span className="font-bold text-rose-800">Rs. {ftf?.totalExpenditure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-sans text-slate-900 font-bold">Current Balance:</span>
                  <span className="font-bold text-emerald-800">Rs. {ftf?.currentBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Facilities & Infrastructure Safety */}
        <div className="py-4 border-b border-slate-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            3. Building Infrastructure & Safety Hazard Assessment
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Total Classrooms:</span>
              <span className="font-bold">{facilities?.totalClassrooms} ({facilities?.classroomsInUse} In-Use)</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Dangerous Rooms:</span>
              <span className={`font-bold ${facilities?.dangerousClassrooms ? 'text-rose-700' : 'text-slate-800'}`}>
                {facilities?.dangerousClassrooms || 0}
              </span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Boundary Wall:</span>
              <span className="font-bold">{facilities?.boundaryWallStatus}</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Clean Water:</span>
              <span className="font-bold">{facilities?.drinkingWaterSource}</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Electricity (IESCO):</span>
              <span className="font-bold">{facilities?.electricityStatus}</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Solar Power:</span>
              <span className="font-bold">{facilities?.solarInstalled ? `${facilities.solarCapacityKw} kW` : 'No'}</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">Student Toilets:</span>
              <span className="font-bold">{facilities?.studentToiletsFunctional} Functional</span>
            </div>
            <div className="p-2 border rounded bg-slate-50">
              <span className="text-slate-500 block text-[10px]">IT & Science Lab:</span>
              <span className="font-bold">
                {facilities?.computerLab ? 'IT Lab' : 'No IT'} · {facilities?.scienceLab ? 'Science Lab' : 'No Science'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Staff Summary */}
        <div className="py-4 border-b border-slate-300 text-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            4. Staff Sanctioned Quota & Postings
          </h4>
          <div className="flex items-center justify-between font-mono bg-slate-50 p-2 border rounded">
            <span>Teaching Sanctioned: <strong>{staff?.sanctionedTeaching}</strong></span>
            <span>Teaching Filled: <strong>{staff?.filledTeaching}</strong></span>
            <span>Teaching Vacant: <strong className="text-rose-700">{staff?.vacantTeaching}</strong></span>
            <span>Non-Teaching: <strong>{staff?.filledNonTeaching} / {staff?.sanctionedNonTeaching}</strong></span>
          </div>
        </div>

        {/* Section 5: Official Verification Seal & Signatures */}
        <div className="pt-8 text-xs">
          <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-50/50 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  AEO Office Verification Certificate
                </span>
                <span className="font-mono font-bold text-sm text-emerald-900">
                  {submission?.approvalCertificateNumber || 'Dossier Under Review / Audit'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Audit Status</span>
                <span className="font-bold uppercase text-emerald-800">
                  {submission?.status || 'Draft'}
                </span>
              </div>
            </div>

            {submission?.aeoRemarks && (
              <p className="mt-2 text-slate-700 italic border-t pt-2">
                Official Remarks: "{submission.aeoRemarks}"
              </p>
            )}
          </div>

          {/* Signature Bars */}
          <div className="grid grid-cols-2 gap-12 pt-8">
            <div className="text-center">
              <div className="border-t border-slate-900 w-48 mx-auto pt-1 font-bold">
                Head Teacher / In-charge
              </div>
              <div className="text-[11px] text-slate-600">{school.headTeacherName}</div>
              <div className="text-[10px] text-slate-400">School Official Stamp</div>
            </div>

            <div className="text-center">
              <div className="border-t border-slate-900 w-48 mx-auto pt-1 font-bold">
                Assistant Education Officer (AEO)
              </div>
              <div className="text-[11px] text-slate-600">Markaz Pindi Gheb / Cluster Officer</div>
              <div className="text-[10px] text-slate-400">Official Office Seal & Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
