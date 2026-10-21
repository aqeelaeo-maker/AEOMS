import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AeoCredentialsManager } from './AeoCredentialsManager';
import { SchoolCredentialsManager } from './SchoolCredentialsManager';
import { KeyRound, Shield, School, Users } from 'lucide-react';
import { SchoolEducationDeptLogo } from '../common/OfficialLogos';

export const CredentialsManagementHub: React.FC = () => {
  const { isDyDEO, isAEO } = useAuth();
  const { isUrdu } = useLanguage();

  // If Dy DEO, allow toggling between AEO Credentials and School Credentials
  const [activeSubTab, setActiveSubTab] = useState<'aeo' | 'school'>('aeo');

  if (!isDyDEO && !isAEO) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          {isUrdu ? 'رسائی ممنوع ہے' : 'Access Restricted'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {isUrdu
            ? 'صرف مجاز افسران (ڈپٹی ڈی ای او اور اے ای او) اسناد کا انتظام کر سکتے ہیں۔'
            : 'Only authorized officers (Dy. DEO & AEOs) have access to credentials management.'}
        </p>
      </div>
    );
  }

  // If AEO, show School Credentials directly
  if (!isDyDEO) {
    return <SchoolCredentialsManager />;
  }

  return (
    <div className="space-y-6">
      {/* Official Header Banner with School Education Department Logo */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-md border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center shrink-0 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs border border-white/20">
            <SchoolEducationDeptLogo size="md" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
              {isUrdu ? 'سرکاری لاگ ان اسناد و رسائی کنٹرول' : 'Official Portal Credentials & Role Access'}
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isUrdu ? 'اسناد و پاس ورڈ مینیجر' : 'Official Credentials Hub'}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {isUrdu
                ? 'ڈپٹی ڈی ای او پنڈی گھیب: تمام اسسٹنٹ ایجوکیشن آفیسرز اور سکولز کے لاگ ان کی نگرانی'
                : 'Dy. DEO Oversight: Full CRUD over AEO officers and Tehsil Pindi Gheb schools'}
            </p>
          </div>
        </div>

        {/* Segmented Control for Dy. DEO */}
        <div className="inline-flex p-1 bg-emerald-950/90 rounded-xl border border-emerald-700/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('aeo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'aeo'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{isUrdu ? '1. اے ای اوز اسناد (CRUD)' : '1. AEO Credentials (CRUD)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('school')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'school'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
          >
            <School className="w-4 h-4" />
            <span>{isUrdu ? '2. سکول اسناد و پاس ورڈز' : '2. School Credentials & Passwords'}</span>
          </button>
        </div>
      </div>

      {/* Render selected manager */}
      {activeSubTab === 'aeo' ? (
        <AeoCredentialsManager />
      ) : (
        <SchoolCredentialsManager />
      )}
    </div>
  );
};
