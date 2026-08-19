# Taskora — QA / Test Management UI Architecture

## 1. Overview

Milestone 05B establishes the React + TypeScript frontend architecture for Taskora's **QA / Test Management Subsystem**. It consumes the 26 backend REST API endpoints built in Milestone 05.

---

## 2. Frontend File Map

- **Domain Types**: [`frontend/src/types/qa.ts`](file:///c:/wamp64/www/Taskora/frontend/src/types/qa.ts)
- **API Service Layer**: [`frontend/src/services/qaService.ts`](file:///c:/wamp64/www/Taskora/frontend/src/services/qaService.ts)
- **Status Badges**:
  - `TestCaseStatusBadge.tsx` (`draft`, `ready`, `deprecated`)
  - `TestRunStatusBadge.tsx` (`planned`, `active`, `completed`, `cancelled`)
  - `ExecutionStatusBadge.tsx` (`not_run`, `passed`, `failed`, `blocked`, `skipped`)
- **Modals & Managers**:
  - `TestSuiteFormModal.tsx`
  - `TestCaseFormModal.tsx`
  - `TestRunFormModal.tsx`
  - `TestStepEditor.tsx`
  - `TestCaseIssueManager.tsx`
  - `DeleteQAConfirmModal.tsx`
- **Summary & Progress**:
  - `QASummaryCards.tsx`
  - `QAProgress.tsx`
- **Page Components (`frontend/src/pages/qa/`)**:
  - `QADashboardPage.tsx`: Executive summary of project test metrics and active run progress.
  - `TestSuitesPage.tsx`: Test suite list view with status filter & modal editors.
  - `TestSuiteDetailsPage.tsx`: Test suite details with attached test cases table.
  - `TestCasesPage.tsx`: Project-wide test case repository with search, filtering, and pagination.
  - `TestCaseDetailsPage.tsx`: Detailed view with preconditions, step checklist manager, and defect issue linker.
  - `TestRunsPage.tsx`: Test run list with lifecycle action controls (**Start**, **Complete**, **Cancel**).
  - `TestRunDetailsPage.tsx`: Detailed run view with included test cases assignment.
  - `TestExecutionPage.tsx`: 3-panel interactive execution workspace.

---

## 3. Routes Summary

- `/projects/:projectId/qa` -> `QADashboardPage`
- `/projects/:projectId/test-suites` -> `TestSuitesPage`
- `/projects/:projectId/test-suites/:suiteId` -> `TestSuiteDetailsPage`
- `/projects/:projectId/test-cases` -> `TestCasesPage`
- `/projects/:projectId/test-cases/:testCaseId` -> `TestCaseDetailsPage`
- `/projects/:projectId/test-runs` -> `TestRunsPage`
- `/projects/:projectId/test-runs/:testRunId` -> `TestRunDetailsPage`
- `/projects/:projectId/test-runs/:testRunId/execute` -> `TestExecutionPage`

---

## 4. Role-Aware UX Controls

- **Organization Admin / Project Manager**: Full QA administration (creation, editing, soft-deletion, restoration, lifecycle management).
- **Tester**: Execute test cases, update execution status, add execution notes, define test steps, link defect issues.
- **Developer**: View test specifications, step instructions, and linked defects.
- **Reporter**: Read-only access to QA specifications and test results.
