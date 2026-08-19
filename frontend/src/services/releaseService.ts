import { api } from './api';
import type { ApiResponse } from '../types';
import type {
  Release,
  ReleaseIssue,
  CreateReleasePayload,
  UpdateReleasePayload,
  AssignReleaseManagerPayload,
  AddReleaseIssuePayload,
  ReleaseFilterParams,
  PaginatedReleasesResponse,
} from '../types/release';

export const releaseService = {
  async getProjectReleases(projectId: string, params?: ReleaseFilterParams) {
    const res = await api.get<ApiResponse<PaginatedReleasesResponse>>(`/projects/${projectId}/releases`, { params });
    return res.data;
  },

  async createRelease(projectId: string, payload: CreateReleasePayload) {
    const res = await api.post<ApiResponse<Release>>(`/projects/${projectId}/releases`, payload);
    return res.data;
  },

  async getRelease(releaseId: string) {
    const res = await api.get<ApiResponse<Release>>(`/releases/${releaseId}`);
    return res.data;
  },

  async updateRelease(releaseId: string, payload: UpdateReleasePayload) {
    const res = await api.patch<ApiResponse<Release>>(`/releases/${releaseId}`, payload);
    return res.data;
  },

  async deleteRelease(releaseId: string) {
    const res = await api.delete<ApiResponse<null>>(`/releases/${releaseId}`);
    return res.data;
  },

  async restoreRelease(releaseId: string) {
    const res = await api.post<ApiResponse<Release>>(`/releases/${releaseId}/restore`);
    return res.data;
  },

  async startRelease(releaseId: string) {
    const res = await api.post<ApiResponse<Release>>(`/releases/${releaseId}/start`);
    return res.data;
  },

  async completeRelease(releaseId: string) {
    const res = await api.post<ApiResponse<Release>>(`/releases/${releaseId}/complete`);
    return res.data;
  },

  async cancelRelease(releaseId: string) {
    const res = await api.post<ApiResponse<Release>>(`/releases/${releaseId}/cancel`);
    return res.data;
  },

  async getReleaseIssues(releaseId: string) {
    const res = await api.get<ApiResponse<ReleaseIssue[]>>(`/releases/${releaseId}/issues`);
    return res.data;
  },

  async addIssueToRelease(releaseId: string, payload: AddReleaseIssuePayload) {
    const res = await api.post<ApiResponse<ReleaseIssue>>(`/releases/${releaseId}/issues`, payload);
    return res.data;
  },

  async removeIssueFromRelease(releaseId: string, issueId: string) {
    const res = await api.delete<ApiResponse<null>>(`/releases/${releaseId}/issues/${issueId}`);
    return res.data;
  },

  async assignReleaseManager(releaseId: string, payload: AssignReleaseManagerPayload) {
    const res = await api.post<ApiResponse<Release>>(`/releases/${releaseId}/manager`, payload);
    return res.data;
  },

  async removeReleaseManager(releaseId: string) {
    const res = await api.delete<ApiResponse<Release>>(`/releases/${releaseId}/manager`);
    return res.data;
  },
};
