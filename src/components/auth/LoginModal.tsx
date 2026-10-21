import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, Shield, UserCheck, KeyRound, LogIn, School as SchoolIcon, Eye, EyeOff } from 'lucide-react';
import { getSchools } from '../../services/storage';
import { SchoolEducationDeptLogo } from '../common/OfficialLogos';

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

  const handleQuickSelect = (role: 'dy_deo' | 'aeo_admin' | 'supervisor' | 'school_user', emisOrUsername?: string) => {
    demoLogin(role, emisOrUsername);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 border-b border-emerald-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SchoolEducationDeptLogo size="sm" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  {isUrdu ? 'سرکاری لاگ ان پورٹل' : 'Official Portal Sign In'}
                </h3>
                <p className="text-xs text-emerald-300">
                  {isUrdu ? 'ڈپٹی ڈی ای او / معاون تعلیمی افسر / سکول پورٹل' : 'Deputy DEO / Assistant Education Officer / School Portal'}
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
                {isUrdu ? 'سرکاری ای میل / یوزر نیم / EMIS کوڈ' : 'Official Email / Username / EMIS Code'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. dydeowpindigheb@gmail.com, aeo.pindigheb, or 37120101"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isUrdu
                  ? 'ڈپٹی ڈی ای او: dydeowpindigheb@gmail.com · اے ای اوز: اپنے مرکز کا یوزر نیم · سکولز: اپنا 8 ہندسوں کا EMIS کوڈ'
                  : 'Dy. DEO: dydeowpindigheb@gmail.com · AEOs: official username · Schools: 8-digit EMIS code.'}
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
                  ? 'اے ای اوز کے اسناد ڈپٹی ڈی ای او اور سکولوں کے اسناد متعلقہ اے ای او نے ترتیب دیے ہیں۔'
                  : 'AEO credentials set by Dy. DEO; school credentials set by their Markaz AEO.'}
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
                {isUrdu ? 'فوری ٹیسٹ اور جائزہ کیلئے منتخب کریں' : 'Role Simulator (1-Click)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickSelect('dy_deo')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800 truncate">
                      {isUrdu ? 'ڈپٹی ڈی ای او' : 'Dy. DEO (Authority)'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">dydeowpindigheb@gmail.com</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('aeo_admin', 'aeo.pindigheb')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-800 truncate">
                      AEO Pindi Gheb City
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono truncate">Markaz: Pindi Gheb City</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('aeo_admin', 'aeo.khaur')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-800 truncate">
                      AEO Khaur
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono truncate">Markaz: Khaur</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('school_user', '37120101')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-800 truncate">
                      GPS Pindi Gheb No. 1
                    </div>
                    <div className="text-[10px] text-blue-700 font-mono truncate">EMIS: 37120101</div>
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
