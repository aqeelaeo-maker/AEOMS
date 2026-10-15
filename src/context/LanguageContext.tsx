import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ur';

interface Translations {
  [key: string]: {
    en: string;
    ur: string;
  };
}

export const translations: Translations = {
  // App & Header
  appTitle: {
    en: 'AEO School Data Management System',
    ur: 'معاون تعلیمی افسر - سکول ڈیٹا مینجمنٹ سسٹم'
  },
  subTitle: {
    en: 'Markaz Pindi Gheb / Cluster Education Monitoring',
    ur: 'مرکز پنڈی گھیب / کلسٹر ایجوکیشن مانیٹرنگ'
  },
  department: {
    en: 'School Education Department, Govt. of Punjab',
    ur: 'محکمہ سکول ایجوکیشن، حکومت پنجاب'
  },
  
  // Navigation & Tabs
  dashboard: {
    en: 'Consolidated Dashboard',
    ur: 'مرکزی ڈیش بورڈ'
  },
  schoolsDirectory: {
    en: 'Schools Directory',
    ur: 'سکولوں کی فہرست'
  },
  schoolProfile: {
    en: 'School Profile',
    ur: 'سکول پروفائل'
  },
  enrollment: {
    en: 'Enrollment & Attendance',
    ur: 'داخلہ اور حاضری ریکارڈ'
  },
  nsbFunds: {
    en: 'NSB Funds & Expenditure',
    ur: 'نان سیلری بجٹ (NSB) و اخراجات'
  },
  ftfFunds: {
    en: 'FTF Collections & Register',
    ur: 'فروغِ تعلیم فنڈ (FTF) رجسٹر'
  },
  buildingFacilities: {
    en: 'Building & Facilities',
    ur: 'عمارات اور بنیادی سہولیات'
  },
  teachersStaff: {
    en: 'Teachers & Staff',
    ur: 'اساتذہ کرام اور عملہ'
  },
  documentUploads: {
    en: 'Evidence & Documents',
    ur: 'دستاویزات و تصدیقی شواہد'
  },
  submissionsVerification: {
    en: 'Submissions & Verification',
    ur: 'کوائف جمع اور توثیق کا عمل'
  },
  reportsAnalytics: {
    en: 'Reports & Exports',
    ur: 'رپورٹس اور پرنٹ'
  },
  auditTrail: {
    en: 'System Audit Logs',
    ur: 'آڈٹ ٹریل اور ریکارڈ'
  },

  // Roles & Badges
  aeoAdministrator: {
    en: 'AEO Administrator',
    ur: 'معاون تعلیمی افسر (ایڈمن)'
  },
  schoolHead: {
    en: 'School Head / In-charge',
    ur: 'سربراہ ادارہ / ہیڈ ٹیچر'
  },
  supervisor: {
    en: 'Supervisor / Dy. DEO',
    ur: 'نگران افسر / ڈپٹی ڈی ای او'
  },
  emisCode: {
    en: 'EMIS Code',
    ur: 'ای ایم آئی ایس کوڈ'
  },
  
  // Statuses
  draft: {
    en: 'Draft (Incomplete)',
    ur: 'غیر حتمی / مسودہ'
  },
  submitted: {
    en: 'Submitted to AEO',
    ur: 'جمع کروا دیا گیا'
  },
  underReview: {
    en: 'Under Review',
    ur: 'زیرِ جائزہ'
  },
  approved: {
    en: 'Approved & Verified',
    ur: 'منظور شدہ و تصدیق شدہ'
  },
  returned: {
    en: 'Returned for Correction',
    ur: 'برائے درستی واپس'
  },

  // School Categories
  publicSchool: {
    en: 'Public (Govt.)',
    ur: 'سرکاری سکول'
  },
  privateSchool: {
    en: 'Private Registered',
    ur: 'پرائیویٹ سکول'
  },
  peimaSchool: {
    en: 'PEIMA (PPP)',
    ur: 'پیما (PEIMA)'
  },
  pefSchool: {
    en: 'PEF (Foundation)',
    ur: 'پیف (PEF)'
  },

  // Actions
  saveChanges: {
    en: 'Save Changes',
    ur: 'تبدیلیاں محفوظ کریں'
  },
  submitForReview: {
    en: 'Submit to AEO for Verification',
    ur: 'معاون تعلیمی افسر کو توثیق کیلئے بھیجیں'
  },
  approveSubmission: {
    en: 'Approve & Validate Dossier',
    ur: 'سکول کوائف کی منظوری دیں'
  },
  returnForCorrection: {
    en: 'Return with Correction Notes',
    ur: 'اعتراضات / درستی نوٹ کے ساتھ واپس کریں'
  },
  exportExcel: {
    en: 'Export to Excel / CSV',
    ur: 'ایکسل رپورٹ ڈاؤن لوڈ کریں'
  },
  printDossier: {
    en: 'Print Official Dossier',
    ur: 'سرکاری فائل پرنٹ کریں'
  },
  changePassword: {
    en: 'Change Password',
    ur: 'پاس ورڈ تبدیل کریں'
  },
  logout: {
    en: 'Sign Out',
    ur: 'لاگ آؤٹ'
  },
  login: {
    en: 'Sign In',
    ur: 'لاگ ان کریں'
  },
  searchPlaceholder: {
    en: 'Search by school name, EMIS code, or markaz...',
    ur: 'سکول کے نام، ای ایم آئی ایس کوڈ یا مرکز سے تلاش کریں...'
  },
  allSchools: {
    en: 'All Schools',
    ur: 'تمام سکول'
  },
  filterByCategory: {
    en: 'Category Filter',
    ur: 'کیٹیگری فلٹر'
  },
  markazFilter: {
    en: 'Markaz / Cluster',
    ur: 'مرکز / کلسٹر'
  },
  totalEnrollment: {
    en: 'Total Enrollment',
    ur: 'کل داخلہ طلباء'
  },
  boysCount: {
    en: 'Boys',
    ur: 'طلباء (لڑکے)'
  },
  girlsCount: {
    en: 'Girls',
    ur: 'طالبات (لڑکیاں)'
  },
  nsbUtilization: {
    en: 'NSB Utilization',
    ur: 'نان سیلری بجٹ استعمال'
  },
  totalSanctionedPosts: {
    en: 'Sanctioned Posts',
    ur: 'منظور شدہ آسامیاں'
  },
  vacantPosts: {
    en: 'Vacant Posts',
    ur: 'خالی آسامیاں'
  },
  cleanDrinkingWater: {
    en: 'Clean Water',
    ur: 'صاف پینے کا پانی'
  },
  boundaryWall: {
    en: 'Boundary Wall',
    ur: 'چاردیواری کی حالت'
  },
  solarPower: {
    en: 'Solar System',
    ur: 'سولر انرجی سسٹم'
  },
  dilapidatedRooms: {
    en: 'Dangerous Classrooms',
    ur: 'خستہ حال کمرے'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isUrdu: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('aeo_app_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aeo_app_language', lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isUrdu: language === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
