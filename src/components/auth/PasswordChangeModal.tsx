import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, ShieldAlert, KeyRound, CheckCircle, LogOut, X } from 'lucide-react';

export const PasswordChangeModal: React.FC = () => {
  const {
    currentUser,
    mustChangePasswordModalOpen,
    isChangePasswordOpen,
    closeChangePasswordModal,
    submitPasswordChange,
    logout
  } = useAuth();
  const { isUrdu } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isOpen = mustChangePasswordModalOpen || isChangePasswordOpen;
  if (!isOpen || !currentUser) return null;

  const isMandatory = currentUser.mustChangePassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = newPassword.trim();
    if (trimmed.length < 4) {
      setError(
        isUrdu
          ? 'پاس ورڈ کم از کم 4 حروف یا ہندسوں پر مشتمل ہونا چاہیے۔'
          : 'Password must be at least 4 characters long.'
      );
      return;
    }

    if (trimmed !== confirmPassword.trim()) {
      setError(
        isUrdu
          ? 'پاس ورڈ اور تصدیقی پاس ورڈ ایک جیسے نہیں ہیں۔'
          : 'Passwords do not match.'
      );
      return;
    }

    if (currentUser.role === 'school_user' && trimmed === currentUser.username.trim()) {
      setError(
        isUrdu
          ? 'نیا پاس ورڈ آپ کے ای ایم آئی ایس (EMIS) کوڈ جیسا نہیں ہو سکتا!'
          : 'New password cannot be the same as your EMIS code!'
      );
      return;
    }

    if (currentUser.role === 'aeo_admin' && currentUser.cnic && trimmed === currentUser.cnic.trim()) {
      setError(
        isUrdu
          ? 'نیا پاس ورڈ آپ کے شناختی کارڈ (CNIC) جیسا نہیں ہو سکتا!'
          : 'New password cannot be the same as your CNIC number!'
      );
      return;
    }

    setLoading(true);
    const res = await submitPasswordChange(trimmed);
    setLoading(false);

    if (!res.success) {
      setError(res.error || (isUrdu ? 'پاس ورڈ اپ ڈیٹ کرنے میں ناکامی' : 'Failed to update password'));
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        closeChangePasswordModal();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white text-center relative">
          {!isMandatory && (
            <button
              type="button"
              onClick={closeChangePasswordModal}
              className="absolute right-4 top-4 text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="mx-auto w-12 h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-emerald-300" />
          </div>

          <h2 className="text-lg font-bold tracking-tight">
            {isMandatory
              ? (isUrdu ? 'پہلی بار لاگ ان: نیا پاس ورڈ لازمی ہے' : 'Initial Password Change Required')
              : (isUrdu ? 'اکاؤنٹ کا پاس ورڈ تبدیل کریں' : 'Change Account Password')}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {isMandatory
              ? (isUrdu
                  ? 'سیکیورٹی پالیسی کے مطابق اپنے ابتدائی ڈیفالٹ پاس ورڈ کو فوری تبدیل کریں۔'
                  : 'As per School Education Department policy, initial default credentials must be replaced.')
              : (isUrdu
                  ? 'اپنے اکاؤنٹ کا نیا محفوظ پاس ورڈ ترتیب دیں۔'
                  : 'Set a new secure password for your official portal account.')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 mb-5 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-semibold text-slate-800">
                {isUrdu ? 'موجودہ لاگ ان اکاؤنٹ:' : 'Logged In Account:'}
              </div>
              <div className="font-mono text-emerald-800 font-bold truncate mt-0.5">
                {currentUser.displayName} ({currentUser.username})
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                {currentUser.role === 'dy_deo'
                  ? (isUrdu ? 'ڈپٹی ڈی ای او (سپر ایڈمن)' : 'Deputy District Education Officer')
                  : currentUser.role === 'aeo_admin'
                  ? (isUrdu ? `معاون تعلیمی افسر (AEO) · مرکز ${currentUser.assignedMarkaz || ''}` : `Assistant Education Officer · Markaz ${currentUser.assignedMarkaz || ''}`)
                  : (isUrdu ? `سکول EMIS: ${currentUser.schoolEmisCode || currentUser.username}` : `School EMIS: ${currentUser.schoolEmisCode || currentUser.username}`)}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-slate-900">
                {isUrdu ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا!' : 'Password Updated Successfully!'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {isUrdu ? 'آپ کا نیا پاس ورڈ اب فعال ہو چکا ہے۔' : 'Your new password is now active.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'نیا پاس ورڈ درج کریں' : 'New Secure Password'} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder={
                      currentUser.role === 'school_user'
                        ? 'Min 4 characters (not EMIS code)'
                        : currentUser.role === 'aeo_admin'
                        ? 'Min 4 characters (not CNIC number)'
                        : 'Enter new password'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'نئے پاس ورڈ کی دوبارہ تصدیق کریں' : 'Confirm New Password'} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {isMandatory ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {isUrdu ? 'لاگ آؤٹ' : 'Cancel & Logout'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeChangePasswordModal}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {loading
                    ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Updating...')
                    : (isUrdu ? 'پاس ورڈ محفوظ کریں' : 'Save New Password')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
