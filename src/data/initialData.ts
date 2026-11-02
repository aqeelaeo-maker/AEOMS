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

// All pre-existing schools and Marakiz removed.
// Admin (Dy. DEO) will add AEOs and assign their Markaz, and AEOs will add their schools.
export const initialSchools: School[] = [];

// Only the Admin account exists initially
export const initialUsers: UserAccount[] = [
  {
    id: 'user_dydeo',
    username: 'Admin',
    displayName: 'Dy. DEO (Deputy District Education Officer)',
    role: 'dy_deo',
    email: 'dydeowpindigheb@gmail.com',
    phone: '057-2351234',
    mustChangePassword: false,
    // Default password is 'admin'
    passwordHash: '65fd4e672b3a991df5254add6a12a8b02201dbdbf66fc047fec80fc6cb8d9083',
    createdAt: '2026-01-01T08:00:00Z'
  }
];

export const initialEnrollment: Record<string, EnrollmentData> = {};
export const initialNSB: Record<string, NSBData> = {};
export const initialFTF: Record<string, FTFData> = {};
export const initialFacilities: Record<string, BuildingAndFacilitiesData> = {};
export const initialStaff: Record<string, StaffSummaryData> = {};
export const initialDocuments: DocumentUpload[] = [];
export const initialSubmissions: SubmissionRecord[] = [];
export const initialAuditLogs: AuditLogEntry[] = [];
