import { api } from './api';
import type {
  Sprint,
  SprintIssue,
  PaginatedSprintsResponse,
  PaginatedSprintIssuesResponse,
  CreateSprintPayload,
  UpdateSprintPayload,
  SprintFilterParams,
  PaginatedIssuesResponse,
  IssueFilterParams,
  Issue,
  ApiResponse,
} from '../types';

export const sprintService = {
  async listSprints(
    projectId: string,
    params?: SprintFilterParams
  ): Promise<ApiResponse<PaginatedSprintsResponse>> {
    const response = await api.get<ApiResponse<PaginatedSprintsResponse>>(
      `/projects/${projectId}/sprints`,
      { params }
    );
    return response.data;
  },

  async createSprint(
    projectId: string,
    payload: CreateSprintPayload
  ): Promise<ApiResponse<Sprint>> {
    const response = await api.post<ApiResponse<Sprint>>(
      `/projects/${projectId}/sprints`,
      payload
    );
    return response.data;
  },

  async getSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await api.get<ApiResponse<Sprint>>(`/sprints/${sprintId}`);
    return response.data;
  },

  async updateSprint(
    sprintId: string,
    payload: UpdateSprintPayload
  ): Promise<ApiResponse<Sprint>> {
    const response = await api.patch<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`,
      payload
    );
    return response.data;
  },

  async deleteSprint(sprintId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/sprints/${sprintId}`);
    return response.data;
  },

  async restoreSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await api.post<ApiResponse<Sprint>>(`/sprints/${sprintId}/restore`);
    return response.data;
  },

  async startSprint(
    sprintId: string,
    dates?: { start_date?: string; end_date?: string }
  ): Promise<ApiResponse<Sprint>> {
    const response = await api.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/start`,
      dates
    );
    return response.data;
  },

  async completeSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await api.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/complete`
    );
    return response.data;
  },

  async cancelSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await api.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/cancel`
    );
    return response.data;
  },

  async listSprintIssues(
    sprintId: string,
    params?: IssueFilterParams
  ): Promise<ApiResponse<PaginatedSprintIssuesResponse>> {
    const response = await api.get<ApiResponse<PaginatedSprintIssuesResponse>>(
      `/sprints/${sprintId}/issues`,
      { params }
    );
    return response.data;
  },

  async addIssueToSprint(
    sprintId: string,
    issueId: string,
    position?: number
  ): Promise<ApiResponse<SprintIssue>> {
    const response = await api.post<ApiResponse<SprintIssue>>(
      `/sprints/${sprintId}/issues`,
      { issue_id: issueId, position }
    );
    return response.data;
  },

  async removeIssueFromSprint(
    sprintId: string,
    issueId: string
  ): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `/sprints/${sprintId}/issues/${issueId}`
    );
    return response.data;
  },

  async reorderSprintIssue(
    sprintId: string,
    issueId: string,
    position: number
  ): Promise<ApiResponse<SprintIssue>> {
    const response = await api.patch<ApiResponse<SprintIssue>>(
      `/sprints/${sprintId}/issues/${issueId}/position`,
      { position }
    );
    return response.data;
  },

  async getProjectBacklog(
    projectId: string,
    params?: IssueFilterParams
  ): Promise<ApiResponse<PaginatedIssuesResponse>> {
    const response = await api.get<ApiResponse<PaginatedIssuesResponse>>(
      `/projects/${projectId}/backlog`,
      { params }
    );
    return response.data;
  },

  async reorderBacklogIssue(
    projectId: string,
    issueId: string,
    position: number
  ): Promise<ApiResponse<Issue>> {
    const response = await api.patch<ApiResponse<Issue>>(
      `/projects/${projectId}/backlog/${issueId}/position`,
      { position }
    );
    return response.data;
  },
};
