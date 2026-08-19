import type { User, Project } from './index';

export type IssueType = 'bug' | 'task' | 'story' | 'feature' | 'improvement';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueSeverity = 'minor' | 'major' | 'critical' | 'blocker';
export type IssueLinkType = 'blocks' | 'blocked_by' | 'duplicates' | 'duplicated_by' | 'relates_to';

export interface Label {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  created_by?: string;
  created_at?: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user: User;
  body: string;
  created_at: string;
  updated_at?: string;
}

export interface IssueWatcher {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface IssueLink {
  id: string;
  issue_id: string;
  linked_issue: {
    id: string;
    key: string;
    title: string;
    status: IssueStatus;
    issue_type: IssueType;
  };
  link_type: IssueLinkType;
  created_at: string;
}

export interface IssueAttachment {
  id: string;
  issue_id: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_by?: User;
  created_at: string;
}

export interface Issue {
  id: string;
  key: string;
  issue_number: number;
  organization_id: string;
  project_id: string;
  project?: Project;
  issue_type: IssueType;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity | null;
  reporter?: User;
  assignee?: User | null;
  assignee_id?: string | null;
  parent_id?: string | null;
  parent?: Issue | null;
  children?: Issue[];
  labels?: Label[];
  watchers_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaginationMetadata {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedIssuesResponse {
  items: Issue[];
  pagination: PaginationMetadata;
}

export interface IssueFilterParams {
  type?: string;
  status?: string;
  priority?: string;
  severity?: string;
  assignee?: string;
  reporter?: string;
  label?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
