import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, School } from '../types';
import {
  getUsers,
  getUserByUsername,
  updateUserPassword,
  getSchoolByEmis,
  initializeStorage
} from '../services/storage';
import { hashPassword } from '../data/initialData';
import { ensureFirebaseAuth } from '../firebase/config';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentSchool: School | null;
  isAuthenticated: boolean;
  isAEO: boolean;
  isSupervisor: boolean;
  isSchoolUser: boolean;
  mustChangePasswordModalOpen: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  submitPasswordChange: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: 'aeo_admin' | 'supervisor' | 'school_user', emisCode?: string) => void;
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
  const [loading, setLoading] = useState(true);

  // Initialize and retrieve cached session
  useEffect(() => {
    initializeStorage();
    ensureFirebaseAuth().catch(err => console.warn('Auth init note:', err));
    try {
      const savedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserJson) {
        const parsed: UserAccount = JSON.parse(savedUserJson);
        // Refresh latest record from storage
        const latest = getUserByUsername(parsed.username);
        if (latest) {
          setCurrentUser(latest);
          if (latest.mustChangePassword) {
            setMustChangePasswordModalOpen(true);
          }
          if (latest.role === 'school_user' && latest.schoolEmisCode) {
            setSelectedSchoolEmisState(latest.schoolEmisCode);
          }
        }
      } else {
        // Default on initial launch: AEO Administrator to show the complete command center
        const defaultAEO = getUserByUsername('aeo.pindigheb');
        if (defaultAEO) {
          setCurrentUser(defaultAEO);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAEO));
        }
      }

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
    const user = getUserByUsername(trimmedUser);

    if (!user) {
      return { success: false, error: 'User account not found. Please check EMIS code or username.' };
    }

    const hashedInput = await hashPassword(plainPassword);

    // Initial temporary password check: if user hasn't changed password, plainPassword equals EMIS code
    const isInitialMatch = user.mustChangePassword && plainPassword.trim() === trimmedUser;
    const isHashMatch = user.passwordHash === hashedInput;

    // Known default seeds match
    const isDefaultAdminMatch = user.username === 'aeo.pindigheb' && plainPassword === 'AeoAdmin@2026';
    const isDefaultSuperMatch = user.username === 'supervisor.attock' && plainPassword === 'Supervisor@2026';
    const isInitialEmisHashMatch = user.passwordHash === `${trimmedUser}_initial_hash` && plainPassword === trimmedUser;

    if (!isInitialMatch && !isHashMatch && !isDefaultAdminMatch && !isDefaultSuperMatch && !isInitialEmisHashMatch) {
      return { success: false, error: 'Incorrect password. Initial temporary password is your EMIS code.' };
    }

    // Success
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    if (user.role === 'school_user' && user.schoolEmisCode) {
      setSelectedSchoolEmisState(user.schoolEmisCode);
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
  };

  const submitPasswordChange = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session' };

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (currentUser.role === 'school_user' && newPassword.trim() === currentUser.username.trim()) {
      return { success: false, error: 'New password cannot be the same as your EMIS code!' };
    }

    const updated = await updateUserPassword(currentUser.id, newPassword);
    if (!updated) return { success: false, error: 'Failed to update password' };

    const refreshed = getUserByUsername(currentUser.username);
    if (refreshed) {
      setCurrentUser(refreshed);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed));
    }
    setMustChangePasswordModalOpen(false);
    return { success: true };
  };

  const demoLogin = (role: 'aeo_admin' | 'supervisor' | 'school_user', emisCode?: string) => {
    if (role === 'aeo_admin') {
      const u = getUserByUsername('aeo.pindigheb');
      if (u) {
        setCurrentUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
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
      const targetEmis = emisCode || '37120101';
      let u = getUserByUsername(targetEmis);
      if (!u) {
        // If not present, create on the fly
        const users = getUsers();
        const school = getSchoolByEmis(targetEmis);
        const newUser: UserAccount = {
          id: 'user_' + targetEmis,
          username: targetEmis,
          displayName: school ? school.name : `School ${targetEmis}`,
          role: 'school_user',
          schoolEmisCode: targetEmis,
          mustChangePassword: true,
          passwordHash: `${targetEmis}_initial_hash`,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('aeo_users_v1', JSON.stringify(users));
        u = newUser;
      }
      setCurrentUser(u);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      setSelectedSchoolEmisState(targetEmis);
      if (u.mustChangePassword) {
        setMustChangePasswordModalOpen(true);
      } else {
        setMustChangePasswordModalOpen(false);
      }
    }
  };

  const isAEO = currentUser?.role === 'aeo_admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isSchoolUser = currentUser?.role === 'school_user';

  // Target school for editing / viewing:
  // If school user, ALWAYS their assigned school. If AEO or Supervisor, the selected school or null.
  const effectiveSchoolEmis = isSchoolUser ? currentUser?.schoolEmisCode : selectedSchoolEmis;
  const currentSchool = effectiveSchoolEmis ? getSchoolByEmis(effectiveSchoolEmis) || null : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentSchool,
        isAuthenticated: !!currentUser,
        isAEO,
        isSupervisor,
        isSchoolUser,
        mustChangePasswordModalOpen,
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
