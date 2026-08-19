export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
  locale: string;
  status: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  timezone: string;
  status: string;
  pivot_role?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user: User;
  role: string;
  status: string;
  joined_at: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  members_count?: number;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user: User;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  key: string;
  slug: string;
  description: string | null;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';
  visibility: 'private' | 'organization';
  start_date: string | null;
  target_date: string | null;
  created_by: string | null;
  members_count?: number;
  creator?: User;
  members?: ProjectMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  role: 'project_manager' | 'developer' | 'tester' | 'reporter' | 'viewer';
  user: User;
  created_at: string;
}

export interface DashboardData {
  organization_name: string;
  user_role: string;
  stats: {
    projects_count: number;
    teams_count: number;
    members_count: number;
  };
  recent_projects: Project[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export * from './issue';
export * from './sprint';
