# AEO School Data Management System
## Deployment, Security, and Backup/Restore Guide

### 1. Executive Summary & Architecture
The **Assistant Education Officer (AEO) School Data Management System** is a centralized administrative platform developed for Tehsil Pindi Gheb (District Attock, Punjab) to supervise, verify, and consolidate operational data across:
- **Public Schools** (Govt. Primary, Elementary, High, and Higher Secondary)
- **Private Registered Schools**
- **PEIMA Schools** (Punjab Education Initiatives Management Authority - Public-Private Partnership)
- **PEF Schools** (Punjab Education Foundation - Foundation Assisted Schools & New School Program)

---

### 2. Role-Based Access Control (RBAC) & School Isolation

| Role | Username Format | Permissions |
| :--- | :--- | :--- |
| **AEO Administrator** | `aeo.pindigheb` (or email `dydeowpindigheb@gmail.com`) | Full administrative oversight across all schools in the Markaz; inspects dossiers, approves or returns submissions with objection notes, resets forgotten school passwords to initial EMIS code, and exports cluster-wide Excel / PDF reports. |
| **School In-Charge / Head** | 8-digit **EMIS Code** (e.g., `37120101`) | **Strict School Isolation**: Can only access, edit, and view records belonging exclusively to their own EMIS code. Submits quarterly dossiers and uploads photographic and voucher evidence. |
| **Supervisor / Dy. DEO** | `supervisor.attock` | Read-only inspection privileges across all schools; can generate and download audit summaries without editing data. |

---

### 3. School Onboarding & Password Security Policy
1. **Initial Credentials**:
   - Initial Username: `[EMIS Code]` (e.g. `37120101`)
   - Initial Temporary Password: `[EMIS Code]` (e.g. `37120101`)
2. **Forced First-Login Password Change**:
   - As EMIS codes may be publicly known, the system automatically detects newly registered or reset accounts (`mustChangePassword: true`) and triggers a modal blocking all other app functions until a new, secure password (minimum 6 characters, not matching the EMIS code) is established.
3. **Password Storage**:
   - Passwords are encrypted using salted cryptographic hashing (SHA-256) before storage. Plaintext passwords are never saved.
4. **Emergency Password Reset**:
   - If a Head Teacher loses their password, the AEO Administrator can click **"Reset Initial Password"** on the school profile, restoring access to the EMIS code with `mustChangePassword: true`.

---

### 4. Database Structure & Collections

| Collection / Key | Description |
| :--- | :--- |
| `schools` | Master institution directory (EMIS, name, category, level, gender policy, location, head teacher contact). |
| `users` | User credentials, roles, linked EMIS codes, and password hashes. |
| `enrollment` | Grade- and gender-wise breakdown (ECE/Kachi to Class 10/12), B-Form counts, minorities, CWSN, attendance rate. |
| `nsb` | Non-Salary Budget annual allocations, 4 quarterly tranches, 8 prescribed budget heads, and itemized vouchers. |
| `ftf` | Farogh-e-Taleem Fund student collections, bank account details, and committee-approved student welfare expenses. |
| `facilities` | Classrooms, dangerous/dilapidated room flags, boundary wall safety, drinking water source, IESCO electricity, and solar power. |
| `staff` | Sanctioned vs filled vs vacant posts (PST, EST, SST, Headmaster, Class IV) and teacher rosters with SED personal numbers. |
| `documents` | Supporting photos (school front, classrooms, toilets, boundary wall), utility bills, and cash book scans with AEO verification stamps. |
| `submissions` | Quarterly submission pipeline: `Draft → Submitted → Under Review → Approved / Returned`. |
| `auditLogs` | Tamper-evident activity logs recording user, timestamp, module, and operation details. |

---

### 5. Firebase Cloud Deployment & Rules Synchronization
The application is pre-configured with the designated project `aeo-office-record`:
- **Project ID**: `aeo-office-record`
- **Auth Domain**: `aeo-office-record.firebaseapp.com`
- **Storage Bucket**: `aeo-office-record.firebasestorage.app`

#### Deploying Security Rules via Firebase CLI:
1. Ensure Firebase CLI is installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and select the project:
   ```bash
   firebase login
   firebase use aeo-office-record
   ```
3. Deploy the hardened `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

### 6. Backup and Restore Procedures
1. **JSON Snapshot Backup**:
   - In the top navigation bar, click the **"Backup"** button.
   - The system generates an immediate, structured JSON backup (`AEO_Data_Backup_YYYY-MM-DD.json`) containing all schools, enrollment rolls, NSB ledgers, FTF registers, staff lists, and audit logs.
2. **Disaster Recovery / Restore**:
   - Click the **"Restore"** button in the header and upload a previously exported `.json` snapshot.
   - The system validates the schema, restores all records, and reloads the active session.
3. **Excel / CSV Data Exports**:
   - Under the **Reports Hub** tab, officers can download full Excel spreadsheets with UTF-8 BOM encoding for:
     - Consolidated Markaz Summary
     - NSB Financial Audit Ledger
     - Infrastructure & Dangerous Rooms Gap Analysis
