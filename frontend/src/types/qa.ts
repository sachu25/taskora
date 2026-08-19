import type { User, Project } from './index';

export type TestCaseStatus = 'draft' | 'ready' | 'deprecated';
export type TestCasePriority = 'low' | 'medium' | 'high' | 'critical';
export type TestType = 'functional' | 'regression' | 'smoke' | 'integration' | 'acceptance' | 'usability' | 'performance' | 'security';
export type TestRunStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type ExecutionStatus = 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface TestSuite {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'archived';
  test_cases_count?: number;
  creator?: User;
  project?: Project;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TestStep {
  id: string;
  test_case_id: string;
  step_number: number;
  action: string;
  expected_result?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestCaseIssue {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  issue_type?: string;
}

export interface TestCase {
  id: string;
  organization_id: string;
  project_id: string;
  suite_id?: string | null;
  case_number: number;
  key: string;
  title: string;
  description?: string | null;
  preconditions?: string | null;
  test_type: TestType;
  priority: TestCasePriority;
  status: TestCaseStatus;
  suite?: TestSuite;
  project?: Project;
  creator?: User;
  steps?: TestStep[];
  issues?: TestCaseIssue[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TestRun {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  description?: string | null;
  status: TestRunStatus;
  environment?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cases_count?: number;
  creator?: User;
  project?: Project;
  run_cases?: TestRunCase[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TestExecution {
  id: string;
  organization_id: string;
  test_run_id: string;
  test_case_id: string;
  test_run_case_id: string;
  status: ExecutionStatus;
  actual_result?: string | null;
  notes?: string | null;
  executed_at?: string | null;
  executor?: User;
  test_case?: TestCase;
  created_at: string;
  updated_at: string;
}

export interface TestRunCase {
  id: string;
  test_run_id: string;
  test_case_id: string;
  position: number;
  test_case?: TestCase;
  execution?: TestExecution;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface QASummaryStats {
  total_test_suites: number;
  total_test_cases: number;
  total_test_runs: number;
  active_test_runs: number;
  execution_counts: {
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    not_run: number;
    total: number;
  };
  pass_rate_percentage: number;
}
