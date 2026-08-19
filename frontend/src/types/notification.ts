import type { User } from './index';

export type NotificationType =
  | 'issue.assigned'
  | 'issue.commented'
  | 'issue.status_changed'
  | 'issue.mentioned'
  | 'issue.watched'
  | 'sprint.started'
  | 'sprint.completed'
  | 'sprint.cancelled'
  | 'release.started'
  | 'release.completed'
  | 'release.cancelled'
  | 'qa.execution_failed'
  | 'qa.execution_completed';

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  project_id?: string | null;
  type: string;
  title: string;
  message: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action_url?: string | null;
  metadata?: Record<string, any> | null;
  read_at?: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  organization_id: string;
  user_id: string;
  preference_key: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  organization_id: string;
  user_id?: string | null;
  action: string;
  subject_type?: string | null;
  subject_id?: string | null;
  description: string;
  metadata?: Record<string, any> | null;
  user?: Partial<User> | null;
  created_at: string;
}

export interface NotificationFilterParams {
  read?: boolean;
  type?: string;
  project_id?: string;
  page?: number;
  per_page?: number;
}

export interface ActivityFilterParams {
  action?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedNotificationsResponse {
  items: Notification[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PaginatedActivityResponse {
  items: Activity[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
