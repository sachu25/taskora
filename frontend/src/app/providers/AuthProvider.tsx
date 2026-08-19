import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Organization, ApiResponse } from '../../types';
import { api } from '../../services/api';

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
  isLoading: boolean;
  login: (token: string, user: User, orgs: Organization[]) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setCurrentOrg = (org: Organization) => {
    setCurrentOrgState(org);
    localStorage.setItem('taskora_current_org_id', org.id);
  };

  const refetchUser = async () => {
    const token = localStorage.getItem('taskora_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<ApiResponse<{ user: User; organizations: Organization[] }>>('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        const orgs = res.data.data.organizations;
        setOrganizations(orgs);

        const savedOrgId = localStorage.getItem('taskora_current_org_id');
        const activeOrg = orgs.find((o) => o.id === savedOrgId) || orgs[0] || null;
        setCurrentOrgState(activeOrg);
      }
    } catch {
      localStorage.removeItem('taskora_token');
      setUser(null);
      setOrganizations([]);
      setCurrentOrgState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const login = (token: string, userData: User, orgsData: Organization[]) => {
    localStorage.setItem('taskora_token', token);
    setUser(userData);
    setOrganizations(orgsData);
    if (orgsData.length > 0) {
      setCurrentOrg(orgsData[0]);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('taskora_token');
      localStorage.removeItem('taskora_current_org_id');
      setUser(null);
      setOrganizations([]);
      setCurrentOrgState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        setCurrentOrg,
        isLoading,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
