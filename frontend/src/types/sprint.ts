import type { User, Project, Issue, PaginationMetadata } from './index';

export type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  creator?: User;
  project?: Project;
  issues_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SprintIssue {
  id: string;
  sprint_id: string;
  position: number;
  added_at?: string;
  added_by?: User;
  issue: Issue;
}

export interface PaginatedSprintsResponse {
  items: Sprint[];
  pagination: PaginationMetadata;
}

export interface PaginatedSprintIssuesResponse {
  items: SprintIssue[];
  pagination: PaginationMetadata;
}

export interface CreateSprintPayload {
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
}

export interface SprintFilterParams {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
