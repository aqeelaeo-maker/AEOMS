export type SchoolCategory = 'Public' | 'Private' | 'PEIMA' | 'PEF';
export type SchoolLevel = 'Primary' | 'Elementary' | 'High' | 'Higher Secondary';
export type GenderPolicy = 'Boys' | 'Girls' | 'Co-Education';
export type UserRole = 'dy_deo' | 'aeo_admin' | 'school_user' | 'supervisor';
export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned';

export interface School {
  emisCode: string;
  name: string;
  nameUrdu: string;
  category: SchoolCategory;
  level: SchoolLevel;
  gender: GenderPolicy;
  district: string;
  tehsil: string;
  markaz: string;
  unionCouncil: string;
  address: string;
  addressUrdu?: string;
  headTeacherName: string;
  headTeacherCnic: string;
  headTeacherPhone: string;
  shift: 'Morning' | 'Evening' | 'Double Shift';
  establishmentYear: string;
  status: 'active' | 'inactive';
}

export interface UserAccount {
  id: string;
  username: string; // EMIS code for school, CNIC for AEO, or Admin for Dy. DEO
  displayName: string;
  role: UserRole;
  cnic?: string; // Official CNIC number for AEO
  assignedMarkaz?: string; // For AEOs: e.g. 'Pindi Gheb City', 'Malhuwali', 'Ikhlas', 'Khaur'
  schoolEmisCode?: string;
  email?: string;
  phone?: string;
  mustChangePassword: boolean;
  passwordHash: string; // SHA-256 hashed password
  lastLoginAt?: string;
  createdAt: string;
}

export interface GradeEnrollment {
  grade: string;
  boys: number;
  girls: number;
  transgender?: number;
  total: number;
}

export interface EnrollmentData {
  schoolEmisCode: string;
  academicYear: string;
  reportingMonth: string;
  grades: GradeEnrollment[];
  totalBoys: number;
  totalGirls: number;
  grandTotal: number;
  minorityStudents: number;
  cwsnStudents: number; // Children with Special Needs
  bFormVerifiedCount: number;
  averageAttendancePercent: number;
  dropoutCount: number;
  lastUpdated: string;
  updatedBy: string;
}

export type NSBHead =
  | 'School Cleaning & Hygiene'
  | 'Minor Repair & Maintenance'
  | 'Stationery & Examination'
  | 'Utility Bills (Electricity/Water/Gas)'
  | 'Instructional Aids & TLM'
  | 'IT / Computer Lab Maintenance'
  | 'Sports & Co-Curricular'
  | 'Miscellaneous & First Aid';

export interface NSBTransaction {
  id: string;
  date: string;
  voucherNo: string;
  head: NSBHead;
  description: string;
  amount: number;
  vendorName: string;
  receiptNumber: string;
  createdAt: string;
}

export interface NSBData {
  schoolEmisCode: string;
  financialYear: string;
  // Official fields requested by user
  balanceOn30June2026: number; // Balance on 30-06-2026
  firstInstallment: number;    // First Installment
  secondInstallment: number;   // Second Installment
  thirdInstallment: number;    // Third Installment
  forthInstallment: number;    // Forth Installment
  totalIncome: number;         // Total Income = Balance on 30-06-2026 + 1st + 2nd + 3rd + 4th
  totalExpenditure: number;    // Total Expenditure
  currentBalance: number;      // Current Balance = Total Income - Total Expenditure

  // Compatibility & quota fields
  openingBalance: number;
  totalAnnualAllocation: number;
  q1Funds: number;
  q2Funds: number;
  q3Funds: number;
  q4Funds: number;
  totalReceived: number;

  expendituresByHead: Record<string, number>;
  transactions: NSBTransaction[];
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  lastUpdated: string;
}

export interface FTFTransaction {
  id: string;
  date: string;
  type: 'collection' | 'expenditure';
  description: string;
  amount: number;
  voucherNo: string;
  approvedByCommittee: boolean;
  createdAt: string;
}

export interface FTFData {
  schoolEmisCode: string;
  financialYear: string;
  openingBalance: number;
  totalCollected: number;
  totalExpenditure: number;
  currentBalance: number;
  bankName: string;
  accountNumber: string;
  committeeMembers: string[];
  transactions: FTFTransaction[];
  lastUpdated: string;
}

export interface BuildingAndFacilitiesData {
  schoolEmisCode: string;
  ownership: 'Government Owned' | 'Rented' | 'Donated' | 'Shelterless';
  totalAreaMarlas: number;
  coveredAreaSqFt: number;
  uncoveredAreaSqFt: number;
  totalClassrooms: number;
  classroomsInUse: number;
  dangerousClassrooms: number;
  needsRepairClassrooms: number;
  boundaryWallStatus: 'Satisfactory' | 'Damaged / Partial' | 'No Boundary Wall';
  boundaryWallHeightFt: number;
  mainGate: boolean;
  electricityStatus: 'Connected' | 'Disconnected' | 'No Connection';
  electricityMeterNo: string;
  solarInstalled: boolean;
  solarCapacityKw: number;
  drinkingWaterSource: 'Filtration Plant' | 'Electric Pump' | 'Hand Pump' | 'Tap Water' | 'None';
  drinkingWaterFunctional: boolean;
  studentToiletsTotal: number;
  studentToiletsFunctional: number;
  staffToiletsTotal: number;
  staffToiletsFunctional: number;
  scienceLab: boolean;
  computerLab: boolean;
  functionalComputers: number;
  library: boolean;
  libraryBooksCount: number;
  playground: boolean;
  sportsKitAvailable: boolean;
  fireExtinguishersCount: number;
  firstAidBox: boolean;
  cctvCameras: boolean;
  cctvCamerasCount: number;
  lastUpdated: string;
}

export interface TeacherStaff {
  id: string;
  name: string;
  cnic: string;
  personalNo: string;
  designation: string;
  bps: number;
  category: 'Teaching' | 'Non-Teaching';
  gender: 'Male' | 'Female';
  qualification: string;
  subjectSpecialization: string;
  dateOfJoining: string;
  presentStationJoining: string;
  phone: string;
  status: 'Present' | 'On Leave' | 'Deputation' | 'Transferred';
}

export interface StaffSummaryData {
  schoolEmisCode: string;
  sanctionedTeaching: number;
  filledTeaching: number;
  vacantTeaching: number;
  sanctionedNonTeaching: number;
  filledNonTeaching: number;
  vacantNonTeaching: number;
  teachers: TeacherStaff[];
  lastUpdated: string;
}

export interface DocumentUpload {
  id: string;
  schoolEmisCode: string;
  title: string;
  category: 'building_photo' | 'utility_bill' | 'nsb_register' | 'ftf_register' | 'attendance_sheet' | 'inspection_dossier';
  fileDataUrl: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  notes?: string;
}

export interface ReviewComment {
  id: string;
  submissionId: string;
  schoolEmisCode: string;
  aeoName: string;
  comment: string;
  actionTaken: 'approved' | 'returned' | 'reviewed';
  timestamp: string;
}

export interface SubmissionRecord {
  id: string;
  schoolEmisCode: string;
  schoolName: string;
  reportingPeriod: string;
  status: SubmissionStatus;
  submittedAt?: string;
  submittedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  aeoRemarks?: string;
  returnReasons?: string[];
  correctionsRequested?: string;
  approvalCertificateNumber?: string;
  comments?: ReviewComment[];
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  schoolEmisCode?: string;
  schoolName?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}
