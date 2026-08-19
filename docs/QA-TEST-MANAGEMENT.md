# Taskora — QA & Test Management Subsystem Architecture

## 1. Overview

Milestone 05 establishes the complete backend domain, database schema, transactional actions, authorization policies, REST API endpoints, seed data, and automated test suite for Taskora's **QA & Test Management Subsystem**.

---

## 2. Entity Relationship Model

```text
Organization
  └── Project
        ├── TestSuites (test_suites)
        │     └── TestCases (test_cases)
        │           ├── TestSteps (test_steps)
        │           └── TestCaseIssues (test_case_issues ↔ issues)
        │
        └── TestRuns (test_runs)
              └── TestRunCases (test_run_cases ↔ test_cases)
                    └── TestExecutions (test_executions)
```

---

## 3. Database Tables

1. **`test_suites`**: Container for grouping test cases by module/feature area.
2. **`test_cases`**: Test specifications with sequential project-scoped case numbers (`TC-WEB-001`).
3. **`test_steps`**: Sequential action & expected result steps per test case.
4. **`test_case_issues`**: Pivot table linking test cases to issues for defect traceability.
5. **`test_runs`**: Test execution cycles (`planned`, `active`, `completed`, `cancelled`).
6. **`test_run_cases`**: Pivot table ordering test cases within a test run.
7. **`test_executions`**: Execution records (`not_run`, `passed`, `failed`, `blocked`, `skipped`).

---

## 4. Concurrency & Sequential Case Numbering

Test case keys (`TC-WEB-001`) use `lockForUpdate()` on the parent `Project` row inside a database transaction:
```php
Project::where('id', $project->id)->lockForUpdate()->first();

$maxNumber = TestCase::where('project_id', $project->id)
    ->withTrashed()
    ->max('case_number') ?: 0;

$caseNumber = $maxNumber + 1;
```
Enforced by `UNIQUE(project_id, case_number)` constraint.

---

## 5. Test Run State Machine & Execution Rules

- **Allowed Lifecycle Transitions**:
  - `planned -> active`
  - `active -> completed`
  - `planned -> cancelled`
  - `active -> cancelled`
- **Invalid Transitions**: Rejected with `HTTP 422 Unprocessable Entity`.
- **Execution Rules**: Executing test cases is permitted only when `test_run.status == active`. Executing on planned, completed, or cancelled runs returns `HTTP 422`.

---

## 6. REST API Endpoints Summary

- **Test Suites**: `GET /api/v1/projects/{project}/test-suites`, `POST /api/v1/projects/{project}/test-suites`, `GET /api/v1/test-suites/{suite}`, `PATCH /api/v1/test-suites/{suite}`, `DELETE /api/v1/test-suites/{suite}`, `POST /api/v1/test-suites/{suite}/restore`.
- **Test Cases**: `GET /api/v1/projects/{project}/test-cases`, `POST /api/v1/projects/{project}/test-cases`, `GET /api/v1/test-cases/{case}`, `PATCH /api/v1/test-cases/{case}`, `DELETE /api/v1/test-cases/{case}`, `POST /api/v1/test-cases/{case}/restore`.
- **Test Steps**: `GET /api/v1/test-cases/{case}/steps`, `POST /api/v1/test-cases/{case}/steps`, `PATCH /api/v1/test-cases/{case}/steps/{step}`, `DELETE /api/v1/test-cases/{case}/steps/{step}`, `PATCH /api/v1/test-cases/{case}/steps/{step}/position`.
- **Issue Links**: `GET /api/v1/test-cases/{case}/issues`, `POST /api/v1/test-cases/{case}/issues`, `DELETE /api/v1/test-cases/{case}/issues/{issue}`.
- **Test Runs**: `GET /api/v1/projects/{project}/test-runs`, `POST /api/v1/projects/{project}/test-runs`, `GET /api/v1/test-runs/{run}`, `PATCH /api/v1/test-runs/{run}`, `DELETE /api/v1/test-runs/{run}`, `POST /api/v1/test-runs/{run}/restore`, `POST /api/v1/test-runs/{run}/start`, `POST /api/v1/test-runs/{run}/complete`, `POST /api/v1/test-runs/{run}/cancel`.
- **Test Run Cases**: `GET /api/v1/test-runs/{run}/cases`, `POST /api/v1/test-runs/{run}/cases`, `DELETE /api/v1/test-runs/{run}/cases/{case}`, `PATCH /api/v1/test-runs/{run}/cases/{case}/position`.
- **Test Execution**: `GET /api/v1/test-runs/{run}/executions`, `POST /api/v1/test-runs/{run}/cases/{case}/execute`, `POST /api/v1/test-runs/{run}/cases/{case}/reset`.
