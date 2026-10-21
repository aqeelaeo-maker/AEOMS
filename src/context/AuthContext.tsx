import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, School } from '../types';
import {
  getUsers,
  getUserByUsername,
  updateUserPassword,
  getSchoolByEmis,
  getSchools,
  getSchoolsForUser,
  initializeStorage,
  STORAGE_KEYS
} from '../services/storage';
import { hashPassword } from '../data/initialData';
import { ensureFirebaseAuth } from '../firebase/config';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentSchool: School | null;
  allowedSchools: School[];
  isAuthenticated: boolean;
  isDyDEO: boolean;
  isAEO: boolean;
  isSupervisor: boolean;
  isSchoolUser: boolean;
  mustChangePasswordModalOpen: boolean;
  isChangePasswordOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  submitPasswordChange: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: 'dy_deo' | 'aeo_admin' | 'supervisor' | 'school_user', idOrEmis?: string) => void;
  // For AEO and Supervisor: Selected active school for deep inspection
  selectedSchoolEmis: string | null;
  setSelectedSchoolEmis: (emisCode: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'aeo_auth_user_v1';
const SELECTED_SCHOOL_KEY = 'aeo_selected_school_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [selectedSchoolEmis, setSelectedSchoolEmisState] = useState<string | null>(null);
  const [mustChangePasswordModalOpen, setMustChangePasswordModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize persistent state and retrieve cached session
  useEffect(() => {
    initializeStorage();
    ensureFirebaseAuth().catch(err => console.warn('Auth init note:', err));
    try {
      const savedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserJson) {
        const parsed: UserAccount = JSON.parse(savedUserJson);
        const latest = getUserByUsername(parsed.username) || (parsed.email ? getUserByUsername(parsed.email) : undefined);
        if (latest) {
          setCurrentUser(latest);
          if (latest.mustChangePassword) {
            setMustChangePasswordModalOpen(true);
          }
          if (latest.role === 'school_user' && latest.schoolEmisCode) {
            setSelectedSchoolEmisState(latest.schoolEmisCode);
          }
        }
      }
      // If no cached session, currentUser stays null to present the Sign In page

      const savedSelected = localStorage.getItem(SELECTED_SCHOOL_KEY);
      if (savedSelected) {
        setSelectedSchoolEmisState(savedSelected);
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openChangePasswordModal = () => setIsChangePasswordOpen(true);
  const closeChangePasswordModal = () => {
    setIsChangePasswordOpen(false);
    setMustChangePasswordModalOpen(false);
  };

  const setSelectedSchoolEmis = (emisCode: string | null) => {
    // School user can NEVER switch away from their assigned EMIS
    if (currentUser?.role === 'school_user') {
      setSelectedSchoolEmisState(currentUser.schoolEmisCode || null);
      return;
    }
    setSelectedSchoolEmisState(emisCode);
    if (emisCode) {
      localStorage.setItem(SELECTED_SCHOOL_KEY, emisCode);
    } else {
      localStorage.removeItem(SELECTED_SCHOOL_KEY);
    }
  };

  const login = async (username: string, plainPassword: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUser = username.trim();
    const cleanPass = plainPassword.trim();
    const user = getUserByUsername(trimmedUser);

    if (!user) {
      return {
        success: false,
        error: 'User account not found. Please verify official Username / CNIC / EMIS code.'
      };
    }

    const hashedInput = await hashPassword(cleanPass);
    const passDigits = cleanPass.replace(/[^0-9]/g, '');

    // 1. Password hash match (for updated/custom passwords)
    const isHashMatch = user.passwordHash === hashedInput;

    // 2. Default Dy. DEO: Username 'Admin' (or dydeowpindigheb@gmail.com), Password 'admin'
    const isDyDeo =
      user.role === 'dy_deo' ||
      user.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
      user.username.toLowerCase() === 'admin';
    const isDefaultDyDeoMatch = isDyDeo && (cleanPass.toLowerCase() === 'admin' || cleanPass === 'Admin');

    // 3. Default AEO: Username & Password is CNIC Number (with or without hyphens)
    const isAeo = user.role === 'aeo_admin';
    const aeoCnic = user.cnic || user.username;
    const aeoCnicDigits = aeoCnic.replace(/[^0-9]/g, '');
    const isDefaultAeoMatch =
      isAeo &&
      (cleanPass === aeoCnic || (passDigits.length > 0 && passDigits === aeoCnicDigits) || cleanPass === user.username);

    // 4. Default School: Username & Password is EMIS Code
    const isSchool = user.role === 'school_user';
    const schoolEmis = user.schoolEmisCode || user.username;
    const isDefaultSchoolMatch =
      isSchool && (cleanPass === schoolEmis || cleanPass === user.username);

    // 5. Initial EMIS hash flag match
    const isInitialEmisHashMatch =
      user.passwordHash === `${schoolEmis}_initial_hash` && cleanPass === schoolEmis;

    if (!isHashMatch && !isDefaultDyDeoMatch && !isDefaultAeoMatch && !isDefaultSchoolMatch && !isInitialEmisHashMatch) {
      return {
        success: false,
        error: 'Incorrect password. Default: Dy. DEO: admin | AEO: CNIC Number | School: EMIS Code.'
      };
    }

    // Success
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    if (user.role === 'school_user' && user.schoolEmisCode) {
      setSelectedSchoolEmisState(user.schoolEmisCode);
    } else {
      setSelectedSchoolEmisState(null);
    }

    if (user.mustChangePassword) {
      setMustChangePasswordModalOpen(true);
    } else {
      setMustChangePasswordModalOpen(false);
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSelectedSchoolEmisState(null);
    setMustChangePasswordModalOpen(false);
    setIsChangePasswordOpen(false);
  };

  const submitPasswordChange = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session' };

    const trimmed = newPassword.trim();
    if (trimmed.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long' };
    }

    if (currentUser.role === 'school_user' && trimmed === currentUser.username.trim()) {
      return { success: false, error: 'New password cannot be the same as your EMIS code!' };
    }

    const updated = await updateUserPassword(currentUser.id, trimmed);
    if (!updated) return { success: false, error: 'Failed to update password' };

    const refreshed = getUserByUsername(currentUser.username);
    if (refreshed) {
      setCurrentUser(refreshed);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed));
    }
    setMustChangePasswordModalOpen(false);
    setIsChangePasswordOpen(false);
    return { success: true };
  };

  const demoLogin = (role: 'dy_deo' | 'aeo_admin' | 'supervisor' | 'school_user', idOrEmis?: string) => {
    if (role === 'dy_deo') {
      const u =
        getUserByUsername('Admin') ||
        getUserByUsername('dydeowpindigheb@gmail.com') ||
        getUsers().find(x => x.role === 'dy_deo');
      if (u) {
        setCurrentUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        setSelectedSchoolEmisState(null);
        setMustChangePasswordModalOpen(false);
      }
    } else if (role === 'aeo_admin') {
      const targetUser = idOrEmis ? getUserByUsername(idOrEmis) : getUsers().find(x => x.role === 'aeo_admin');
      if (targetUser) {
        setCurrentUser(targetUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
        setSelectedSchoolEmisState(null);
        setMustChangePasswordModalOpen(false);
      }
    } else if (role === 'supervisor') {
      const u = getUserByUsername('supervisor.attock');
      if (u) {
        setCurrentUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        setSelectedSchoolEmisState(null);
        setMustChangePasswordModalOpen(false);
      }
    } else {
      const targetEmis = idOrEmis || '37120101';
      let u = getUserByUsername(targetEmis);
      if (!u) {
        const users = getUsers();
        const school = getSchoolByEmis(targetEmis);
        const newUser: UserAccount = {
          id: 'user_' + targetEmis,
          username: targetEmis,
          displayName: school ? school.name : `School ${targetEmis}`,
          role: 'school_user',
          schoolEmisCode: targetEmis,
          mustChangePassword: false,
          passwordHash: `${targetEmis}_initial_hash`,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        u = newUser;
      }
      setCurrentUser(u);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      setSelectedSchoolEmisState(targetEmis);
      setMustChangePasswordModalOpen(false);
    }
  };

  const isDyDEO =
    currentUser?.role === 'dy_deo' ||
    currentUser?.email?.toLowerCase() === 'dydeowpindigheb@gmail.com' ||
    currentUser?.username?.toLowerCase() === 'admin';
  const isAEO = currentUser?.role === 'aeo_admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isSchoolUser = currentUser?.role === 'school_user';

  // Each AEO can only view data of his own schools
  const allowedSchools = getSchoolsForUser(currentUser);

  // Target school for editing / viewing:
  const effectiveSchoolEmis = isSchoolUser
    ? currentUser?.schoolEmisCode
    : selectedSchoolEmis || (allowedSchools.length > 0 ? allowedSchools[0].emisCode : null);

  const currentSchool = effectiveSchoolEmis ? getSchoolByEmis(effectiveSchoolEmis) || null : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentSchool,
        allowedSchools,
        isAuthenticated: !!currentUser,
        isDyDEO: !!isDyDEO,
        isAEO: !!isAEO,
        isSupervisor: !!isSupervisor,
        isSchoolUser: !!isSchoolUser,
        mustChangePasswordModalOpen,
        isChangePasswordOpen,
        openChangePasswordModal,
        closeChangePasswordModal,
        login,
        logout,
        submitPasswordChange,
        demoLogin,
        selectedSchoolEmis,
        setSelectedSchoolEmis
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
