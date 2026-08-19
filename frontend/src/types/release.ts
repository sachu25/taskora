import type { User, Project, Issue } from './index';

export type ReleaseStatus = 'planned' | 'in_progress' | 'released' | 'cancelled';

export interface Release {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  version: string;
  description?: string | null;
  status: ReleaseStatus;
  start_date?: string | null;
  release_date?: string | null;
  released_at?: string | null;
  created_by: string;
  release_manager_id?: string | null;
  issues_count?: number;
  creator?: User;
  release_manager?: User;
  project?: Project;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ReleaseIssue {
  id: string;
  release_id: string;
  issue_id: string;
  added_by: string;
  issue?: Issue;
  added_by_user?: User;
  created_at: string;
}

export interface CreateReleasePayload {
  name: string;
  version: string;
  description?: string;
  start_date?: string;
  release_date?: string;
  release_manager_id?: string;
}

export interface UpdateReleasePayload {
  name?: string;
  version?: string;
  description?: string;
  start_date?: string;
  release_date?: string;
  release_manager_id?: string;
}

export interface AssignReleaseManagerPayload {
  user_id: string;
}

export interface AddReleaseIssuePayload {
  issue_id: string;
}

export interface ReleaseFilterParams {
  status?: string;
  version?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedReleasesResponse {
  items: Release[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
