import {
  School,
  UserAccount,
  EnrollmentData,
  NSBData,
  NSBTransaction,
  FTFData,
  FTFTransaction,
  BuildingAndFacilitiesData,
  StaffSummaryData,
  TeacherStaff,
  DocumentUpload,
  SubmissionRecord,
  SubmissionStatus,
  AuditLogEntry
} from '../types';
import {
  initialSchools,
  initialUsers,
  initialEnrollment,
  initialNSB,
  initialFTF,
  initialFacilities,
  initialStaff,
  initialDocuments,
  initialSubmissions,
  initialAuditLogs,
  hashPassword
} from '../data/initialData';
import { db, doc, handleFirestoreError, OperationType } from '../firebase/config';
import { setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export const STORAGE_KEYS = {
  SCHOOLS: 'aeo_schools_v1',
  USERS: 'aeo_users_v1',
  ENROLLMENT: 'aeo_enrollment_v1',
  NSB: 'aeo_nsb_v1',
  FTF: 'aeo_ftf_v1',
  FACILITIES: 'aeo_facilities_v1',
  STAFF: 'aeo_staff_v1',
  DOCUMENTS: 'aeo_documents_v1',
  SUBMISSIONS: 'aeo_submissions_v1',
  AUDIT_LOGS: 'aeo_audit_logs_v1'
};

// Initialize persistent state if not already populated
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(initialSchools));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  } else {
    // Ensure Dy. DEO (Admin/admin) and markaz-assigned AEO accounts (CNIC/CNIC) are synced
    try {
      const storedUsers: UserAccount[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const merged = [...storedUsers];
      for (const iu of initialUsers) {
        const existingIdx = merged.findIndex(
          u =>
            u.id === iu.id ||
            u.username.toLowerCase() === iu.username.toLowerCase() ||
            (iu.email && u.email?.toLowerCase() === iu.email.toLowerCase()) ||
            (iu.assignedMarkaz && u.assignedMarkaz === iu.assignedMarkaz)
        );
        if (existingIdx >= 0) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            username: iu.username,
            role: iu.role,
            displayName: iu.displayName,
            cnic: iu.cnic || merged[existingIdx].cnic,
            assignedMarkaz: iu.assignedMarkaz || merged[existingIdx].assignedMarkaz,
            email: iu.email || merged[existingIdx].email,
            passwordHash: merged[existingIdx].passwordHash || iu.passwordHash
          };
        } else {
          merged.push(iu);
        }
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
    } catch {
      // fallback
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENT)) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENT, JSON.stringify(initialEnrollment));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NSB)) {
    localStorage.setItem(STORAGE_KEYS.NSB, JSON.stringify(initialNSB));
  } else {
    try {
      const storedNsb = JSON.parse(localStorage.getItem(STORAGE_KEYS.NSB) || '{}');
      let changed = false;
      for (const emis of Object.keys(storedNsb)) {
        const item = storedNsb[emis];
        if (item && item.balanceOn30June2026 === undefined) {
          item.balanceOn30June2026 = Number(item.openingBalance ?? 0);
          item.firstInstallment = Number(item.q1Funds ?? 0);
          item.secondInstallment = Number(item.q2Funds ?? 0);
          item.thirdInstallment = Number(item.q3Funds ?? 0);
          item.forthInstallment = Number(item.q4Funds ?? 0);
          item.totalIncome =
            item.balanceOn30June2026 +
            item.firstInstallment +
            item.secondInstallment +
            item.thirdInstallment +
            item.forthInstallment;
          item.currentBalance = item.totalIncome - Number(item.totalExpenditure ?? 0);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.NSB, JSON.stringify(storedNsb));
      }
    } catch {}
  }
  if (!localStorage.getItem(STORAGE_KEYS.FTF)) {
    localStorage.setItem(STORAGE_KEYS.FTF, JSON.stringify(initialFTF));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(initialFacilities));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(initialStaff));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initialDocuments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
  }
}

// Background sync to Firestore without blocking local UI execution
async function syncToFirestore(collectionPath: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    // If offline or permission notice, log safely
    console.warn(`Firestore sync notice (${collectionPath}/${docId}):`, err);
  }
}

