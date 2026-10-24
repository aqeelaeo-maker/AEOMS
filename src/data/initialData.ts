import {
  School,
  UserAccount,
  EnrollmentData,
  NSBData,
  FTFData,
  BuildingAndFacilitiesData,
  StaffSummaryData,
  DocumentUpload,
  SubmissionRecord,
  AuditLogEntry
} from '../types';

// Simple SHA-256 equivalent hash simulator for secure password verification
export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + '_aeo_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial realistic schools in Markaz Pindi Gheb / District Attock
export const initialSchools: School[] = [
  {
    emisCode: '37120101',
    name: 'Govt. Primary School Pindi Gheb No. 1',
    nameUrdu: 'گورنمنٹ پرائمری سکول پنڈی گھیب نمبر 1',
    category: 'Public',
    level: 'Primary',
    gender: 'Boys',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Pindi Gheb City',
    unionCouncil: 'UC City Pindi Gheb',
    address: 'Near Old Tehsil Road, Mohallah Sheikhan, Pindi Gheb',
    addressUrdu: 'نزد پرانی تحصیل روڈ، محلہ شیخان، پنڈی گھیب',
    headTeacherName: 'Muhammad Arshad',
    headTeacherCnic: '37102-1234567-1',
    headTeacherPhone: '0300-5544331',
    shift: 'Morning',
    establishmentYear: '1962',
    status: 'active'
  },
  {
    emisCode: '37120102',
    name: 'Govt. Girls Elementary School Malhuwali',
    nameUrdu: 'گورنمنٹ گرلز ایلیمنٹری سکول ملہوالی',
    category: 'Public',
    level: 'Elementary',
    gender: 'Girls',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Malhuwali',
    unionCouncil: 'UC Malhuwali',
    address: 'Main Talagang-Pindi Gheb Road, Village Malhuwali',
    addressUrdu: 'مین تلہ گنگ روڈ، گاؤں ملہوالی، پنڈی گھیب',
    headTeacherName: 'Nasreen Akhtar',
    headTeacherCnic: '37102-9876543-2',
    headTeacherPhone: '0333-8899112',
    shift: 'Morning',
    establishmentYear: '1978',
    status: 'active'
  },
  {
    emisCode: '37120103',
    name: 'Govt. High School Ikhlas',
    nameUrdu: 'گورنمنٹ ہائی سکول اخلاص',
    category: 'Public',
    level: 'High',
    gender: 'Boys',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Ikhlas',
    unionCouncil: 'UC Ikhlas',
    address: 'Circular Road, Ikhlas Village, Pindi Gheb',
    addressUrdu: 'سرکلر روڈ، گاؤں اخلاص، پنڈی گھیب',
    headTeacherName: 'Tariq Mehmood',
    headTeacherCnic: '37102-4567890-3',
    headTeacherPhone: '0301-4455667',
    shift: 'Morning',
    establishmentYear: '1954',
    status: 'active'
  },
  {
    emisCode: '37120104',
    name: 'Govt. Primary School Dandi',
    nameUrdu: 'گورنمنٹ پرائمری سکول ڈنڈی',
    category: 'Public',
    level: 'Primary',
    gender: 'Co-Education',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Khaur',
    unionCouncil: 'UC Khaur Company',
    address: 'Dhok Dandi, Near Khaur Oil Fields',
    addressUrdu: 'ڈھوک ڈنڈی، نزد کھوڑ آئل فیلڈز، پنڈی گھیب',
    headTeacherName: 'Abdul Waheed',
    headTeacherCnic: '37102-7788990-1',
    headTeacherPhone: '0345-1234567',
    shift: 'Morning',
    establishmentYear: '1989',
    status: 'active'
  },
  {
    emisCode: '37120105',
    name: 'Govt. Girls Higher Secondary School Pindi Gheb',
    nameUrdu: 'گورنمنٹ گرلز ہائر سیکنڈری سکول پنڈی گھیب',
    category: 'Public',
    level: 'Higher Secondary',
    gender: 'Girls',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Pindi Gheb City',
    unionCouncil: 'UC City Pindi Gheb',
    address: 'College Road, Civil Lines, Pindi Gheb',
    addressUrdu: 'کالج روڈ، سول لائنز، پنڈی گھیب',
    headTeacherName: 'Dr. Rubina Kausar',
    headTeacherCnic: '37102-3344556-4',
    headTeacherPhone: '0300-9988776',
    shift: 'Morning',
    establishmentYear: '1947',
    status: 'active'
  },
  {
    emisCode: '37120201',
    name: 'The Educators Pindi Gheb Campus',
    nameUrdu: 'دی ایجوکیٹرز پنڈی گھیب کیمپس',
    category: 'Private',
    level: 'High',
    gender: 'Co-Education',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Pindi Gheb City',
    unionCouncil: 'UC City Pindi Gheb',
    address: 'Bhimber Road, Model Town, Pindi Gheb',
    addressUrdu: 'ماڈل ٹاؤن، پنڈی گھیب',
    headTeacherName: 'Rashid Minhas',
    headTeacherCnic: '37102-6677889-1',
    headTeacherPhone: '0321-7766554',
    shift: 'Morning',
    establishmentYear: '2008',
    status: 'active'
  },
  {
    emisCode: '37120301',
    name: 'PEIMA Community Model School Khaur',
    nameUrdu: 'پیما کمیونٹی ماڈل سکول کھوڑ',
    category: 'PEIMA',
    level: 'Elementary',
    gender: 'Co-Education',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Khaur',
    unionCouncil: 'UC Khaur Company',
    address: 'POL Colony Road, Khaur',
    addressUrdu: 'پی او ایل کالونی روڈ، کھوڑ، پنڈی گھیب',
    headTeacherName: 'Sajid Mehmood',
    headTeacherCnic: '37102-5544332-1',
    headTeacherPhone: '0334-2233445',
    shift: 'Morning',
    establishmentYear: '2019',
    status: 'active'
  },
  {
    emisCode: '37120401',
    name: 'PEF Foundation Assisted School (FAS) Ikhlas',
    nameUrdu: 'پیف فاؤنڈیشن اسسٹڈ سکول اخلاص',
    category: 'PEF',
    level: 'Elementary',
    gender: 'Co-Education',
    district: 'Attock',
    tehsil: 'Pindi Gheb',
    markaz: 'Ikhlas',
    unionCouncil: 'UC Ikhlas',
    address: 'Dhok Fateh Road, Ikhlas',
    addressUrdu: 'ڈھوک فتح روڈ، اخلاص، پنڈی گھیب',
    headTeacherName: 'Zubair Ahmed',
    headTeacherCnic: '37102-1122334-5',
    headTeacherPhone: '0312-5566778',
    shift: 'Morning',
    establishmentYear: '2016',
    status: 'active'
  }
];

