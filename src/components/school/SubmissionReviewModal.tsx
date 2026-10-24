import React, { useState } from 'react';
import { School, SubmissionRecord, SubmissionStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getSubmissionBySchool,
  updateSubmissionStatus,
  getEnrollment,
  getNSB,
  getFTF,
  getFacilities,
  getStaff
} from '../../services/storage';
import {
  CheckCircle2,
  RotateCcw,
  Clock,
  Award,
  AlertTriangle,
  X,
  Printer,
  FileSpreadsheet,
  Eye,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubmissionReviewModalProps {
  school: School;
  isOpen: boolean;
  onClose: () => void;
  onInspectSchool?: (emisCode: string, targetTab?: string) => void;
  onOpenPrintDossier?: (emisCode: string) => void;
  onStatusUpdated?: () => void;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
  school,
  isOpen,
  onClose,
  onInspectSchool,
  onOpenPrintDossier,
  onStatusUpdated
}) => {
  const { isDyDEO, isAEO, isSupervisor, currentUser } = useAuth();
  const { isUrdu } = useLanguage();

  const [submission, setSubmission] = useState<SubmissionRecord | undefined>(() => {
    return getSubmissionBySchool(school.emisCode);
  });

  const [actionType, setActionType] = useState<'view' | 'approve' | 'return'>('view');
  const [remarks, setRemarks] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [correctionsText, setCorrectionsText] = useState('');

  if (!isOpen) return null;

  const enrollment = getEnrollment(school.emisCode);
  const nsb = getNSB(school.emisCode);
  const ftf = getFTF(school.emisCode);
  const facilities = getFacilities(school.emisCode);
  const staff = getStaff(school.emisCode);

  const status: SubmissionStatus = submission?.status || 'draft';

  const returnReasonOptions = [
    'Missing NSB payment voucher receipts / bills',
    'Student enrollment mismatch with NADRA B-Form record',
    'Classrooms dilapidation assessment requires civil work report',
    'FTF cash balance and bank passbook discrepancy',
    'Staff attendance register photocopy missing',
    'School Council endorsement resolution missing'
  ];

  const handleExecuteReviewAction = (newStatus: 'approved' | 'returned') => {
    if (!currentUser || !submission) return;

    const certPrefix = isDyDEO ? 'DYDEO/PG/APPR/2026' : 'AEO/PG/APPR/2026';
    const updated = updateSubmissionStatus(
      submission.id,
      newStatus,
      currentUser,
      remarks,
      selectedReasons,
      correctionsText
    );

    if (updated) {
      if (newStatus === 'approved' && !updated.approvalCertificateNumber) {
        updated.approvalCertificateNumber = `${certPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      }
      setSubmission(updated);
    }

    if (newStatus === 'approved') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {}
    }

    if (onStatusUpdated) {
      onStatusUpdated();
    }
    setActionType('view');
  };

  const reviewerAuthority = isDyDEO
    ? 'Deputy District Education Officer (Dy. DEO)'
    : 'Assistant Education Officer (AEO)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Official Submission Dossier Review · {reviewerAuthority}
              </span>
              <span className="text-emerald-500">·</span>
              <span className="text-[11px] font-mono text-emerald-200">
                {submission?.reportingPeriod || 'Q1 2026-27'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {school.name} (EMIS: {school.emisCode})
            </h3>
            <p className="text-xs text-emerald-300/90">
              Markaz: <strong>{school.markaz}</strong> · {school.category} · {school.level} · Head: {school.headTeacherName} ({school.headTeacherPhone})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Submission Status Bar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          status === 'approved'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : status === 'submitted'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : status === 'returned'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {status === 'approved' && <Award className="w-5 h-5 text-emerald-600 shrink-0" />}
            {status === 'submitted' && <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />}
            {status === 'returned' && <RotateCcw className="w-5 h-5 text-rose-600 shrink-0" />}
            {status === 'draft' && <span className="w-3 h-3 rounded-full bg-slate-400"></span>}
            <div>
              <span className="font-bold text-sm block">
                {status === 'approved' && 'Verified & Officially Approved'}
                {status === 'submitted' && 'Submitted by School · Awaiting Review'}
                {status === 'returned' && 'Returned to School for Corrections'}
                {status === 'draft' && 'Draft / Incomplete (Not Yet Submitted by School)'}
              </span>
              <span className="text-[11px] opacity-80 block">
                {submission?.submittedAt
                  ? `Submitted on ${new Date(submission.submittedAt).toLocaleString()} by ${submission.submittedBy || school.headTeacherName}`
                  : 'School has not finalized submission yet.'}
              </span>
            </div>
          </div>

          {/* Certificate badge or status badge */}
          {status === 'approved' && submission?.approvalCertificateNumber && (
            <div className="px-3 py-1.5 bg-emerald-100 text-emerald-950 font-mono font-bold rounded-lg border border-emerald-300 text-xs text-right">
              <span className="text-[10px] text-emerald-700 uppercase block font-sans">Certificate</span>
              {submission.approvalCertificateNumber}
            </div>
          )}
        </div>

        {/* Dossier Data Grid */}
        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Verified School Data Breakdown</span>
              {onOpenPrintDossier && (
                <button
                  type="button"
                  onClick={() => onOpenPrintDossier(school.emisCode)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Dossier</span>
                </button>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Enrollment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">1. Enrollment</span>
                <span className="text-xl font-black font-mono text-emerald-900 block mt-0.5">
                  {enrollment?.grandTotal || 0}
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Boys: <strong>{enrollment?.totalBoys || 0}</strong> · Girls: <strong>{enrollment?.totalGirls || 0}</strong>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  B-Form: {enrollment?.bFormVerifiedCount || 0} verified
                </span>
              </div>

              {/* NSB Funds */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">2. NSB Financials</span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
                  Income: Rs. {(nsb?.totalIncome || 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-rose-700 block">
                  Spent: Rs. {(nsb?.totalExpenditure || 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 block border-t border-slate-200 pt-1 mt-1">
                  Balance: Rs. {(nsb?.currentBalance || 0).toLocaleString()}
                </span>
              </div>

              {/* FTF Funds */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">3. FTF Accounts</span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
                  Available: Rs. {((ftf?.openingBalance || 0) + (ftf?.totalCollected || 0)).toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-rose-700 block">
                  Spent: Rs. {(ftf?.totalExpenditure || 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 block border-t border-slate-200 pt-1 mt-1">
                  Balance: Rs. {(ftf?.currentBalance || 0).toLocaleString()}
                </span>
              </div>

              {/* Staff & Infrastructure */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">4. Staff & Rooms</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {staff?.teachers?.length || 0} Teaching Staff
                </span>
                <span className={`text-[11px] font-semibold block ${facilities?.dangerousClassrooms ? 'text-rose-700' : 'text-slate-600'}`}>
                  {facilities?.totalClassrooms || 0} Rooms ({facilities?.dangerousClassrooms || 0} Dangerous)
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Solar: {facilities?.solarInstalled ? 'Yes' : 'No'} · Wall: {facilities?.boundaryWallStatus || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks History if previously reviewed */}
          {submission?.aeoRemarks && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Previous Directives / Review Remarks:
              </span>
              <p className="italic text-slate-800 leading-relaxed pl-5">"{submission.aeoRemarks}"</p>
              {submission.reviewedBy && (
                <span className="text-[10px] text-slate-400 block pl-5 font-mono">
                  Recorded by {submission.reviewedBy} on {new Date(submission.reviewedAt || '').toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Actions Section: Approve / Return Forms */}
          {(isDyDEO || isAEO || isSupervisor) && actionType === 'approve' && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 animate-in fade-in">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Confirm Official Approval & Issue Certificate</span>
              </h5>
              <p className="text-[11px] text-emerald-800">
                You are approving the Q1 quarterly data dossier for <strong>{school.name}</strong>. An official verification certificate will be generated and signed under your authority.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Remarks / Commendation (Optional):
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. All records verified against registers. Satisfactory quarterly compliance."
                  className="w-full p-2 text-xs border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('view')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteReviewAction('approved')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Issue Official Approval Certificate</span>
                </button>
              </div>
            </div>
          )}

          {(isDyDEO || isAEO || isSupervisor) && actionType === 'return' && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3 animate-in fade-in">
              <h5 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-700" />
                <span>Return Dossier to School for Corrections</span>
              </h5>
              <p className="text-[11px] text-rose-800">
                Specify the observations or deficiencies that the Head Teacher must address before re-submitting.
              </p>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">Select Common Observations:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {returnReasonOptions.map(opt => (
                    <label key={opt} className="flex items-start gap-2 p-1.5 bg-white border border-rose-200 rounded text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(opt)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedReasons([...selectedReasons, opt]);
                          } else {
                            setSelectedReasons(selectedReasons.filter(x => x !== opt));
                          }
                        }}
                        className="mt-0.5 text-rose-700 rounded border-slate-300 focus:ring-rose-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Required Action / Specific Directives:
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Please update the NSB repair voucher bill and upload before/after photos of the classroom."
                  className="w-full p-2 text-xs border border-rose-300 rounded-lg focus:ring-1 focus:ring-rose-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('view')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteReviewAction('returned')}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return to School</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons for AEO / Dy. DEO */}
          {actionType === 'view' && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onInspectSchool && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onInspectSchool(school.emisCode, 'enrollment');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>Inspect Modules (Enrollment/NSB/Staff)</span>
                  </button>
                )}
              </div>

              {(isDyDEO || isAEO || isSupervisor) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Approve & Verify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('return')}
                    className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Return for Correction</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
