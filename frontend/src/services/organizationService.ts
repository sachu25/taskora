import { api } from './api';
import type { ApiResponse, Organization } from '../types';

export interface CreateOrganizationPayload {
  name: string;
  slug?: string;
  description?: string;
  timezone?: string;
}

export const organizationService = {
  async listOrganizations(): Promise<ApiResponse<Organization[]>> {
    const response = await api.get<ApiResponse<Organization[]>>('/organizations');
    return response.data;
  },

  async createOrganization(
    payload: CreateOrganizationPayload
  ): Promise<ApiResponse<Organization>> {
    const response = await api.post<ApiResponse<Organization>>('/organizations', payload);
    return response.data;
  },

  async getOrganization(id: string): Promise<ApiResponse<Organization>> {
    const response = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data;
  },

  async updateOrganization(
    id: string,
    payload: Partial<CreateOrganizationPayload>
  ): Promise<ApiResponse<Organization>> {
    const response = await api.patch<ApiResponse<Organization>>(`/organizations/${id}`, payload);
    return response.data;
  },
};