export const initialUsers: UserAccount[] = [
  // Deputy District Education Officer (Dy. DEO) - Manages login credentials of all AEOs
  {
    id: 'user_dydeo',
    username: 'Admin',
    displayName: 'Dy. DEO (Deputy District Education Officer)',
    role: 'dy_deo',
    email: 'dydeowpindigheb@gmail.com',
    phone: '057-2351234',
    mustChangePassword: false,
    // Default password is 'admin' (User can change after that)
    passwordHash: '65fd4e672b3a991df5254add6a12a8b02201dbdbf66fc047fec80fc6cb8d9083',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // AEO Markaz Pindi Gheb City - Username & Password: CNIC Number
  {
    id: 'user_aeo_pindigheb',
    username: '37102-1122334-1',
    cnic: '37102-1122334-1',
    displayName: 'AEO Tariq Mehmood (Markaz Pindi Gheb City)',
    role: 'aeo_admin',
    assignedMarkaz: 'Pindi Gheb City',
    email: 'aeo.pindigheb@punjab.gov.pk',
    phone: '0300-5511223',
    mustChangePassword: false,
    // Default password is CNIC '37102-1122334-1'
    passwordHash: '8be68eb81c7ce83e440bb810943c9ef29332500be00ea4132aafff085ead79e6',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // AEO Markaz Malhuwali - Username & Password: CNIC Number
  {
    id: 'user_aeo_malhuwali',
    username: '37102-2233445-3',
    cnic: '37102-2233445-3',
    displayName: 'AEO Muhammad Arshad (Markaz Malhuwali)',
    role: 'aeo_admin',
    assignedMarkaz: 'Malhuwali',
    email: 'aeo.malhuwali@punjab.gov.pk',
    phone: '0333-4455667',
    mustChangePassword: false,
    // Default password is CNIC '37102-2233445-3'
    passwordHash: '1c72376da7ab0fb48d1abd1d6bfa0bf1d1da2b7cf333f091e3181f844226ca66',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // AEO Markaz Ikhlas - Username & Password: CNIC Number
  {
    id: 'user_aeo_ikhlas',
    username: '37102-3344556-5',
    cnic: '37102-3344556-5',
    displayName: 'AEO Sajid Hussain (Markaz Ikhlas)',
    role: 'aeo_admin',
    assignedMarkaz: 'Ikhlas',
    email: 'aeo.ikhlas@punjab.gov.pk',
    phone: '0301-9988776',
    mustChangePassword: false,
    // Default password is CNIC '37102-3344556-5'
    passwordHash: '82ffe800c300bd548688f0bb81018c0ea2d9df6cb73594e2037a2d22adcadce7',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // AEO Markaz Khaur - Username & Password: CNIC Number
  {
    id: 'user_aeo_khaur',
    username: '37102-4455667-7',
    cnic: '37102-4455667-7',
    displayName: 'AEO Abdul Rehman (Markaz Khaur)',
    role: 'aeo_admin',
    assignedMarkaz: 'Khaur',
    email: 'aeo.khaur@punjab.gov.pk',
    phone: '0345-7766554',
    mustChangePassword: false,
    // Default password is CNIC '37102-4455667-7'
    passwordHash: '1c5548da616d5a2e148e135ec53474f0faa118a9cd8c7947f6f4825ca0f8e5e0',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // Supervisor / Quality Auditor
  {
    id: 'user_supervisor',
    username: 'supervisor.attock',
    displayName: 'Quality Supervisor (Read-Only)',
    role: 'supervisor',
    email: 'supervisor.attock@punjab.gov.pk',
    phone: '057-9310022',
    mustChangePassword: false,
    passwordHash: 'a577d612f0dfc8b9816df9892c9f55a1ee40eb1db8ee71441c9ecba5506085a6',
    createdAt: '2026-01-01T08:00:00Z'
  },
  // GPS Pindi Gheb No. 1 (Has not changed initial password yet -> mustChangePassword: true)
  {
    id: 'user_37120101',
    username: '37120101',
    displayName: 'Head Teacher, GPS Pindi Gheb No. 1',
    role: 'school_user',
    schoolEmisCode: '37120101',
    email: 'gps.pindigheb1@punjab.gov.pk',
    phone: '0300-5544331',
    mustChangePassword: true,
    // Password matches initial EMIS '37120101'
    passwordHash: '37120101_initial_hash',
    createdAt: '2026-01-10T10:00:00Z'
  },
  // GGES Malhuwali
  {
    id: 'user_37120102',
    username: '37120102',
    displayName: 'Headmistress, GGES Malhuwali',
    role: 'school_user',
    schoolEmisCode: '37120102',
    email: 'gges.malhuwali@punjab.gov.pk',
    phone: '0333-8899112',
    mustChangePassword: false,
    passwordHash: '37120102_hashed_custom',
    createdAt: '2026-01-10T10:00:00Z'
  },
  // GHS Ikhlas
  {
    id: 'user_37120103',
    username: '37120103',
    displayName: 'Principal, GHS Ikhlas',
    role: 'school_user',
    schoolEmisCode: '37120103',
    email: 'ghs.ikhlas@punjab.gov.pk',
    phone: '0301-4455667',
    mustChangePassword: false,
    passwordHash: '37120103_hashed_custom',
    createdAt: '2026-01-10T10:00:00Z'
  },
  // PEIMA Khaur
  {
    id: 'user_37120301',
    username: '37120301',
    displayName: 'In-charge, PEIMA Model Khaur',
    role: 'school_user',
    schoolEmisCode: '37120301',
    email: 'peima.khaur@punjab.gov.pk',
    phone: '0334-2233445',
    mustChangePassword: false,
    passwordHash: '37120301_hashed_custom',
    createdAt: '2026-01-10T10:00:00Z'
  }
];

// Seeded Enrollment Data
export const initialEnrollment: Record<string, EnrollmentData> = {
  '37120101': {
    schoolEmisCode: '37120101',
    academicYear: '2026-2027',
    reportingMonth: 'October 2026',
    grades: [
      { grade: 'ECE / Kachi', boys: 28, girls: 0, total: 28 },
      { grade: 'Class 1', boys: 32, girls: 0, total: 32 },
      { grade: 'Class 2', boys: 35, girls: 0, total: 35 },
      { grade: 'Class 3', boys: 30, girls: 0, total: 30 },
      { grade: 'Class 4', boys: 27, girls: 0, total: 27 },
      { grade: 'Class 5', boys: 34, girls: 0, total: 34 }
    ],
    totalBoys: 186,
    totalGirls: 0,
    grandTotal: 186,
    minorityStudents: 4,
    cwsnStudents: 2,
    bFormVerifiedCount: 178,
    averageAttendancePercent: 91.5,
    dropoutCount: 1,
    lastUpdated: '2026-10-12T10:30:00Z',
    updatedBy: 'Muhammad Arshad (Head Teacher)'
  },
  '37120102': {
    schoolEmisCode: '37120102',
    academicYear: '2026-2027',
    reportingMonth: 'October 2026',
    grades: [
      { grade: 'ECE / Kachi', boys: 0, girls: 34, total: 34 },
      { grade: 'Class 1', boys: 0, girls: 38, total: 38 },
      { grade: 'Class 2', boys: 0, girls: 40, total: 40 },
      { grade: 'Class 3', boys: 0, girls: 36, total: 36 },
      { grade: 'Class 4', boys: 0, girls: 35, total: 35 },
      { grade: 'Class 5', boys: 0, girls: 32, total: 32 },
      { grade: 'Class 6', boys: 0, girls: 45, total: 45 },
      { grade: 'Class 7', boys: 0, girls: 42, total: 42 },
      { grade: 'Class 8', boys: 0, girls: 38, total: 38 }
    ],
    totalBoys: 0,
    totalGirls: 340,
    grandTotal: 340,
    minorityStudents: 6,
    cwsnStudents: 3,
    bFormVerifiedCount: 335,
    averageAttendancePercent: 94.2,
    dropoutCount: 0,
    lastUpdated: '2026-10-14T09:15:00Z',
    updatedBy: 'Nasreen Akhtar (Headmistress)'
  },
  '37120103': {
    schoolEmisCode: '37120103',
    academicYear: '2026-2027',
    reportingMonth: 'October 2026',
    grades: [
      { grade: 'Class 6', boys: 78, girls: 0, total: 78 },
      { grade: 'Class 7', boys: 72, girls: 0, total: 72 },
      { grade: 'Class 8', boys: 80, girls: 0, total: 80 },
      { grade: 'Class 9', boys: 95, girls: 0, total: 95 },
      { grade: 'Class 10', boys: 89, girls: 0, total: 89 }
    ],
    totalBoys: 414,
    totalGirls: 0,
    grandTotal: 414,
    minorityStudents: 8,
    cwsnStudents: 4,
    bFormVerifiedCount: 405,
    averageAttendancePercent: 88.7,
    dropoutCount: 3,
    lastUpdated: '2026-10-11T11:45:00Z',
    updatedBy: 'Tariq Mehmood (Principal)'
  },
  '37120301': {
    schoolEmisCode: '37120301',
    academicYear: '2026-2027',
    reportingMonth: 'October 2026',
    grades: [
      { grade: 'ECE / Kachi', boys: 18, girls: 16, total: 34 },
      { grade: 'Class 1', boys: 20, girls: 22, total: 42 },
      { grade: 'Class 2', boys: 19, girls: 17, total: 36 },
      { grade: 'Class 3', boys: 15, girls: 18, total: 33 },
      { grade: 'Class 4', boys: 16, girls: 14, total: 30 },
      { grade: 'Class 5', boys: 17, girls: 19, total: 36 }
    ],
    totalBoys: 105,
    totalGirls: 106,
    grandTotal: 211,
    minorityStudents: 2,
    cwsnStudents: 1,
    bFormVerifiedCount: 205,
    averageAttendancePercent: 93.0,
    dropoutCount: 1,
    lastUpdated: '2026-10-13T14:20:00Z',
    updatedBy: 'Sajid Mehmood'
  }
};

// Seeded NSB (Non-Salary Budget) Funds Data
export const initialNSB: Record<string, NSBData> = {
  '37120101': {
    schoolEmisCode: '37120101',
    financialYear: '2026-2027',
    balanceOn30June2026: 42500,
    firstInstallment: 80000,
    secondInstallment: 80000,
    thirdInstallment: 0,
    forthInstallment: 0,
    totalIncome: 202500, // 42500 + 80000 + 80000 + 0 + 0
    totalExpenditure: 114200,
    currentBalance: 88300,
    openingBalance: 42500,
    totalAnnualAllocation: 320000,
    q1Funds: 80000,
    q2Funds: 80000,
    q3Funds: 0,
    q4Funds: 0,
    totalReceived: 202500,
    expendituresByHead: {
      'School Cleaning & Hygiene': 28500,
      'Minor Repair & Maintenance': 34000,
      'Stationery & Examination': 18700,
      'Utility Bills (Electricity/Water/Gas)': 19000,
      'Instructional Aids & TLM': 9500,
      'IT / Computer Lab Maintenance': 0,
      'Sports & Co-Curricular': 4500,
      'Miscellaneous & First Aid': 0
    },
    transactions: [
      {
        id: 'nsb_tx_01',
        date: '2026-08-15',
        voucherNo: 'V-01/NSB',
        head: 'School Cleaning & Hygiene',
        description: 'Monthly disinfectant phenyl, brooms, soap, and sanitation supplies',
        amount: 8500,
        vendorName: 'Attock Traders Pindi Gheb',
        receiptNumber: 'INV-4412',
        createdAt: '2026-08-15T10:00:00Z'
      },
      {
        id: 'nsb_tx_02',
        date: '2026-08-28',
        voucherNo: 'V-02/NSB',
        head: 'Minor Repair & Maintenance',
        description: 'Ceiling fan rewinding (3 units) and classroom switchboard repair',
        amount: 14000,
        vendorName: 'Al-Madina Electric Works',
        receiptNumber: 'RC-998',
        createdAt: '2026-08-28T11:30:00Z'
      },
      {
        id: 'nsb_tx_03',
        date: '2026-09-10',
        voucherNo: 'V-03/NSB',
        head: 'Stationery & Examination',
        description: 'Mid-term answer sheets, attendance registers, and whiteboard markers',
        amount: 18700,
        vendorName: 'Iqbal Stationery Mart',
        receiptNumber: 'ST-502',
        createdAt: '2026-09-10T09:00:00Z'
      },
      {
        id: 'nsb_tx_04',
        date: '2026-09-22',
        voucherNo: 'V-04/NSB',
        head: 'Minor Repair & Maintenance',
        description: 'Water storage tank float valve replacement and tap repairs',
        amount: 20000,
        vendorName: 'Bismillah Sanitary Store',
        receiptNumber: 'SN-108',
        createdAt: '2026-09-22T14:15:00Z'
      },
      {
        id: 'nsb_tx_05',
        date: '2026-10-05',
        voucherNo: 'V-05/NSB',
        head: 'Utility Bills (Electricity/Water/Gas)',
        description: 'IESCO Commercial electricity bill payment for Sep 2026',
        amount: 19000,
        vendorName: 'National Bank of Pakistan (NBP)',
        receiptNumber: 'IESCO-3712-SEP',
        createdAt: '2026-10-05T12:00:00Z'
      }
    ],
    bankName: 'National Bank of Pakistan (Pindi Gheb Branch)',
    bankBranch: 'Main Bazar Pindi Gheb (0244)',
    accountNumber: 'PK44NBP02440011223344',
    lastUpdated: '2026-10-12T11:00:00Z'
  },
  '37120102': {
    schoolEmisCode: '37120102',
    financialYear: '2026-2027',
    balanceOn30June2026: 65000,
    firstInstallment: 135000,
    secondInstallment: 135000,
    thirdInstallment: 0,
    forthInstallment: 0,
    totalIncome: 335000, // 65000 + 135000 + 135000 + 0 + 0
    totalExpenditure: 198400,
    currentBalance: 136600,
    openingBalance: 65000,
    totalAnnualAllocation: 540000,
    q1Funds: 135000,
    q2Funds: 135000,
    q3Funds: 0,
    q4Funds: 0,
    totalReceived: 335000,
    expendituresByHead: {
      'School Cleaning & Hygiene': 35000,
      'Minor Repair & Maintenance': 58000,
      'Stationery & Examination': 32400,
      'Utility Bills (Electricity/Water/Gas)': 36000,
      'Instructional Aids & TLM': 22000,
      'IT / Computer Lab Maintenance': 15000,
      'Sports & Co-Curricular': 0,
      'Miscellaneous & First Aid': 0
    },
    transactions: [],
    bankName: 'The Bank of Punjab',
    bankBranch: 'Malhuwali Branch',
    accountNumber: 'PK91BPUN01880022334455',
    lastUpdated: '2026-10-14T09:30:00Z'
  }
};

// Seeded FTF (Farogh-e-Taleem Fund) Data
export const initialFTF: Record<string, FTFData> = {
  '37120101': {
    schoolEmisCode: '37120101',
    financialYear: '2026-2027',
    openingBalance: 18400,
    totalCollected: 24500,
    totalExpenditure: 14200,
    currentBalance: 28700,
    bankName: 'National Bank of Pakistan, Pindi Gheb',
    accountNumber: 'NBP-FTF-37120101',
    committeeMembers: ['Muhammad Arshad (Head)', 'Khurram Shehzad (Parent Rep)', 'Muhammad Bilal (Teacher Rep)'],
    transactions: [
      {
        id: 'ftf_tx_01',
        date: '2026-08-20',
        type: 'collection',
        description: 'FTF monthly contribution from Class 1 to 5',
        amount: 12500,
        voucherNo: 'CR-01',
        approvedByCommittee: true,
        createdAt: '2026-08-20T10:00:00Z'
      },
      {
        id: 'ftf_tx_02',
        date: '2026-09-05',
        type: 'expenditure',
        description: 'Clean drinking water dispenser filter replacement and glasses',
        amount: 6200,
        voucherNo: 'FTF-EXP-01',
        approvedByCommittee: true,
        createdAt: '2026-09-05T11:00:00Z'
      },
      {
        id: 'ftf_tx_03',
        date: '2026-09-25',
        type: 'expenditure',
        description: 'Defense Day speech competition prizes and refreshments',
        amount: 8000,
        voucherNo: 'FTF-EXP-02',
        approvedByCommittee: true,
        createdAt: '2026-09-25T13:00:00Z'
      }
    ],
    lastUpdated: '2026-10-10T12:00:00Z'
  }
};

// Seeded Building & Facilities Data
export const initialFacilities: Record<string, BuildingAndFacilitiesData> = {
  '37120101': {
    schoolEmisCode: '37120101',
    ownership: 'Government Owned',
    totalAreaMarlas: 64, // 3 Kanals 4 Marlas
    coveredAreaSqFt: 5800,
    uncoveredAreaSqFt: 11600,
    totalClassrooms: 6,
    classroomsInUse: 5,
    dangerousClassrooms: 1, // Requires urgent AEO reporting!
    needsRepairClassrooms: 2,
    boundaryWallStatus: 'Satisfactory',
    boundaryWallHeightFt: 7,
    mainGate: true,
    electricityStatus: 'Connected',
    electricityMeterNo: 'IESCO-88371201',
    solarInstalled: true,
    solarCapacityKw: 3.5,
    drinkingWaterSource: 'Filtration Plant',
    drinkingWaterFunctional: true,
    studentToiletsTotal: 4,
    studentToiletsFunctional: 3,
    staffToiletsTotal: 1,
    staffToiletsFunctional: 1,
    scienceLab: false,
    computerLab: false,
    functionalComputers: 0,
    library: false,
    libraryBooksCount: 0,
    playground: true,
    sportsKitAvailable: true,
    fireExtinguishersCount: 2,
    firstAidBox: true,
    cctvCameras: true,
    cctvCamerasCount: 4,
    lastUpdated: '2026-10-12T10:45:00Z'
  },
  '37120102': {
    schoolEmisCode: '37120102',
    ownership: 'Government Owned',
    totalAreaMarlas: 96,
    coveredAreaSqFt: 9200,
    uncoveredAreaSqFt: 16800,
    totalClassrooms: 10,
    classroomsInUse: 10,
    dangerousClassrooms: 0,
    needsRepairClassrooms: 1,
    boundaryWallStatus: 'Satisfactory',
    boundaryWallHeightFt: 8,
    mainGate: true,
    electricityStatus: 'Connected',
    electricityMeterNo: 'IESCO-99221144',
    solarInstalled: true,
    solarCapacityKw: 5.0,
    drinkingWaterSource: 'Electric Pump',
    drinkingWaterFunctional: true,
    studentToiletsTotal: 6,
    studentToiletsFunctional: 6,
    staffToiletsTotal: 2,
    staffToiletsFunctional: 2,
    scienceLab: true,
    computerLab: true,
    functionalComputers: 15,
    library: true,
    libraryBooksCount: 450,
    playground: true,
    sportsKitAvailable: true,
    fireExtinguishersCount: 4,
    firstAidBox: true,
    cctvCameras: true,
    cctvCamerasCount: 8,
    lastUpdated: '2026-10-14T09:40:00Z'
  },
  '37120104': {
    schoolEmisCode: '37120104',
    ownership: 'Government Owned',
    totalAreaMarlas: 40,
    coveredAreaSqFt: 2400,
    uncoveredAreaSqFt: 8400,
    totalClassrooms: 3,
    classroomsInUse: 2,
    dangerousClassrooms: 1,
    needsRepairClassrooms: 1,
    boundaryWallStatus: 'Damaged / Partial', // Alert for AEO
    boundaryWallHeightFt: 4,
    mainGate: false,
    electricityStatus: 'Connected',
    electricityMeterNo: 'IESCO-44551122',
    solarInstalled: false,
    solarCapacityKw: 0,
    drinkingWaterSource: 'Hand Pump',
    drinkingWaterFunctional: true,
    studentToiletsTotal: 2,
    studentToiletsFunctional: 1,
    staffToiletsTotal: 1,
    staffToiletsFunctional: 1,
    scienceLab: false,
    computerLab: false,
    functionalComputers: 0,
    library: false,
    libraryBooksCount: 0,
    playground: true,
    sportsKitAvailable: false,
    fireExtinguishersCount: 1,
    firstAidBox: true,
    cctvCameras: false,
    cctvCamerasCount: 0,
    lastUpdated: '2026-09-20T10:00:00Z'
  }
};

// Seeded Staff Summary and Teacher Rosters
export const initialStaff: Record<string, StaffSummaryData> = {
  '37120101': {
    schoolEmisCode: '37120101',
    sanctionedTeaching: 6,
    filledTeaching: 5,
    vacantTeaching: 1, // Alert: 1 vacant PST post
    sanctionedNonTeaching: 2,
    filledNonTeaching: 2,
    vacantNonTeaching: 0,
    teachers: [
      {
        id: 'tch_01',
        name: 'Muhammad Arshad',
        cnic: '37102-1234567-1',
        personalNo: '30248819',
        designation: 'Headmaster',
        bps: 16,
        category: 'Teaching',
        gender: 'Male',
        qualification: 'M.A Urdu, M.Ed',
        subjectSpecialization: 'General / Admin',
        dateOfJoining: '2005-04-12',
        presentStationJoining: '2018-09-01',
        phone: '0300-5544331',
        status: 'Present'
      },
      {
        id: 'tch_02',
        name: 'Khurram Shehzad',
        cnic: '37102-3344112-3',
        personalNo: '31049921',
        designation: 'PST',
        bps: 14,
        category: 'Teaching',
        gender: 'Male',
        qualification: 'B.Sc, B.Ed',
        subjectSpecialization: 'Science / Math',
        dateOfJoining: '2012-08-16',
        presentStationJoining: '2019-03-15',
        phone: '0302-9988771',
        status: 'Present'
      },
      {
        id: 'tch_03',
        name: 'Muhammad Bilal',
        cnic: '37102-8877665-5',
        personalNo: '31450212',
        designation: 'PST',
        bps: 14,
        category: 'Teaching',
        gender: 'Male',
        qualification: 'B.A, B.Ed',
        subjectSpecialization: 'English / Urdu',
        dateOfJoining: '2015-11-01',
        presentStationJoining: '2020-09-10',
        phone: '0333-5566778',
        status: 'Present'
      },
      {
        id: 'tch_04',
        name: 'Amir Sohail',
        cnic: '37102-4455667-7',
        personalNo: '31889901',
        designation: 'PST',
        bps: 14,
        category: 'Teaching',
        gender: 'Male',
        qualification: 'B.Sc Computer Science',
        subjectSpecialization: 'General',
        dateOfJoining: '2019-02-20',
        presentStationJoining: '2021-04-01',
        phone: '0346-1122334',
        status: 'Present'
      },
      {
        id: 'tch_05',
        name: 'Hafiz Naveed',
        cnic: '37102-9900112-9',
        personalNo: '32001144',
        designation: 'Qari',
        bps: 12,
        category: 'Teaching',
        gender: 'Male',
        qualification: 'Shahadat-ul-Almiya, Dars-e-Nizami',
        subjectSpecialization: 'Islamiat & Quran Nazra',
        dateOfJoining: '2016-05-15',
        presentStationJoining: '2018-09-01',
        phone: '0315-7788990',
        status: 'Present'
      },
      {
        id: 'tch_06',
        name: 'Muhammad Rizwan',
        cnic: '37102-6655443-1',
        personalNo: '30998877',
        designation: 'Naib Qasid',
        bps: 2,
        category: 'Non-Teaching',
        gender: 'Male',
        qualification: 'Matric',
        subjectSpecialization: 'Office Support',
        dateOfJoining: '2010-01-10',
        presentStationJoining: '2016-01-10',
        phone: '0304-4433221',
        status: 'Present'
      },
      {
        id: 'tch_07',
        name: 'Shahbaz Masih',
        cnic: '37102-7766554-3',
        personalNo: '31112233',
        designation: 'Sweeper',
        bps: 1,
        category: 'Non-Teaching',
        gender: 'Male',
        qualification: 'Primary',
        subjectSpecialization: 'Sanitation',
        dateOfJoining: '2014-06-01',
        presentStationJoining: '2014-06-01',
        phone: '0342-9900112',
        status: 'Present'
      }
    ],
    lastUpdated: '2026-10-12T11:15:00Z'
  }
};

// Seeded Document Evidence
export const initialDocuments: DocumentUpload[] = [
  {
    id: 'doc_01',
    schoolEmisCode: '37120101',
    title: 'School Front Gate & Building Photograph',
    category: 'building_photo',
    fileDataUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    fileName: 'gps_pindigheb_gate.jpg',
    fileSizeKb: 245,
    uploadedAt: '2026-10-10T09:30:00Z',
    verified: true,
    verifiedBy: 'AEO Pindi Gheb',
    notes: 'Approved during Q1 field visit.'
  },
  {
    id: 'doc_02',
    schoolEmisCode: '37120101',
    title: 'September 2026 Paid Electricity Bill',
    category: 'utility_bill',
    fileDataUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    fileName: 'iesco_bill_sep2026.pdf',
    fileSizeKb: 412,
    uploadedAt: '2026-10-06T11:20:00Z',
    verified: true,
    verifiedBy: 'AEO Pindi Gheb',
    notes: 'Paid amount matches NSB Voucher V-05.'
  },
  {
    id: 'doc_03',
    schoolEmisCode: '37120101',
    title: 'NSB Cash Book Scan Page 42-45',
    category: 'nsb_register',
    fileDataUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    fileName: 'nsb_cashbook_q1.pdf',
    fileSizeKb: 1250,
    uploadedAt: '2026-10-12T10:00:00Z',
    verified: false,
    notes: 'Pending AEO review for October submission.'
  }
];

// Seeded Submission Records
export const initialSubmissions: SubmissionRecord[] = [
  {
    id: 'sub_37120101_q1',
    schoolEmisCode: '37120101',
    schoolName: 'Govt. Primary School Pindi Gheb No. 1',
    reportingPeriod: 'Q1 2026-27 (July - September)',
    status: 'submitted',
    submittedAt: '2026-10-12T11:30:00Z',
    submittedBy: 'Muhammad Arshad (Head Teacher)',
    reviewedAt: undefined,
    reviewedBy: undefined,
    aeoRemarks: 'Under preliminary review by AEO Pindi Gheb office.',
    returnReasons: [],
    correctionsRequested: '',
    updatedAt: '2026-10-12T11:30:00Z'
  },
  {
    id: 'sub_37120102_q1',
    schoolEmisCode: '37120102',
    schoolName: 'Govt. Girls Elementary School Malhuwali',
    reportingPeriod: 'Q1 2026-27 (July - September)',
    status: 'approved',
    submittedAt: '2026-10-08T14:00:00Z',
    submittedBy: 'Nasreen Akhtar (Headmistress)',
    reviewedAt: '2026-10-10T16:20:00Z',
    reviewedBy: 'Assistant Education Officer (Pindi Gheb)',
    aeoRemarks: 'All enrollment data, NSB expenditure vouchers, and staff attendance verified. Satisfactory compliance.',
    approvalCertificateNumber: 'AEO/PG/APPR/2026-102',
    updatedAt: '2026-10-10T16:20:00Z'
  },
  {
    id: 'sub_37120104_q1',
    schoolEmisCode: '37120104',
    schoolName: 'Govt. Primary School Dandi',
    reportingPeriod: 'Q1 2026-27 (July - September)',
    status: 'returned',
    submittedAt: '2026-10-05T09:00:00Z',
    submittedBy: 'Abdul Waheed (Head Teacher)',
    reviewedAt: '2026-10-07T11:30:00Z',
    reviewedBy: 'Assistant Education Officer (Pindi Gheb)',
    aeoRemarks: 'NSB expenditure on boundary wall repair lacks quotation comparative statement and before/after photos.',
    returnReasons: ['NSB Voucher Incomplete', 'Photographic Evidence Missing'],
    correctionsRequested: 'Please attach before/after photos of the repaired boundary wall and provide the school council resolution signature sheet.',
    updatedAt: '2026-10-07T11:30:00Z'
  },
  {
    id: 'sub_37120301_q1',
    schoolEmisCode: '37120301',
    schoolName: 'PEIMA Community Model School Khaur',
    reportingPeriod: 'Q1 2026-27 (July - September)',
    status: 'under_review',
    submittedAt: '2026-10-13T10:15:00Z',
    submittedBy: 'Sajid Mehmood (In-charge)',
    reviewedAt: undefined,
    reviewedBy: undefined,
    aeoRemarks: 'Dossier opened for inspection by Dy. DEO / AEO team.',
    updatedAt: '2026-10-13T10:15:00Z'
  }
];

// Seeded Audit Logs
export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log_01',
    schoolEmisCode: '37120102',
    schoolName: 'GGES Malhuwali',
    userId: 'user_aeo_admin',
    userName: 'AEO Pindi Gheb',
    userRole: 'aeo_admin',
    action: 'Approve Submission',
    module: 'Submissions',
    details: 'Approved Q1 2026-27 data dossier. Issued Certificate AEO/PG/APPR/2026-102.',
    timestamp: '2026-10-10T16:20:00Z'
  },
  {
    id: 'log_02',
    schoolEmisCode: '37120104',
    schoolName: 'GPS Dandi',
    userId: 'user_aeo_admin',
    userName: 'AEO Pindi Gheb',
    userRole: 'aeo_admin',
    action: 'Return Submission',
    module: 'Submissions',
    details: 'Returned dossier for correction: Missing school council resolution and boundary wall photos.',
    timestamp: '2026-10-07T11:30:00Z'
  },
  {
    id: 'log_03',
    schoolEmisCode: '37120101',
    schoolName: 'GPS Pindi Gheb No. 1',
    userId: 'user_37120101',
    userName: 'Muhammad Arshad',
    userRole: 'school_user',
    action: 'Submit Dossier',
    module: 'Submissions',
    details: 'Submitted Q1 data with 186 enrolled students, NSB expenditure Rs. 114,200, and 5 teaching staff.',
    timestamp: '2026-10-12T11:30:00Z'
  },
  {
    id: 'log_04',
    schoolEmisCode: '37120101',
    schoolName: 'GPS Pindi Gheb No. 1',
    userId: 'user_37120101',
    userName: 'Muhammad Arshad',
    userRole: 'school_user',
    action: 'Update Facilities',
    module: 'Facilities',
    details: 'Reported 1 classroom declared dangerous and requested engineer inspection.',
    timestamp: '2026-10-12T10:45:00Z'
  }
];
