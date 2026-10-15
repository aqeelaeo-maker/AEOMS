import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, Shield, UserCheck, KeyRound, LogIn, School as SchoolIcon, Eye, EyeOff } from 'lucide-react';
import { getSchools } from '../../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, demoLogin } = useAuth();
  const { t, isUrdu } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schools = getSchools();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleQuickSelect = (role: 'aeo_admin' | 'supervisor' | 'school_user', emis?: string) => {
    demoLogin(role, emis);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  {isUrdu ? 'سرکاری لاگ ان پورٹل' : 'Official Portal Sign In'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isUrdu ? 'اسسٹنٹ ایجوکیشن آفیسر / سکول ریکارڈ سسٹم' : 'Assistant Education Officer / School Record System'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'ای ایم آئی ایس کوڈ یا صارف کا نام' : 'EMIS Code / Official Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. 37120101 or aeo.pindigheb"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isUrdu
                  ? 'سکول ہیڈز اپنے 8 ہندسوں کا EMIS کوڈ درج کریں۔'
                  : 'School heads: enter your 8-digit EMIS code as username.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'پاس ورڈ' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isUrdu
                  ? 'ابتدائی عارضی پاس ورڈ آپ کا اپنا EMIS کوڈ ہی ہے۔'
                  : 'For new schools, initial temporary password is your EMIS code.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? (isUrdu ? 'تصدیق ہو رہی ہے...' : 'Authenticating...') : (isUrdu ? 'لاگ ان کریں' : 'Sign In')}
              </button>
            </div>
          </form>

          {/* Quick Demo Selector for Reviewers & Field Officers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isUrdu ? 'فوری ٹیسٹ اور جائزہ کیلئے منتخب کریں' : 'Instant Demo Switcher (1-Click)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickSelect('aeo_admin')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800 truncate">
                      {isUrdu ? 'معاون تعلیمی افسر' : 'AEO Officer (Admin)'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Full cluster oversight</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('supervisor')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-800 truncate">
                      {isUrdu ? 'نگران افسر' : 'Supervisor / Dy DEO'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Read-only audit view</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('school_user', '37120101')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-amber-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-800 truncate">
                      GPS Pindi Gheb No. 1
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono truncate">37120101 (Public)</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('school_user', '37120102')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-purple-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-800 truncate">
                      GGES Malhuwali
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono truncate">37120102 (Approved)</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
