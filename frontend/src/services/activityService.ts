import { api } from './api';
import type { ApiResponse } from '../types';
import type { ActivityFilterParams, PaginatedActivityResponse } from '../types/notification';

export const activityService = {
  async getOrganizationActivity(params?: ActivityFilterParams) {
    const res = await api.get<ApiResponse<PaginatedActivityResponse>>('/activity', { params });
    return res.data;
  },

  async getProjectActivity(projectId: string, params?: ActivityFilterParams) {
    const res = await api.get<ApiResponse<PaginatedActivityResponse>>(`/projects/${projectId}/activity`, { params });
    return res.data;
  },

  async getIssueActivity(issueId: string, params?: ActivityFilterParams) {
    const res = await api.get<ApiResponse<PaginatedActivityResponse>>(`/issues/${issueId}/activity`, { params });
    return res.data;
  },

  async getSprintActivity(sprintId: string, params?: ActivityFilterParams) {
    const res = await api.get<ApiResponse<PaginatedActivityResponse>>(`/sprints/${sprintId}/activity`, { params });
    return res.data;
  },

  async getReleaseActivity(releaseId: string, params?: ActivityFilterParams) {
    const res = await api.get<ApiResponse<PaginatedActivityResponse>>(`/releases/${releaseId}/activity`, { params });
    return res.data;
  },
};
