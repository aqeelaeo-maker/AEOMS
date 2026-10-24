import React, { useState } from 'react';
import { School, SubmissionRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  submitDossier,
  getSubmissionBySchool,
  getEnrollment,
  getNSB,
  getFTF,
  getFacilities,
  getStaff
} from '../../services/storage';
import {
  SendHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  X,
  FileText,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SchoolQuickSubmitModalProps {
  school: School;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SchoolQuickSubmitModal: React.FC<SchoolQuickSubmitModalProps> = ({
  school,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { currentUser, isSchoolUser } = useAuth();
  const { isUrdu } = useLanguage();

  const [confirmedDeclaration, setConfirmedDeclaration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const submission = getSubmissionBySchool(school.emisCode);
  const enrollment = getEnrollment(school.emisCode);
  const nsb = getNSB(school.emisCode);
  const ftf = getFTF(school.emisCode);
  const facilities = getFacilities(school.emisCode);
  const staff = getStaff(school.emisCode);

  const isProfileReady = !!school.name && !!school.headTeacherName;
  const isEnrollmentReady = (enrollment?.grandTotal || 0) > 0;
  const isNsbReady = (nsb?.totalIncome || 0) > 0 || (nsb?.totalExpenditure || 0) > 0;
  const isFacilitiesReady = (facilities?.totalClassrooms || 0) > 0;
  const isStaffReady = (staff?.teachers?.length || 0) > 0;

  const canSubmit = isProfileReady && confirmedDeclaration;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !canSubmit) return;

    setIsSubmitting(true);
    submitDossier(school.emisCode, currentUser, 'Q1 2026-27 (Quarter 1)');
    setIsSubmitting(false);
    setSuccessNotice(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onSubmitted) {
      onSubmitted();
    }

    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 2000);
  };

  const status = submission?.status || 'draft';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header in Emerald */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-400 flex items-center justify-center font-bold">
              <SendHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>
                  {isUrdu
                    ? 'سکول ڈیٹا معاون تعلیمی افسر و ڈپٹی ڈی ای او کو جمع کروائیں'
                    : 'Submit School Data to AEO & Deputy DEO'}
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                {school.name} · EMIS: <strong className="font-mono text-amber-300">{school.emisCode}</strong> · Markaz: {school.markaz}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if already submitted or approved */}
        {status === 'approved' && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">This school data is officially verified & approved!</span>
              <span className="block text-[11px] font-mono text-emerald-700">Certificate No: {submission?.approvalCertificateNumber}</span>
            </div>
          </div>
        )}

        {status === 'submitted' && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Data already submitted and currently under review by AEO & Deputy DEO.</span>
              <span className="block text-[11px] text-amber-800">
                Submitted on {new Date(submission?.submittedAt || '').toLocaleString()} by {submission?.submittedBy}
              </span>
            </div>
          </div>
        )}

        {status === 'returned' && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-950 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Dossier returned by AEO with instructions:</span>
            </div>
            {submission?.aeoRemarks && (
              <p className="pl-6 text-[11px] italic">"{submission.aeoRemarks}"</p>
            )}
            <p className="pl-6 text-[11px] text-rose-700 font-semibold">
              Please verify your corrections and click "Resubmit School Data" below.
            </p>
          </div>
        )}

        {successNotice ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {isUrdu ? 'سکول کا ڈیٹا کامیابی سے جمع ہو گیا!' : 'School Data Submitted Successfully!'}
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {isUrdu
                ? 'آپ کے سکول کے داخلہ، این ایس بی و عمارت کے کوائف معاون تعلیمی افسر (AEO) اور ڈپٹی ڈسٹرکٹ ایجوکیشن آفیسر (Dy. DEO) کے پاس تصدیق کیلئے پہنچ چکے ہیں۔'
                : 'Your complete school data dossier has been submitted and is now available for review by the AEO and Deputy DEO.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Compiled Data Summary Cards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>{isUrdu ? 'جمع کروائے جانے والے کوائف کا خلاصہ' : 'Summary of Data to be Submitted'}</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
                {/* 1. Enrollment */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Students</span>
                  <span className="text-base font-black font-mono text-emerald-900">
                    {enrollment?.grandTotal || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {enrollment?.totalBoys || 0} Boys · {enrollment?.totalGirls || 0} Girls
                  </span>
                </div>

                {/* 2. NSB Funds */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">NSB Total Income</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    Rs. {(nsb?.totalIncome || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-rose-700 block mt-0.5 font-mono">
                    Spent: Rs. {(nsb?.totalExpenditure || 0).toLocaleString()}
                  </span>
                </div>

                {/* 3. FTF Funds */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">FTF Balance</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    Rs. {(ftf?.currentBalance || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    Spent: Rs. {(ftf?.totalExpenditure || 0).toLocaleString()}
                  </span>
                </div>

                {/* 4. Staff & Classrooms */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Staff & Rooms</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    {staff?.teachers?.length || 0} Teachers
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {facilities?.totalClassrooms || 0} Rooms ({facilities?.dangerousClassrooms || 0} Danger)
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                {isUrdu ? 'ماڈیول وائز کوائف کی تکمیل' : 'Module Readiness Status'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span>School Master Profile</span>
                  {isProfileReady ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Complete</span>
                  ) : (
                    <span className="text-rose-700 font-bold">Needs Head Name</span>
                  )}
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span>Student Enrollment Register</span>
                  {isEnrollmentReady ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Enrolled ({enrollment?.grandTotal})</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">Zero Recorded</span>
                  )}
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span>NSB Funds & Expenditure Vouchers</span>
                  {isNsbReady ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Income & Vouchers</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">Zero Recorded</span>
                  )}
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span>Building & Teaching Staff</span>
                  {isFacilitiesReady && isStaffReady ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Populated</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">Review Recommended</span>
                  )}
                </div>
              </div>
            </div>

            {/* Head Teacher Declaration Checkbox */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedDeclaration}
                  onChange={e => setConfirmedDeclaration(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                />
                <div className="text-xs text-slate-800 leading-relaxed">
                  <strong className="text-emerald-950 font-bold block mb-0.5">
                    {isUrdu ? 'ہیڈ ٹیچر / انچارج کا حلفیہ بیان:' : 'Head Teacher Solemn Declaration:'}
                  </strong>
                  <span>
                    {isUrdu
                      ? `میں بحیثیت ہیڈ ٹیچر تصدیق کرتا/کرتی ہوں کہ درج بالا تمام معلومات (داخلہ طلباء، این ایس بی فنڈز بقایا برائے 30-06-2026، چاروں اقساط، اخراجات واؤچرز، فروغ تعلیم فنڈ اور عمارات کی حالت) بالکل درست و مصدقہ ہیں۔ یہ کوائف باضابطہ طور پر AEO اور ڈپٹی ڈی ای او پنڈی گھیب کے ریکارڈ اور توثیق کیلئے پیش کیے جا رہے ہیں۔`
                      : `I solemnly affirm that the student enrollment figures, NSB funds (Balance on 30-06-2026, 4 Installments, Total Income, Total Expenditure, Current Balance), FTF ledger, building inspection, and staff particulars submitted herein are complete, genuine, and verified against school physical registers. I submit this data for review by the AEO and Deputy DEO.`}
                  </span>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>
                  {status === 'returned'
                    ? (isUrdu ? 'درست شدہ کوائف دوبارہ بھیجیں' : 'Resubmit Corrected Data to AEO & Dy. DEO')
                    : (isUrdu ? 'کوائف AEO اور ڈپٹی ڈی ای او کو جمع کروائیں' : 'Submit School Data to AEO & Dy. DEO')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
