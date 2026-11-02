import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { SchoolEducationDeptLogo } from '../common/OfficialLogos';

export const SignInPage: React.FC = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please check details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-900">
        {/* Header: School Education Department Logo & Official Titles */}
        <div className="bg-emerald-900 p-6 sm:p-7 text-white text-center border-b border-emerald-800">
          <div className="flex items-center justify-center mx-auto mb-3.5">
            <SchoolEducationDeptLogo size="xl" />
          </div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-emerald-100 whitespace-nowrap">
            Government of Punjab
          </h1>
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-white mt-1.5 whitespace-nowrap">
            Deputy District Education Office (W-EE) Pindi Gheb
          </h2>
        </div>

        {/* Form: Username & Password */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
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
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
