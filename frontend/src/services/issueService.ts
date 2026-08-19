import { api } from './api';
import type {
  ApiResponse,
  Issue,
  IssueComment,
  Label,
  IssueWatcher,
  IssueLink,
  PaginatedIssuesResponse,
  IssueFilterParams,
} from '../types';

export const issueService = {
  // Issues
  getProjectIssues: async (projectId: string, params?: IssueFilterParams) => {
    const response = await api.get<ApiResponse<PaginatedIssuesResponse>>(
      `/projects/${projectId}/issues`,
      { params }
    );
    return response.data;
  },

  getIssueDetails: async (issueId: string) => {
    const response = await api.get<ApiResponse<Issue>>(`/issues/${issueId}`);
    return response.data;
  },

  createIssue: async (projectId: string, data: Partial<Issue>) => {
    const response = await api.post<ApiResponse<Issue>>(`/projects/${projectId}/issues`, data);
    return response.data;
  },

  updateIssue: async (issueId: string, data: Partial<Issue>) => {
    const response = await api.patch<ApiResponse<Issue>>(`/issues/${issueId}`, data);
    return response.data;
  },

  deleteIssue: async (issueId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/issues/${issueId}`);
    return response.data;
  },

  restoreIssue: async (issueId: string) => {
    const response = await api.post<ApiResponse<Issue>>(`/issues/${issueId}/restore`);
    return response.data;
  },

  // Comments
  getIssueComments: async (issueId: string) => {
    const response = await api.get<ApiResponse<IssueComment[]>>(`/issues/${issueId}/comments`);
    return response.data;
  },

  addComment: async (issueId: string, body: string) => {
    const response = await api.post<ApiResponse<IssueComment>>(`/issues/${issueId}/comments`, { body });
    return response.data;
  },

  updateComment: async (commentId: string, body: string) => {
    const response = await api.patch<ApiResponse<IssueComment>>(`/comments/${commentId}`, { body });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/comments/${commentId}`);
    return response.data;
  },

  // Labels
  getOrgLabels: async (organizationId: string) => {
    const response = await api.get<ApiResponse<Label[]>>(`/organizations/${organizationId}/labels`);
    return response.data;
  },

  createOrgLabel: async (organizationId: string, name: string, color?: string) => {
    const response = await api.post<ApiResponse<Label>>(`/organizations/${organizationId}/labels`, {
      name,
      color,
    });
    return response.data;
  },

  attachLabel: async (issueId: string, labelId: string) => {
    const response = await api.post<ApiResponse<null>>(`/issues/${issueId}/labels/${labelId}`);
    return response.data;
  },

  detachLabel: async (issueId: string, labelId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/issues/${issueId}/labels/${labelId}`);
    return response.data;
  },

  // Watchers
  getWatchers: async (issueId: string) => {
    const response = await api.get<ApiResponse<IssueWatcher[]>>(`/issues/${issueId}/watchers`);
    return response.data;
  },

  watchIssue: async (issueId: string, userId?: string) => {
    const response = await api.post<ApiResponse<null>>(`/issues/${issueId}/watchers`, {
      user_id: userId,
    });
    return response.data;
  },

  unwatchIssue: async (issueId: string, userId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/issues/${issueId}/watchers/${userId}`);
    return response.data;
  },

  // Links
  getIssueLinks: async (issueId: string) => {
    const response = await api.get<ApiResponse<IssueLink[]>>(`/issues/${issueId}/links`);
    return response.data;
  },

  createIssueLink: async (issueId: string, linkedIssueId: string, linkType: string) => {
    const response = await api.post<ApiResponse<IssueLink>>(`/issues/${issueId}/links`, {
      linked_issue_id: linkedIssueId,
      link_type: linkType,
    });
    return response.data;
  },

  deleteIssueLink: async (linkId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/issue-links/${linkId}`);
    return response.data;
  },
};
