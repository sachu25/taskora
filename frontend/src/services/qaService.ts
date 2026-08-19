import { api } from './api';
import type { ApiResponse } from '../types';
import type {
  TestSuite,
  TestCase,
  TestStep,
  TestCaseIssue,
  TestRun,
  TestRunCase,
  TestExecution,
  PaginatedResponse,
} from '../types/qa';

export const qaService = {
  // --- TEST SUITES ---
  async getTestSuites(projectId: string, params?: { status?: string; search?: string; page?: number; per_page?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<TestSuite>>>(`/projects/${projectId}/test-suites`, { params });
    return res.data;
  },

  async getTestSuite(suiteId: string) {
    const res = await api.get<ApiResponse<TestSuite>>(`/test-suites/${suiteId}`);
    return res.data;
  },

  async createTestSuite(projectId: string, data: { name: string; description?: string; status?: string }) {
    const res = await api.post<ApiResponse<TestSuite>>(`/projects/${projectId}/test-suites`, data);
    return res.data;
  },

  async updateTestSuite(suiteId: string, data: { name?: string; description?: string; status?: string }) {
    const res = await api.patch<ApiResponse<TestSuite>>(`/test-suites/${suiteId}`, data);
    return res.data;
  },

  async deleteTestSuite(suiteId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-suites/${suiteId}`);
    return res.data;
  },

  async restoreTestSuite(suiteId: string) {
    const res = await api.post<ApiResponse<TestSuite>>(`/test-suites/${suiteId}/restore`);
    return res.data;
  },

  // --- TEST CASES ---
  async getTestCases(
    projectId: string,
    params?: {
      suite_id?: string;
      test_type?: string;
      priority?: string;
      status?: string;
      search?: string;
      page?: number;
      per_page?: number;
    }
  ) {
    const res = await api.get<ApiResponse<PaginatedResponse<TestCase>>>(`/projects/${projectId}/test-cases`, { params });
    return res.data;
  },

  async getTestCase(caseId: string) {
    const res = await api.get<ApiResponse<TestCase>>(`/test-cases/${caseId}`);
    return res.data;
  },

  async createTestCase(
    projectId: string,
    data: {
      title: string;
      suite_id?: string;
      description?: string;
      preconditions?: string;
      test_type?: string;
      priority?: string;
      status?: string;
    }
  ) {
    const res = await api.post<ApiResponse<TestCase>>(`/projects/${projectId}/test-cases`, data);
    return res.data;
  },

  async updateTestCase(
    caseId: string,
    data: {
      title?: string;
      suite_id?: string;
      description?: string;
      preconditions?: string;
      test_type?: string;
      priority?: string;
      status?: string;
    }
  ) {
    const res = await api.patch<ApiResponse<TestCase>>(`/test-cases/${caseId}`, data);
    return res.data;
  },

  async deleteTestCase(caseId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-cases/${caseId}`);
    return res.data;
  },

  async restoreTestCase(caseId: string) {
    const res = await api.post<ApiResponse<TestCase>>(`/test-cases/${caseId}/restore`);
    return res.data;
  },

  // --- TEST STEPS ---
  async getTestSteps(caseId: string) {
    const res = await api.get<ApiResponse<TestStep[]>>(`/test-cases/${caseId}/steps`);
    return res.data;
  },

  async addTestStep(caseId: string, data: { action: string; expected_result?: string; step_number?: number }) {
    const res = await api.post<ApiResponse<TestStep>>(`/test-cases/${caseId}/steps`, data);
    return res.data;
  },

  async updateTestStep(caseId: string, stepId: string, data: { action?: string; expected_result?: string }) {
    const res = await api.patch<ApiResponse<TestStep>>(`/test-cases/${caseId}/steps/${stepId}`, data);
    return res.data;
  },

  async deleteTestStep(caseId: string, stepId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-cases/${caseId}/steps/${stepId}`);
    return res.data;
  },

  async reorderTestStep(caseId: string, stepId: string, position: number) {
    const res = await api.patch<ApiResponse<TestStep>>(`/test-cases/${caseId}/steps/${stepId}/position`, { position });
    return res.data;
  },

  // --- ISSUE LINKING ---
  async getLinkedIssues(caseId: string) {
    const res = await api.get<ApiResponse<TestCaseIssue[]>>(`/test-cases/${caseId}/issues`);
    return res.data;
  },

  async linkIssue(caseId: string, issueId: string) {
    const res = await api.post<ApiResponse<null>>(`/test-cases/${caseId}/issues`, { issue_id: issueId });
    return res.data;
  },

  async unlinkIssue(caseId: string, issueId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-cases/${caseId}/issues/${issueId}`);
    return res.data;
  },

  // --- TEST RUNS ---
  async getTestRuns(projectId: string, params?: { status?: string; environment?: string; search?: string; page?: number; per_page?: number }) {
    const res = await api.get<ApiResponse<PaginatedResponse<TestRun>>>(`/projects/${projectId}/test-runs`, { params });
    return res.data;
  },

  async getTestRun(runId: string) {
    const res = await api.get<ApiResponse<TestRun>>(`/test-runs/${runId}`);
    return res.data;
  },

  async createTestRun(projectId: string, data: { name: string; description?: string; environment?: string }) {
    const res = await api.post<ApiResponse<TestRun>>(`/projects/${projectId}/test-runs`, data);
    return res.data;
  },

  async updateTestRun(runId: string, data: { name?: string; description?: string; environment?: string }) {
    const res = await api.patch<ApiResponse<TestRun>>(`/test-runs/${runId}`, data);
    return res.data;
  },

  async deleteTestRun(runId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-runs/${runId}`);
    return res.data;
  },

  async restoreTestRun(runId: string) {
    const res = await api.post<ApiResponse<TestRun>>(`/test-runs/${runId}/restore`);
    return res.data;
  },

  async startTestRun(runId: string) {
    const res = await api.post<ApiResponse<TestRun>>(`/test-runs/${runId}/start`);
    return res.data;
  },

  async completeTestRun(runId: string) {
    const res = await api.post<ApiResponse<TestRun>>(`/test-runs/${runId}/complete`);
    return res.data;
  },

  async cancelTestRun(runId: string) {
    const res = await api.post<ApiResponse<TestRun>>(`/test-runs/${runId}/cancel`);
    return res.data;
  },

  // --- TEST RUN CASES ---
  async getTestRunCases(runId: string) {
    const res = await api.get<ApiResponse<TestRunCase[]>>(`/test-runs/${runId}/cases`);
    return res.data;
  },

  async addTestCaseToRun(runId: string, testCaseId: string) {
    const res = await api.post<ApiResponse<TestRunCase>>(`/test-runs/${runId}/cases`, { test_case_id: testCaseId });
    return res.data;
  },

  async removeTestCaseFromRun(runId: string, caseId: string) {
    const res = await api.delete<ApiResponse<null>>(`/test-runs/${runId}/cases/${caseId}`);
    return res.data;
  },

  async reorderTestRunCase(runId: string, caseId: string, position: number) {
    const res = await api.patch<ApiResponse<TestRunCase>>(`/test-runs/${runId}/cases/${caseId}/position`, { position });
    return res.data;
  },

  // --- TEST EXECUTIONS ---
  async getTestExecutions(runId: string) {
    const res = await api.get<ApiResponse<TestExecution[]>>(`/test-runs/${runId}/executions`);
    return res.data;
  },

  async executeTestCase(runId: string, caseId: string, data: { status: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped'; actual_result?: string; notes?: string }) {
    const res = await api.post<ApiResponse<TestExecution>>(`/test-runs/${runId}/cases/${caseId}/execute`, data);
    return res.data;
  },

  async resetTestExecution(runId: string, caseId: string) {
    const res = await api.post<ApiResponse<TestExecution>>(`/test-runs/${runId}/cases/${caseId}/reset`);
    return res.data;
  },
};
