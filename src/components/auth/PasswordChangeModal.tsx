import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, ShieldAlert, KeyRound, CheckCircle, LogOut } from 'lucide-react';

export const PasswordChangeModal: React.FC = () => {
  const { currentUser, submitPasswordChange, logout } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentUser?.mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(isUrdu ? 'پاس ورڈ کم از کم 6 ہندسوں یا حروف پر مشتمل ہونا چاہیے۔' : 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isUrdu ? 'پاس ورڈ اور تصدیقی پاس ورڈ ایک جیسے نہیں ہیں۔' : 'Passwords do not match.');
      return;
    }

    if (currentUser.role === 'school_user' && newPassword.trim() === currentUser.username.trim()) {
      setError(isUrdu ? 'نیا پاس ورڈ آپ کے ای ایم آئی ایس (EMIS) کوڈ جیسا نہیں ہو سکتا!' : 'New password cannot be the same as your EMIS code!');
      return;
    }

    setLoading(true);
    const res = await submitPasswordChange(newPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to update password');
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isUrdu ? 'پہلی بار لاگ ان: نیا پاس ورڈ لازمی ہے' : 'Security Alert: Password Change Required'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed">
            {isUrdu
              ? 'سیکیورٹی اصول کے مطابق اپنے سکول کے ای ایم آئی ایس کوڈ والے عارضی پاس ورڈ کو فوری تبدیل کریں۔'
              : 'As per School Education Department policy, initial EMIS default password must be replaced immediately.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 mb-5 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{isUrdu ? 'موجودہ صارف:' : 'Current Account:'}</span>{' '}
              <span className="font-mono font-medium">{currentUser.displayName} ({currentUser.username})</span>
              <p className="mt-1 text-amber-800">
                {isUrdu
                  ? 'نیا پاس ورڈ خفیہ رکھیں اور کسی غیر مجاز شخص کو نہ دیں۔'
                  : 'Ensure the new password is known only to the authorized Head Teacher / In-charge.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-slate-900">
                {isUrdu ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا!' : 'Password Updated Successfully!'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {isUrdu ? 'اب آپ اپنے سکول کا ڈیٹا درج اور جمع کروا سکتے ہیں۔' : 'You can now proceed to manage and submit school records.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isUrdu ? 'نیا پاس ورڈ درج کریں' : 'New Secure Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters (not EMIS code)"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isUrdu ? 'نئے پاس ورڈ کی دوبارہ تصدیق کریں' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isUrdu ? 'لاگ آؤٹ' : 'Cancel & Logout'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Updating...') : (isUrdu ? 'پاس ورڈ محفوظ کریں' : 'Update & Continue')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
