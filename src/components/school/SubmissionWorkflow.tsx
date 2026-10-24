import React, { useState, useEffect } from 'react';
import { School, SubmissionRecord, SubmissionStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getSubmissionBySchool,
  submitDossier,
  updateSubmissionStatus,
  getEnrollment,
  getNSB,
  getFacilities,
  getStaff,
  getDocuments
} from '../../services/storage';
import {
  SendHorizontal,
  CheckCircle2,
  RotateCcw,
  Clock,
  FileCheck,
  AlertCircle,
  Award,
  MessageSquare,
  ShieldAlert,
  Printer,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConfirmModal } from '../common/ConfirmModal';

interface SubmissionWorkflowProps {
  school: School;
  onOpenOfficialPrint?: () => void;
}

export const SubmissionWorkflow: React.FC<SubmissionWorkflowProps> = ({
  school,
  onOpenOfficialPrint
}) => {
  const { isAEO, isSupervisor, isSchoolUser, isDyDEO, currentUser } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [submission, setSubmission] = useState<SubmissionRecord | undefined>(() => {
    return getSubmissionBySchool(school.emisCode);
  });

  // AEO Action Modal State
  const [showAeoActionModal, setShowAeoActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'return'>('approve');
  const [aeoRemarks, setAeoRemarks] = useState('');
  const [selectedReturnReasons, setSelectedReturnReasons] = useState<string[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [correctionsRequested, setCorrectionsRequested] = useState('');

  // Readiness Checklist
  const enrollment = getEnrollment(school.emisCode);
  const nsb = getNSB(school.emisCode);
  const facilities = getFacilities(school.emisCode);
  const staff = getStaff(school.emisCode);
  const docs = getDocuments(school.emisCode);

  const isProfileReady = !!school.name && !!school.headTeacherName;
  const isEnrollmentReady = (enrollment?.grandTotal || 0) > 0;
  const isNsbReady = (nsb?.totalReceived || 0) > 0;
  const isFacilitiesReady = (facilities?.totalClassrooms || 0) > 0;
  const isStaffReady = (staff?.teachers?.length || 0) > 0;
  const isDocsAttached = docs.length > 0;

  const allChecklistPassed =
    isProfileReady && isEnrollmentReady && isNsbReady && isFacilitiesReady && isStaffReady;

  useEffect(() => {
    setSubmission(getSubmissionBySchool(school.emisCode));
  }, [school.emisCode]);

  const handleExecuteSchoolSubmit = () => {
    if (!currentUser) return;
    const sub = submitDossier(school.emisCode, currentUser, 'Q1 2026-27 (July - September)');
    setSubmission(sub);
    setShowSubmitConfirm(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAeoActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !submission) return;

    const newStatus: SubmissionStatus = actionType === 'approve' ? 'approved' : 'returned';
    const updated = updateSubmissionStatus(
      submission.id,
      newStatus,
      currentUser,
      aeoRemarks,
      selectedReturnReasons,
      correctionsRequested
    );

    setSubmission(updated);
    setShowAeoActionModal(false);

    if (actionType === 'approve') {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  };

  const status = submission?.status || 'draft';

  return (
    <div className="space-y-6">
      {/* Top Workflow Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isUrdu ? 'سرکاری توثیقی حیثیت' : 'Official Verification Stage'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-600">
                {submission?.reportingPeriod || 'Q1 2026-27'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {status === 'approved' && (isUrdu ? 'منظور شدہ و مصدقہ برائے Q1' : 'Approved & Officially Verified')}
              {status === 'submitted' && (isUrdu ? 'جمع شدہ · زیرِ جائزہ برائے توثیق' : 'Submitted · Awaiting AEO Review')}
              {status === 'under_review' && (isUrdu ? 'زیرِ تفتیش و معائنہ' : 'Under Detailed Review')}
              {status === 'returned' && (isUrdu ? 'اعتراضات کے ساتھ درستی کیلئے واپس' : 'Returned For Corrections')}
              {status === 'draft' && (isUrdu ? 'غیر حتمی مسودہ (Draft)' : 'Draft (Incomplete)')}
            </h2>
          </div>

          {/* Certificate Badge or Direct Actions */}
          <div className="flex items-center gap-2">
            {status === 'approved' && submission?.approvalCertificateNumber && (
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Official Certificate</div>
                  <div className="font-mono">{submission.approvalCertificateNumber}</div>
                </div>
              </div>
            )}

            {onOpenOfficialPrint && (
              <button
                type="button"
                onClick={onOpenOfficialPrint}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>{isUrdu ? 'سرکاری فائل پرنٹ کریں' : 'Print Official Dossier'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Stage Visual Timeline */}
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Draft */}
            <div className={`p-4 rounded-xl border ${
              status === 'draft'
                ? 'bg-slate-100 border-slate-300 font-bold'
                : 'bg-emerald-50/50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Step 01
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isUrdu ? 'سکول ڈیٹا انٹری' : 'Data Entry & Compiling'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Enrollment, NSB vouchers & photos compiled
              </p>
            </div>

            {/* Step 2: Submitted */}
            <div className={`p-4 rounded-xl border ${
              status === 'submitted' || status === 'under_review'
                ? 'bg-amber-50 border-amber-300 shadow-xs'
                : status === 'approved'
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Step 02
                </span>
                {status === 'submitted' || status === 'under_review' ? (
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                ) : status === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isUrdu ? 'معاون تعلیمی افسر کو ترسیل' : 'Submitted to AEO'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {submission?.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString()
                  : 'Awaiting School Submission'}
              </p>
            </div>

            {/* Step 3: Verification Review */}
            <div className={`p-4 rounded-xl border ${
              status === 'returned'
                ? 'bg-rose-50 border-rose-300 shadow-xs'
                : status === 'approved'
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Step 03
                </span>
                {status === 'returned' ? (
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                ) : status === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {status === 'returned'
                  ? (isUrdu ? 'اعتراضات / درستی مطلوب' : 'Objections Raised')
                  : (isUrdu ? 'دستاویزی و فیلڈ معائنہ' : 'Verification Review')}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {status === 'returned' ? 'Action required by school head' : 'AEO audits vouchers & rolls'}
              </p>
            </div>

            {/* Step 4: Final Approval */}
            <div className={`p-4 rounded-xl border ${
              status === 'approved'
                ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Step 04
                </span>
                {status === 'approved' ? (
                  <Award className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {isUrdu ? 'حتمی منظوری و سند' : 'Certified & Approved'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {status === 'approved' ? 'Locked & Archived' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Remarks or Corrections Banner if any */}
        {(submission?.aeoRemarks || submission?.correctionsRequested) && (
          <div className={`mt-6 p-4 rounded-xl border text-xs ${
            status === 'returned'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {isUrdu ? 'معاون تعلیمی افسر (AEO) کے احکامات و ریمارکس:' : 'Official Directives from AEO Office:'}
                </span>
                {submission.aeoRemarks && (
                  <p className="mt-1 leading-relaxed">{submission.aeoRemarks}</p>
                )}
                {submission.correctionsRequested && (
                  <div className="mt-2 font-medium bg-white/70 p-2.5 rounded border border-rose-200">
                    <span className="font-bold text-rose-900">Required Corrections:</span>{' '}
                    {submission.correctionsRequested}
                  </div>
                )}
                {submission.reviewedBy && (
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Reviewed by {submission.reviewedBy} on {new Date(submission.reviewedAt || '').toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Submission Readiness Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {isUrdu ? 'سکول ڈیٹا تصدیقی چیک لسٹ (Pre-Submission Audit Checklist)' : 'Pre-Submission Audit Readiness Checklist'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {isUrdu
            ? 'فائل جمع کروانے سے قبل تمام ماڈیولز کے کوائف کا مکمل ہونا ضروری ہے۔'
            : 'Ensure each section is populated with verified records before forwarding to the AEO.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">School Profile & Head Info</span>
            {isProfileReady ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Complete</span>
            ) : (
              <span className="text-rose-700 font-bold">Incomplete</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">Enrollment Register ({enrollment?.grandTotal || 0} students)</span>
            {isEnrollmentReady ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Recorded</span>
            ) : (
              <span className="text-rose-700 font-bold">Missing</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">NSB Funds & Vouchers ({nsb?.transactions?.length || 0} vouchers)</span>
            {isNsbReady ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Logged</span>
            ) : (
              <span className="text-rose-700 font-bold">Missing</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">Building & Facilities Safety</span>
            {isFacilitiesReady ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Complete</span>
            ) : (
              <span className="text-rose-700 font-bold">Missing</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">Teaching Staff ({staff?.teachers?.length || 0} teachers)</span>
            {isStaffReady ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Updated</span>
            ) : (
              <span className="text-rose-700 font-bold">Missing</span>
            )}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-medium text-slate-700">Photo & Bill Evidences ({docs.length} files)</span>
            {isDocsAttached ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Attached</span>
            ) : (
              <span className="text-amber-700 font-bold">Recommended</span>
            )}
          </div>
        </div>

        {/* Action Buttons for School or AEO */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* School Action: Submit or Resubmit */}
          {(isSchoolUser || isAEO) && status !== 'approved' && (
            <button
              type="button"
              disabled={!allChecklistPassed}
              onClick={() => setShowSubmitConfirm(true)}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>
                {status === 'returned'
                  ? (isUrdu ? 'درستی کے بعد دوبارہ جمع کروائیں' : 'Resubmit Corrected Dossier to AEO')
                  : (isUrdu ? 'معاون تعلیمی افسر کو توثیق کیلئے بھیجیں' : 'Submit School Dossier to AEO for Verification')}
              </span>
            </button>
          )}

          {/* AEO & Dy. DEO Authority Action: Review / Approve / Return */}
          {(isAEO || isDyDEO || isSupervisor) && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionType('approve');
                  setShowAeoActionModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isUrdu
                    ? (isDyDEO ? 'منظوری و توثیق (ڈپٹی ڈی ای او)' : 'منظوری و تصدیقی سرٹیفکیٹ جاری کریں')
                    : (isDyDEO ? 'Approve & Validate Dossier (Dy. DEO)' : 'Approve & Issue Certificate')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionType('return');
                  setShowAeoActionModal(true);
                }}
                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isUrdu ? 'اعتراضات لگا کر واپس کریں' : 'Return for Corrections'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AEO Action Modal (Approve or Return with reasons) */}
      {showAeoActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`p-5 text-white ${
              actionType === 'approve' ? 'bg-emerald-900' : 'bg-rose-900'
            }`}>
              <h3 className="text-base font-bold">
                {actionType === 'approve'
                  ? (isUrdu ? 'سکول کوائف کی باضابطہ منظوری' : 'Official AEO Approval & Validation')
                  : (isUrdu ? 'سکول کوائف پر اعتراضات و واپسی' : 'Return Dossier with Review Objections')}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                {school.name} (EMIS: {school.emisCode})
              </p>
            </div>

            <form onSubmit={handleAeoActionSubmit} className="p-6 space-y-4">
              {actionType === 'approve' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs">
                  <p className="font-semibold">
                    Upon approval, an official digital certificate will be generated and logged to the permanent audit trail.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Objection Categories:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      'Enrollment count discrepancy with SIS',
                      'NSB Cash Book voucher missing receipt',
                      'Boundary wall photograph not attached',
                      'FTF expenditure missing committee sign',
                      'Sanctioned teacher vacancy not verified'
                    ].map(reason => (
                      <label key={reason} className="flex items-center gap-2 p-2 bg-slate-50 border rounded text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedReturnReasons.includes(reason)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedReturnReasons([...selectedReturnReasons, reason]);
                            } else {
                              setSelectedReturnReasons(selectedReturnReasons.filter(r => r !== reason));
                            }
                          }}
                          className="w-3.5 h-3.5 text-rose-600 rounded"
                        />
                        <span className="text-[11px]">{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specific Corrections Required by Head Teacher:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={correctionsRequested}
                      onChange={e => setCorrectionsRequested(e.target.value)}
                      placeholder="Specify exact corrections needed..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official AEO Remarks:
                </label>
                <textarea
                  required
                  rows={3}
                  value={aeoRemarks}
                  onChange={e => setAeoRemarks(e.target.value)}
                  placeholder="Official comments for record..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAeoActionModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg text-xs font-bold transition-colors ${
                    actionType === 'approve'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-800 hover:bg-rose-900'
                  }`}
                >
                  {actionType === 'approve' ? 'Confirm Approval' : 'Return to School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Submission Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        title={isUrdu ? 'کوائف جمع کروائیں' : 'Submit School Dossier'}
        message={
          isUrdu
            ? 'کیا آپ اپنے سکول کے تمام کوائف (داخلہ، بجٹ، عمارات، اساتذہ) معاون تعلیمی افسر (AEO) کو توثیق کیلئے جمع کروانا چاہتے ہیں؟'
            : 'Are you sure you want to officially submit this school dossier to the Assistant Education Officer (AEO) for review?'
        }
        confirmText={isUrdu ? 'ارسال کریں' : 'Confirm & Submit'}
        cancelText={isUrdu ? 'منسوخ کریں' : 'Cancel'}
        onConfirm={handleExecuteSchoolSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </div>
  );
};
