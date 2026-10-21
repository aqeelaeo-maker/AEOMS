import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  School,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Globe
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const { language, setLanguage, isUrdu } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(isUrdu ? 'براہ کرم یوزر نیم اور پاس ورڈ درج کریں۔' : 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || (isUrdu ? 'لاگ ان ناکام رہا۔ تفصیلات چیک کریں۔' : 'Invalid credentials. Please check details.'));
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex flex-col justify-between font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with Language Selector */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-emerald-800/60 bg-emerald-950/40 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center text-white font-black text-sm shadow-md">
            SED
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-emerald-300">
              {isUrdu ? 'حکومت پنجاب · سکول ایجوکیشن ڈیپارٹمنٹ' : 'Govt. of the Punjab · School Education Dept'}
            </div>
            <div className="text-sm font-bold text-white">
              {isUrdu ? 'دفتر ڈپٹی ڈی ای او و اسسٹنٹ ایجوکیشن آفیسرز' : 'Office of Dy. DEO & Assistant Education Officers'}
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-emerald-900/80 p-1 rounded-lg border border-emerald-700/60">
          <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
              language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors font-urdu ${
              language === 'ur' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
            }`}
          >
            اردو
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Official Portal Overview & Credentials Guide */}
        <div className="w-full lg:w-1/2 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{isUrdu ? 'آفیشل پورٹل لاگ ان برائے سال 2026-27' : 'Official Portal Login · Session 2026-27'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isUrdu
                ? 'معاون تعلیمی افسر (AEO) و سکولز سنٹرلائزڈ ڈیٹا پورٹل'
                : 'AEO School Data Management & Verification Portal'}
            </h1>
            <p className="mt-2 text-sm text-emerald-200/90 leading-relaxed font-sans">
              {isUrdu
                ? 'تحصیل پنڈی گھیب، ضلع اٹک کے تمام پرائمری، ایلیمنٹری، ہائی، پرائیویٹ، پیما اور پیف سکولز کا مصدقہ ریکارڈ و نان سیلری بجٹ نگرانی سسٹم۔'
                : 'Centralized oversight for all Public, Private, PEIMA, and PEF schools across Markaz Pindi Gheb City, Malhuwali, Ikhlas, and Khaur.'}
            </p>
          </div>

          {/* Official Default Credentials Info Cards */}
          <div className="space-y-3 pt-2">
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-300">
              {isUrdu ? 'سرکاری ڈیفالٹ اسناد و ہدایات:' : 'Official Default Login Credentials:'}
            </div>

            {/* Dy. DEO Card */}
            <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 hover:border-amber-400/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isUrdu ? 'ڈپٹی ڈی ای او (سپر ایڈمن)' : 'Deputy District Education Officer (Dy. DEO)'}
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      {isUrdu ? 'تمام اے ای اوز ریکارڈز پر CRUD اختیارات' : 'Full CRUD access over all Assistant Education Officers'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickFill('Admin', 'admin')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md transition-colors shrink-0"
                >
                  {isUrdu ? 'کوائف بھریں' : 'Fill'} Admin / admin
                </button>
              </div>
            </div>

            {/* AEO Card */}
            <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 hover:border-emerald-400/60 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isUrdu ? 'اسسٹنٹ ایجوکیشن آفیسرز (AEOs)' : 'Assistant Education Officers (AEOs)'}
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      {isUrdu ? 'یوزر نیم اور پاس ورڈ: اے ای او کا شناختی کارڈ (CNIC)' : 'Username & Password: CNIC Number of AEO'}
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Markaz Selectors */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('37102-1122334-1', '37102-1122334-1')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">Pindi Gheb City</span>
                  <span className="font-mono text-amber-300">37102-1122334-1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('37102-2233445-3', '37102-2233445-3')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">Malhuwali</span>
                  <span className="font-mono text-amber-300">37102-2233445-3</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('37102-3344556-5', '37102-3344556-5')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">Ikhlas</span>
                  <span className="font-mono text-amber-300">37102-3344556-5</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('37102-4455667-7', '37102-4455667-7')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">Khaur</span>
                  <span className="font-mono text-amber-300">37102-4455667-7</span>
                </button>
              </div>
            </div>

            {/* School Card */}
            <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 hover:border-blue-400/60 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isUrdu ? 'سکولز (سرکاری، پرائیویٹ، پیما، پیف)' : 'Schools (Institutions)'}
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      {isUrdu ? 'یوزر نیم اور پاس ورڈ: سکول کا EMIS کوڈ' : 'Username & Password: EMIS Code of School'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('37120101', '37120101')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">GPS Pindi Gheb 1</span>
                  <span className="font-mono text-cyan-300">EMIS: 37120101</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('37120102', '37120102')}
                  className="p-1.5 rounded-md bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-700/60 text-left text-[10px] text-emerald-200 transition-colors"
                >
                  <span className="font-bold text-white block">GGES Malhuwali</span>
                  <span className="font-mono text-cyan-300">EMIS: 37120102</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-900">
            {/* Form Top Banner */}
            <div className="bg-emerald-900 p-6 text-white text-center border-b border-emerald-800">
              <div className="w-12 h-12 bg-emerald-800/80 border border-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <LogIn className="w-6 h-6 text-emerald-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {isUrdu ? 'سرکاری لاگ ان' : 'Sign In to Account'}
              </h2>
              <p className="text-xs text-emerald-200/90 mt-1">
                {isUrdu
                  ? 'اپنے تفویض کردہ سرکاری اسناد کے ذریعے لاگ ان کریں'
                  : 'Enter your designated official credentials to proceed'}
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUrdu ? 'سرکاری یوزر نیم / شناختی کارڈ / EMIS کوڈ' : 'Official Username / CNIC / EMIS Code'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Admin, CNIC, or EMIS code"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Dy. DEO: <strong className="font-mono text-emerald-700">Admin</strong></span>
                  <span>AEO: <strong className="font-mono text-emerald-700">CNIC</strong></span>
                  <span>School: <strong className="font-mono text-emerald-700">EMIS</strong></span>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isUrdu ? 'پاس ورڈ' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {isUrdu
                    ? 'پہلی بار لاگ ان کے بعد پاس ورڈ تبدیل کرنے کا آپشن دستیاب ہے۔'
                    : 'Option to change password is provided after signing in.'}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isUrdu ? 'تصدیق جاری ہے...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isUrdu ? 'پورٹل میں لاگ ان کریں' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Card Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
              {isUrdu
                ? 'کسی بھی لاگ ان مسئلے کی صورت میں ڈپٹی ڈی ای او پنڈی گھیب سے رابطہ کریں۔'
                : 'For credentials inquiry or password reset, contact Dy. DEO Pindi Gheb.'}
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="w-full px-4 sm:px-8 py-3.5 border-t border-emerald-800/50 bg-emerald-950/60 text-xs text-emerald-300 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          {isUrdu
            ? 'معاون تعلیمی افسر (AEO) پورٹل · سکول ایجوکیشن ڈیپارٹمنٹ حکومت پنجاب'
            : 'Assistant Education Officer (AEO) Portal · School Education Department, Govt. of the Punjab'}
        </div>
        <div className="font-mono text-[11px] text-emerald-400">
          Markaz Pindi Gheb · Attock · Academic Year 2026-27
        </div>
      </footer>
    </div>
  );
};