// Background delete from Firestore without blocking local UI execution
async function deleteFromFirestore(collectionPath: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete notice (${collectionPath}/${docId}):`, err);
  }
}

// Helper to record audit events
export function addAuditLog(
  userId: string,
  userName: string,
  userRole: UserAccount['role'],
  action: string,
  module: string,
  details: string,
  schoolEmisCode?: string,
  schoolName?: string
): void {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    schoolEmisCode,
    schoolName,
    userId,
    userName,
    userRole,
    action,
    module,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 300)));
  syncToFirestore('auditLogs', newEntry.id, newEntry);
}

// Schools
export function getSchools(): School[] {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]');
  } catch {
    return initialSchools;
  }
}

export function getSchoolByEmis(emisCode: string): School | undefined {
  return getSchools().find(s => s.emisCode === emisCode);
}

// Filtered schools according to user role and markaz jurisdiction
// Each AEO can only view data of their own schools in their assigned Markaz
export function getSchoolsForUser(user: UserAccount | null): School[] {
  const allSchools = getSchools();
  if (!user) return allSchools;
  if (user.role === 'dy_deo' || user.email === 'dydeowpindigheb@gmail.com' || user.role === 'supervisor') {
    return allSchools;
  }
  if (user.role === 'aeo_admin') {
    if (!user.assignedMarkaz) return allSchools;
    return allSchools.filter(
      s => s.markaz && s.markaz.trim().toLowerCase() === user.assignedMarkaz!.trim().toLowerCase()
    );
  }
  if (user.role === 'school_user' && user.schoolEmisCode) {
    return allSchools.filter(s => s.emisCode === user.schoolEmisCode);
  }
  return allSchools;
}

export function saveSchool(school: School, user: UserAccount): void {
  const schools = getSchools();
  const index = schools.findIndex(s => s.emisCode === school.emisCode);
  if (index >= 0) {
    schools[index] = school;
  } else {
    schools.push(school);
    // Automatically provision initial school user account with temporary password = EMIS code
    const users = getUsers();
    if (!users.some(u => u.username === school.emisCode)) {
      users.push({
        id: 'user_' + school.emisCode,
        username: school.emisCode,
        displayName: `Head Teacher, ${school.name}`,
        role: 'school_user',
        schoolEmisCode: school.emisCode,
        mustChangePassword: true,
        passwordHash: `${school.emisCode}_initial_hash`,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      syncToFirestore('users', 'user_' + school.emisCode, users[users.length - 1]);
    }
  }
  localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  syncToFirestore('schools', school.emisCode, school);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    index >= 0 ? 'Update School Profile' : 'Register New School',
    'Schools',
    `Saved details for ${school.name} (EMIS: ${school.emisCode})`,
    school.emisCode,
    school.name
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('schools_updated', { detail: { school } }));
  }
}

export function deleteSchool(emisCode: string, user: UserAccount): boolean {
  const schools = getSchools();
  const target = schools.find(s => s.emisCode === emisCode);
  if (!target) return false;

  const updatedSchools = schools.filter(s => s.emisCode !== emisCode);
  localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(updatedSchools));

  // Also remove linked school user account
  const users = getUsers().filter(u => u.username !== emisCode && u.schoolEmisCode !== emisCode);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Delete School Record',
    'Schools',
    `Deleted school ${target.name} (EMIS: ${emisCode}) and revoked linked credentials.`,
    emisCode,
    target.name
  );

  deleteFromFirestore('schools', emisCode);
  deleteFromFirestore('users', 'user_' + emisCode);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('schools_updated', { detail: { emisCode } }));
  }

  return true;
}

// Users & Authentication
export function getUsers(): UserAccount[] {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  } catch {
    return initialUsers;
  }
}

export function getUserByUsername(identifier: string): UserAccount | undefined {
  if (!identifier) return undefined;
  const q = identifier.trim();
  const qLower = q.toLowerCase();
  const qDigits = q.replace(/[^0-9]/g, '');
  const users = getUsers();

  return users.find(u => {
    // Exact username match (case-insensitive)
    if (u.username.toLowerCase() === qLower) return true;

    // Dy. DEO alias matching
    if (
      (u.role === 'dy_deo' || u.id === 'user_dydeo' || u.email?.toLowerCase() === 'dydeowpindigheb@gmail.com') &&
      (qLower === 'admin' || qLower === 'dydeowpindigheb@gmail.com' || qLower === 'dydeo')
    ) {
      return true;
    }

    // Email match
    if (u.email && u.email.toLowerCase() === qLower) return true;

    // School EMIS match
    if (u.schoolEmisCode && (u.schoolEmisCode === q || u.schoolEmisCode === qDigits)) return true;

    // AEO CNIC match (with or without hyphens)
    if (u.cnic) {
      if (u.cnic.toLowerCase() === qLower) return true;
      if (qDigits && u.cnic.replace(/[^0-9]/g, '') === qDigits) return true;
    }
    if (u.role === 'aeo_admin' && qDigits && u.username.replace(/[^0-9]/g, '') === qDigits) {
      return true;
    }

    return false;
  });
}

export async function updateUserPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  const newHash = await hashPassword(newPasswordPlain);
  user.passwordHash = newHash;
  user.mustChangePassword = false;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  syncToFirestore('users', user.id, user);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Password Changed',
    'Authentication',
    `User ${user.username} successfully updated their credentials.`,
    user.schoolEmisCode
  );

  return true;
}

export async function resetSchoolPasswordToDefault(emisCode: string, adminUser: UserAccount): Promise<boolean> {
  const users = getUsers();
  const user = users.find(u => u.username === emisCode || u.schoolEmisCode === emisCode);
  if (!user) return false;

  user.passwordHash = `${emisCode}_initial_hash`;
  user.mustChangePassword = true;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  syncToFirestore('users', user.id, user);

  addAuditLog(
    adminUser.id,
    adminUser.displayName,
    adminUser.role,
    'Reset School Password',
    'Account Management',
    `Reset initial password for school ${emisCode} to default EMIS code.`,
    emisCode
  );

  return true;
}

export function getUserByEmis(emisCode: string): UserAccount | undefined {
  return getUsers().find(u => u.username === emisCode || u.schoolEmisCode === emisCode);
}

export function getAeoAccounts(): UserAccount[] {
  return getUsers().filter(u => u.role === 'aeo_admin');
}

// Login credentials of all AEOs must be managed exclusively by dydeowpindigheb@gmail.com
export async function saveAeoAccount(
  aeoData: {
    id?: string;
    username?: string;
    cnic?: string;
    displayName: string;
    assignedMarkaz: string;
    email?: string;
    phone?: string;
    passwordPlain?: string;
  },
  adminUser: UserAccount
): Promise<{ success: boolean; error?: string; aeo?: UserAccount }> {
  const isAuthorized =
    adminUser.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
    adminUser.role === 'dy_deo' ||
    adminUser.username.toLowerCase() === 'admin';

  if (!isAuthorized) {
    return {
      success: false,
      error: 'Permission denied: Login credentials of all AEOs can only be set and managed by Dy. DEO (dydeowpindigheb@gmail.com).'
    };
  }

  const users = getUsers();
  const cnicNum = (aeoData.cnic || aeoData.username || '').trim();
  const trimmedUsername = (aeoData.username || cnicNum).trim();
  const isNew = !aeoData.id;

  if (!cnicNum && !trimmedUsername) {
    return { success: false, error: 'CNIC number is required for AEO official username and credentials.' };
  }

  if (isNew && users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase() || (u.cnic && u.cnic === cnicNum))) {
    return { success: false, error: `An AEO account with CNIC / Username "${trimmedUsername}" is already registered.` };
  }

  const targetId = aeoData.id || 'user_aeo_' + Date.now();
  const targetUser = users.find(u => u.id === targetId);

  let passwordHash = targetUser?.passwordHash || '';
  if (aeoData.passwordPlain && aeoData.passwordPlain.trim()) {
    passwordHash = await hashPassword(aeoData.passwordPlain.trim());
  } else if (!passwordHash) {
    // Default password for AEO is their CNIC Number
    passwordHash = await hashPassword(cnicNum || trimmedUsername);
  }

  const updatedAeo: UserAccount = {
    id: targetId,
    username: trimmedUsername,
    cnic: cnicNum || trimmedUsername,
    displayName: aeoData.displayName.trim(),
    role: 'aeo_admin',
    assignedMarkaz: aeoData.assignedMarkaz.trim(),
    email: aeoData.email?.trim() || `${cnicNum.replace(/[^0-9]/g, '')}@punjab.gov.pk`,
    phone: aeoData.phone?.trim() || '',
    mustChangePassword: false,
    passwordHash,
    createdAt: targetUser?.createdAt || new Date().toISOString()
  };

  const existingIdx = users.findIndex(u => u.id === targetId);
  if (existingIdx >= 0) {
    users[existingIdx] = updatedAeo;
  } else {
    users.push(updatedAeo);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  syncToFirestore('users', targetId, updatedAeo);

  addAuditLog(
    adminUser.id,
    adminUser.displayName,
    adminUser.role,
    isNew ? 'Create AEO Credentials' : 'Update AEO Credentials',
    'AEO Credentials Management',
    `Dy. DEO ${isNew ? 'issued new' : 'updated'} official login credentials for AEO ${updatedAeo.displayName} (CNIC: ${updatedAeo.cnic}, Markaz: ${updatedAeo.assignedMarkaz}).`
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aeo_updated', { detail: { aeo: updatedAeo } }));
  }

  return { success: true, aeo: updatedAeo };
}

export async function resetAeoPasswordToDefaultCnic(
  aeoId: string,
  adminUser: UserAccount
): Promise<{ success: boolean; error?: string }> {
  const isAuthorized =
    adminUser.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
    adminUser.role === 'dy_deo' ||
    adminUser.username.toLowerCase() === 'admin';

  if (!isAuthorized) {
    return { success: false, error: 'Permission denied: Only Dy. DEO can reset AEO passwords.' };
  }

  const users = getUsers();
  const aeo = users.find(u => u.id === aeoId);
  if (!aeo) return { success: false, error: 'AEO not found' };

  const defaultPassword = aeo.cnic || aeo.username;
  const newHash = await hashPassword(defaultPassword);
  aeo.passwordHash = newHash;
  aeo.mustChangePassword = false;

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  syncToFirestore('users', aeo.id, aeo);

  addAuditLog(
    adminUser.id,
    adminUser.displayName,
    adminUser.role,
    'Reset AEO Password',
    'AEO Credentials Management',
    `Dy. DEO reset password for AEO ${aeo.displayName} to default CNIC (${defaultPassword}).`
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aeo_updated', { detail: { aeoId } }));
  }

  return { success: true };
}

export async function deleteAeoAccount(
  aeoId: string,
  adminUser: UserAccount
): Promise<{ success: boolean; error?: string }> {
  const isAuthorized =
    adminUser.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
    adminUser.role === 'dy_deo' ||
    adminUser.username.toLowerCase() === 'admin';

  if (!isAuthorized) {
    return {
      success: false,
      error: 'Permission denied: Only Dy. DEO (dydeowpindigheb@gmail.com) can revoke AEO accounts.'
    };
  }

  const users = getUsers();
  const target = users.find(u => u.id === aeoId);
  if (!target) return { success: false, error: 'AEO account record not found' };

  const updatedUsers = users.filter(u => u.id !== aeoId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  deleteFromFirestore('users', aeoId);

  addAuditLog(
    adminUser.id,
    adminUser.displayName,
    adminUser.role,
    'Revoke AEO Credentials',
    'AEO Credentials Management',
    `Dy. DEO deleted AEO account credentials for ${target.displayName} (Username: ${target.username}, Markaz: ${target.assignedMarkaz}).`
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aeo_updated', { detail: { aeoId } }));
  }

  return { success: true };
}

// Login credentials for each school in the Markaz of an AEO will be set by each AEO
export async function saveSchoolCredentials(
  emisCode: string,
  credentials: {
    username?: string;
    passwordPlain?: string;
    headTeacherName?: string;
    headTeacherPhone?: string;
  },
  adminUser: UserAccount
): Promise<{ success: boolean; error?: string }> {
  const schools = getSchools();
  const school = schools.find(s => s.emisCode === emisCode);
  if (!school) return { success: false, error: 'School not found' };

  const isDyDeo =
    adminUser.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
    adminUser.role === 'dy_deo' ||
    adminUser.username.toLowerCase() === 'admin';

  const isMarkazAeo =
    adminUser.role === 'aeo_admin' &&
    adminUser.assignedMarkaz &&
    school.markaz &&
    adminUser.assignedMarkaz.trim().toLowerCase() === school.markaz.trim().toLowerCase();

  if (!isDyDeo && !isMarkazAeo) {
    return {
      success: false,
      error: `Permission denied: Login credentials for this school can only be set by the AEO of Markaz "${school.markaz}".`
    };
  }

  const users = getUsers();
  const user = users.find(u => u.username === emisCode || u.schoolEmisCode === emisCode);

  let newHash = user?.passwordHash;
  if (credentials.passwordPlain && credentials.passwordPlain.trim()) {
    newHash = await hashPassword(credentials.passwordPlain.trim());
  } else if (!newHash) {
    newHash = `${emisCode}_initial_hash`;
  }

  const updatedUser: UserAccount = {
    id: user?.id || 'user_' + emisCode,
    username: credentials.username?.trim() || emisCode,
    displayName: credentials.headTeacherName
      ? `Head Teacher, ${school.name} (${credentials.headTeacherName})`
      : user?.displayName || `Head Teacher, ${school.name}`,
    role: 'school_user',
    schoolEmisCode: emisCode,
    phone: credentials.headTeacherPhone?.trim() || user?.phone || school.headTeacherPhone,
    mustChangePassword: false,
    passwordHash: newHash,
    createdAt: user?.createdAt || new Date().toISOString()
  };

  const userIdx = users.findIndex(u => u.id === updatedUser.id || u.schoolEmisCode === emisCode);
  if (userIdx >= 0) {
    users[userIdx] = updatedUser;
  } else {
    users.push(updatedUser);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  syncToFirestore('users', updatedUser.id, updatedUser);

  if (credentials.headTeacherName || credentials.headTeacherPhone) {
    const schoolIdx = schools.findIndex(s => s.emisCode === emisCode);
    if (schoolIdx >= 0) {
      if (credentials.headTeacherName) schools[schoolIdx].headTeacherName = credentials.headTeacherName.trim();
      if (credentials.headTeacherPhone) schools[schoolIdx].headTeacherPhone = credentials.headTeacherPhone.trim();
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
      syncToFirestore('schools', emisCode, schools[schoolIdx]);
    }
  }

  addAuditLog(
    adminUser.id,
    adminUser.displayName,
    adminUser.role,
    'Set School Credentials',
    'School Credentials Management',
    `AEO ${adminUser.displayName} set login credentials for school ${school.name} (EMIS: ${emisCode}, Markaz: ${school.markaz}).`,
    emisCode,
    school.name
  );

  return { success: true };
}

// Enrollment
export function getEnrollment(schoolEmisCode: string): EnrollmentData | undefined {
  initializeStorage();
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENT) || '{}');
    if (map[schoolEmisCode]) return map[schoolEmisCode];
  } catch {
    // fallback
  }

  // Provide initial template if not present
  return {
    schoolEmisCode,
    academicYear: '2026-2027',
    reportingMonth: 'October 2026',
    grades: [
      { grade: 'ECE / Kachi', boys: 0, girls: 0, total: 0 },
      { grade: 'Class 1', boys: 0, girls: 0, total: 0 },
      { grade: 'Class 2', boys: 0, girls: 0, total: 0 },
      { grade: 'Class 3', boys: 0, girls: 0, total: 0 },
      { grade: 'Class 4', boys: 0, girls: 0, total: 0 },
      { grade: 'Class 5', boys: 0, girls: 0, total: 0 }
    ],
    totalBoys: 0,
    totalGirls: 0,
    grandTotal: 0,
    minorityStudents: 0,
    cwsnStudents: 0,
    bFormVerifiedCount: 0,
    averageAttendancePercent: 90,
    dropoutCount: 0,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System'
  };
}

export function saveEnrollment(data: EnrollmentData, user: UserAccount): void {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENT) || '{}');
  // Recompute sums defensively
  let boys = 0;
  let girls = 0;
  data.grades.forEach(g => {
    g.total = Number(g.boys || 0) + Number(g.girls || 0) + Number(g.transgender || 0);
    boys += Number(g.boys || 0);
    girls += Number(g.girls || 0);
  });
  data.totalBoys = boys;
  data.totalGirls = girls;
  data.grandTotal = boys + girls;
  data.lastUpdated = new Date().toISOString();
  data.updatedBy = user.displayName;

  map[data.schoolEmisCode] = data;
  localStorage.setItem(STORAGE_KEYS.ENROLLMENT, JSON.stringify(map));
  syncToFirestore('enrollment', data.schoolEmisCode, data);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Update Enrollment',
    'Enrollment',
    `Updated student counts: ${data.grandTotal} total (${data.totalBoys} Boys, ${data.totalGirls} Girls).`,
    data.schoolEmisCode
  );
}

// NSB (Non-Salary Budget)
export function getNSB(schoolEmisCode: string): NSBData {
  initializeStorage();
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.NSB) || '{}');
    if (map[schoolEmisCode]) {
      const d = map[schoolEmisCode];
      const balanceOn30June2026 = Number(d.balanceOn30June2026 ?? d.openingBalance ?? 0);
      const firstInstallment = Number(d.firstInstallment ?? d.q1Funds ?? 0);
      const secondInstallment = Number(d.secondInstallment ?? d.q2Funds ?? 0);
      const thirdInstallment = Number(d.thirdInstallment ?? d.q3Funds ?? 0);
      const forthInstallment = Number(d.forthInstallment ?? d.q4Funds ?? 0);
      const totalIncome =
        balanceOn30June2026 +
        firstInstallment +
        secondInstallment +
        thirdInstallment +
        forthInstallment;

      const transactions: NSBTransaction[] = d.transactions || [];
      const headTotals: Record<string, number> = {};
      let totalSpent = 0;
      transactions.forEach(tx => {
        headTotals[tx.head] = (headTotals[tx.head] || 0) + Number(tx.amount || 0);
        totalSpent += Number(tx.amount || 0);
      });

      const totalExpenditure = totalSpent;
      const currentBalance = totalIncome - totalExpenditure;

      return {
        ...d,
        balanceOn30June2026,
        firstInstallment,
        secondInstallment,
        thirdInstallment,
        forthInstallment,
        totalIncome,
        totalExpenditure,
        currentBalance,
        openingBalance: balanceOn30June2026,
        q1Funds: firstInstallment,
        q2Funds: secondInstallment,
        q3Funds: thirdInstallment,
        q4Funds: forthInstallment,
        totalReceived: totalIncome,
        expendituresByHead: headTotals,
        transactions
      };
    }
  } catch {}

  const defaultBalance30June = 0;
  const defaultFirst = 62500;
  const defaultSecond = 62500;
  const defaultThird = 0;
  const defaultForth = 0;
  const defaultTotalIncome = defaultBalance30June + defaultFirst + defaultSecond + defaultThird + defaultForth;

  return {
    schoolEmisCode,
    financialYear: '2026-2027',
    balanceOn30June2026: defaultBalance30June,
    firstInstallment: defaultFirst,
    secondInstallment: defaultSecond,
    thirdInstallment: defaultThird,
    forthInstallment: defaultForth,
    totalIncome: defaultTotalIncome,
    totalExpenditure: 0,
    currentBalance: defaultTotalIncome,
    openingBalance: defaultBalance30June,
    totalAnnualAllocation: 250000,
    q1Funds: defaultFirst,
    q2Funds: defaultSecond,
    q3Funds: defaultThird,
    q4Funds: defaultForth,
    totalReceived: defaultTotalIncome,
    expendituresByHead: {},
    transactions: [],
    bankName: 'National Bank of Pakistan',
    bankBranch: 'Pindi Gheb',
    accountNumber: `PK-NBP-${schoolEmisCode}`,
    lastUpdated: new Date().toISOString()
  };
}

export function saveNSB(data: NSBData, user: UserAccount): void {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.NSB) || '{}');
  
  // Recalculate expenditures from transaction vouchers
  const headTotals: Record<string, number> = {};
  let totalSpent = 0;
  (data.transactions || []).forEach(tx => {
    headTotals[tx.head] = (headTotals[tx.head] || 0) + Number(tx.amount || 0);
    totalSpent += Number(tx.amount || 0);
  });
  data.expendituresByHead = headTotals;
  data.totalExpenditure = totalSpent;

  // Compute requested official fields
  const balanceOn30June2026 = Number(data.balanceOn30June2026 ?? data.openingBalance ?? 0);
  const firstInstallment = Number(data.firstInstallment ?? data.q1Funds ?? 0);
  const secondInstallment = Number(data.secondInstallment ?? data.q2Funds ?? 0);
  const thirdInstallment = Number(data.thirdInstallment ?? data.q3Funds ?? 0);
  const forthInstallment = Number(data.forthInstallment ?? data.q4Funds ?? 0);
  const totalIncome =
    balanceOn30June2026 +
    firstInstallment +
    secondInstallment +
    thirdInstallment +
    forthInstallment;
  const currentBalance = totalIncome - totalSpent;

  data.balanceOn30June2026 = balanceOn30June2026;
  data.firstInstallment = firstInstallment;
  data.secondInstallment = secondInstallment;
  data.thirdInstallment = thirdInstallment;
  data.forthInstallment = forthInstallment;
  data.totalIncome = totalIncome;
  data.currentBalance = currentBalance;

  // Synced compatibility values
  data.openingBalance = balanceOn30June2026;
  data.q1Funds = firstInstallment;
  data.q2Funds = secondInstallment;
  data.q3Funds = thirdInstallment;
  data.q4Funds = forthInstallment;
  data.totalReceived = totalIncome;
  data.lastUpdated = new Date().toISOString();

  map[data.schoolEmisCode] = data;
  localStorage.setItem(STORAGE_KEYS.NSB, JSON.stringify(map));
  syncToFirestore('nsb', data.schoolEmisCode, data);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Update NSB Account',
    'NSB Funds',
    `Updated NSB: Total Income Rs. ${data.totalIncome.toLocaleString()} (Bal on 30-06-2026: Rs. ${data.balanceOn30June2026.toLocaleString()}, 1st: Rs. ${data.firstInstallment.toLocaleString()}, 2nd: Rs. ${data.secondInstallment.toLocaleString()}, 3rd: Rs. ${data.thirdInstallment.toLocaleString()}, 4th: Rs. ${data.forthInstallment.toLocaleString()}), Total Expenditure Rs. ${data.totalExpenditure.toLocaleString()}, Current Balance Rs. ${data.currentBalance.toLocaleString()}.`,
    data.schoolEmisCode
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nsb_updated', { detail: { schoolEmisCode: data.schoolEmisCode } }));
  }
}

// FTF (Farogh-e-Taleem Fund)
export function getFTF(schoolEmisCode: string): FTFData {
  initializeStorage();
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.FTF) || '{}');
    if (map[schoolEmisCode]) return map[schoolEmisCode];
  } catch {}

  return {
    schoolEmisCode,
    financialYear: '2026-2027',
    openingBalance: 5000,
    totalCollected: 12000,
    totalExpenditure: 4000,
    currentBalance: 13000,
    bankName: 'National Bank of Pakistan, Pindi Gheb',
    accountNumber: `FTF-${schoolEmisCode}`,
    committeeMembers: ['School Head Teacher', 'Parent Representative', 'Senior Teacher'],
    transactions: [],
    lastUpdated: new Date().toISOString()
  };
}

export function saveFTF(data: FTFData, user: UserAccount): void {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.FTF) || '{}');
  let spent = 0;
  let collected = 0;
  data.transactions.forEach(tx => {
    if (tx.type === 'expenditure') spent += Number(tx.amount || 0);
    if (tx.type === 'collection') collected += Number(tx.amount || 0);
  });
  data.totalExpenditure = spent;
  data.totalCollected = collected;
  data.currentBalance = Number(data.openingBalance || 0) + collected - spent;
  data.lastUpdated = new Date().toISOString();

  map[data.schoolEmisCode] = data;
  localStorage.setItem(STORAGE_KEYS.FTF, JSON.stringify(map));
  syncToFirestore('ftf', data.schoolEmisCode, data);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Update FTF Account',
    'FTF Funds',
    `FTF Register updated. Net balance: Rs. ${data.currentBalance.toLocaleString()}.`,
    data.schoolEmisCode
  );
}

// Facilities & Infrastructure
export function getFacilities(schoolEmisCode: string): BuildingAndFacilitiesData {
  initializeStorage();
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACILITIES) || '{}');
    if (map[schoolEmisCode]) return map[schoolEmisCode];
  } catch {}

  return {
    schoolEmisCode,
    ownership: 'Government Owned',
    totalAreaMarlas: 48,
    coveredAreaSqFt: 4200,
    uncoveredAreaSqFt: 7800,
    totalClassrooms: 5,
    classroomsInUse: 5,
    dangerousClassrooms: 0,
    needsRepairClassrooms: 1,
    boundaryWallStatus: 'Satisfactory',
    boundaryWallHeightFt: 6,
    mainGate: true,
    electricityStatus: 'Connected',
    electricityMeterNo: `IESCO-${schoolEmisCode}`,
    solarInstalled: false,
    solarCapacityKw: 0,
    drinkingWaterSource: 'Electric Pump',
    drinkingWaterFunctional: true,
    studentToiletsTotal: 3,
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
    cctvCameras: false,
    cctvCamerasCount: 0,
    lastUpdated: new Date().toISOString()
  };
}

export function saveFacilities(data: BuildingAndFacilitiesData, user: UserAccount): void {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACILITIES) || '{}');
  data.lastUpdated = new Date().toISOString();
  map[data.schoolEmisCode] = data;
  localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(map));
  syncToFirestore('facilities', data.schoolEmisCode, data);

  const dangerAlert = data.dangerousClassrooms > 0 ? ` [ALERT: ${data.dangerousClassrooms} Dangerous Classroom(s)]` : '';
  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Update Building & Facilities',
    'Facilities',
    `Saved infrastructure record (${data.totalClassrooms} classrooms, wall: ${data.boundaryWallStatus}, water: ${data.drinkingWaterSource})${dangerAlert}`,
    data.schoolEmisCode
  );
}

// Staff & Teachers
export function getStaff(schoolEmisCode: string): StaffSummaryData {
  initializeStorage();
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || '{}');
    if (map[schoolEmisCode]) return map[schoolEmisCode];
  } catch {}

  return {
    schoolEmisCode,
    sanctionedTeaching: 5,
    filledTeaching: 4,
    vacantTeaching: 1,
    sanctionedNonTeaching: 2,
    filledNonTeaching: 2,
    vacantNonTeaching: 0,
    teachers: [],
    lastUpdated: new Date().toISOString()
  };
}

export function saveStaff(data: StaffSummaryData, user: UserAccount): void {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || '{}');
  // Recompute teaching filled / vacant
  const teaching = data.teachers.filter(t => t.category === 'Teaching');
  const nonTeaching = data.teachers.filter(t => t.category === 'Non-Teaching');
  data.filledTeaching = teaching.length;
  data.vacantTeaching = Math.max(0, data.sanctionedTeaching - data.filledTeaching);
  data.filledNonTeaching = nonTeaching.length;
  data.vacantNonTeaching = Math.max(0, data.sanctionedNonTeaching - data.filledNonTeaching);
  data.lastUpdated = new Date().toISOString();

  map[data.schoolEmisCode] = data;
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(map));
  syncToFirestore('staff', data.schoolEmisCode, data);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Update Staff Data',
    'Staff',
    `Updated staff records: ${data.filledTeaching}/${data.sanctionedTeaching} teaching filled (${data.vacantTeaching} vacant).`,
    data.schoolEmisCode
  );
}

// Documents
export function getDocuments(schoolEmisCode?: string): DocumentUpload[] {
  initializeStorage();
  try {
    const list: DocumentUpload[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    if (schoolEmisCode) {
      return list.filter(d => d.schoolEmisCode === schoolEmisCode);
    }
    return list;
  } catch {
    return initialDocuments;
  }
}

export function addDocument(docData: DocumentUpload, user: UserAccount): void {
  const docs = getDocuments();
  docs.unshift(docData);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  syncToFirestore('documents', docData.id, docData);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Upload Document Evidence',
    'Documents',
    `Uploaded "${docData.title}" (${docData.category}).`,
    docData.schoolEmisCode
  );
}

export function deleteDocument(docId: string, user: UserAccount): void {
  const docs = getDocuments();
  const target = docs.find(d => d.id === docId);
  const updated = docs.filter(d => d.id !== docId);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));

  if (target) {
    addAuditLog(
      user.id,
      user.displayName,
      user.role,
      'Delete Document',
      'Documents',
      `Deleted file "${target.title}".`,
      target.schoolEmisCode
    );
  }

  deleteFromFirestore('documents', docId);
}

export function toggleDocumentVerification(docId: string, user: UserAccount, notes?: string): void {
  const docs = getDocuments();
  const target = docs.find(d => d.id === docId);
  if (!target) return;

  target.verified = !target.verified;
  target.verifiedBy = target.verified ? user.displayName : undefined;
  if (notes) target.notes = notes;

  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  syncToFirestore('documents', target.id, target);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    target.verified ? 'Verify Document Evidence' : 'Unverify Document',
    'Documents',
    `Evidence "${target.title}" set to ${target.verified ? 'VERIFIED' : 'UNVERIFIED'}.`,
    target.schoolEmisCode
  );
}

// Submissions & Verification Workflow
export function getSubmissions(): SubmissionRecord[] {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
  } catch {
    return initialSubmissions;
  }
}

export function getSubmissionBySchool(schoolEmisCode: string): SubmissionRecord | undefined {
  return getSubmissions().find(s => s.schoolEmisCode === schoolEmisCode);
}

export function submitDossier(schoolEmisCode: string, user: UserAccount, period: string = 'Q1 2026-27'): SubmissionRecord {
  const list = getSubmissions();
  const school = getSchoolByEmis(schoolEmisCode);
  let sub = list.find(s => s.schoolEmisCode === schoolEmisCode);

  if (!sub) {
    sub = {
      id: 'sub_' + schoolEmisCode + '_' + Date.now(),
      schoolEmisCode,
      schoolName: school ? school.name : `School ${schoolEmisCode}`,
      reportingPeriod: period,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submittedBy: user.displayName,
      updatedAt: new Date().toISOString()
    };
    list.unshift(sub);
  } else {
    sub.status = 'submitted';
    sub.submittedAt = new Date().toISOString();
    sub.submittedBy = user.displayName;
    sub.updatedAt = new Date().toISOString();
  }

  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  syncToFirestore('submissions', sub.id, sub);

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    'Submit Data Dossier',
    'Submissions',
    `School submitted complete quarterly data package to AEO office.`,
    schoolEmisCode,
    sub.schoolName
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('submissions_updated', { detail: { schoolEmisCode, submission: sub } }));
  }

  return sub;
}

export function updateSubmissionStatus(
  submissionId: string,
  newStatus: SubmissionStatus,
  user: UserAccount,
  remarks?: string,
  returnReasons?: string[],
  correctionsRequested?: string
): SubmissionRecord | undefined {
  const list = getSubmissions();
  const sub = list.find(s => s.id === submissionId);
  if (!sub) return undefined;

  sub.status = newStatus;
  sub.reviewedAt = new Date().toISOString();
  sub.reviewedBy = user.displayName;
  sub.updatedAt = new Date().toISOString();

  if (remarks !== undefined) sub.aeoRemarks = remarks;
  if (returnReasons !== undefined) sub.returnReasons = returnReasons;
  if (correctionsRequested !== undefined) sub.correctionsRequested = correctionsRequested;

  if (newStatus === 'approved' && !sub.approvalCertificateNumber) {
    const certSerial = Math.floor(100 + Math.random() * 900);
    sub.approvalCertificateNumber = `AEO/PG/APPR/2026-${certSerial}`;
  }

  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  syncToFirestore('submissions', sub.id, sub);

  const actionName =
    newStatus === 'approved' ? 'Approve School Submission' :
    newStatus === 'returned' ? 'Return Submission for Correction' :
    'Update Review Status';

  addAuditLog(
    user.id,
    user.displayName,
    user.role,
    actionName,
    'Submissions',
    `Submission for ${sub.schoolName} marked as ${newStatus.toUpperCase()}.${remarks ? ` Remarks: ${remarks}` : ''}`,
    sub.schoolEmisCode,
    sub.schoolName
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('submissions_updated', { detail: { schoolEmisCode: sub.schoolEmisCode, submission: sub } }));
  }

  return sub;
}

// Audit logs
export function getAuditLogs(): AuditLogEntry[] {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
  } catch {
    return initialAuditLogs;
  }
}

// JSON Backup & Restore
export function exportDatabaseBackup(): string {
  initializeStorage();
  const backup = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    schools: getSchools(),
    users: getUsers(),
    enrollment: JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENT) || '{}'),
    nsb: JSON.parse(localStorage.getItem(STORAGE_KEYS.NSB) || '{}'),
    ftf: JSON.parse(localStorage.getItem(STORAGE_KEYS.FTF) || '{}'),
    facilities: JSON.parse(localStorage.getItem(STORAGE_KEYS.FACILITIES) || '{}'),
    staff: JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || '{}'),
    documents: getDocuments(),
    submissions: getSubmissions(),
    auditLogs: getAuditLogs()
  };
  return JSON.stringify(backup, null, 2);
}

export function restoreDatabaseBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.schools || !Array.isArray(parsed.schools)) return false;

    if (parsed.schools) localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(parsed.schools));
    if (parsed.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.users));
    if (parsed.enrollment) localStorage.setItem(STORAGE_KEYS.ENROLLMENT, JSON.stringify(parsed.enrollment));
    if (parsed.nsb) localStorage.setItem(STORAGE_KEYS.NSB, JSON.stringify(parsed.nsb));
    if (parsed.ftf) localStorage.setItem(STORAGE_KEYS.FTF, JSON.stringify(parsed.ftf));
    if (parsed.facilities) localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(parsed.facilities));
    if (parsed.staff) localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(parsed.staff));
    if (parsed.documents) localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(parsed.documents));
    if (parsed.submissions) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(parsed.submissions));
    if (parsed.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.auditLogs));

    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}
