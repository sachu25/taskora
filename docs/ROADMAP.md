# Taskora Product Development Roadmap

## Milestone Overview

```text
Milestone 01: Application Foundation (COMPLETE)
  └── Milestone 01.1: Foundation Hardening & Audit Closure (COMPLETE)
       └── Milestone 02: Backend Issue Engine (COMPLETE)
            └── Milestone 02B: Issue Management UI & Navigation (COMPLETE)
                 └── Milestone 03: Agile / Sprint Domain & API (COMPLETE)
                      └── Milestone 03B: Sprint Management & Planning UI (COMPLETE)
                           └── Milestone 04: Kanban Board & Active Sprint Execution UI (COMPLETE)
                                └── Milestone 05: QA / Test Management Domain & API (COMPLETE)
                                     └── Milestone 05B: QA / Test Management UI (COMPLETE)
                                          └── Milestone 06: Release Management Domain & API Foundation (COMPLETE)
                                               └── Milestone 06B: Release Management UI (COMPLETE)
                                                    └── Milestone 07: Notifications & Activity Management (COMPLETE)
```

---

## Completed Milestones

### Milestone 01: Application Foundation
- Multi-tenant architecture (`organizations`, `users`, `teams`, `projects`, `activity_logs`).
- Sanctum bearer authentication & policy-driven authorization.

### Milestone 01.1: Foundation Hardening
- Throttling rate limiters (`auth-login`, `auth-register`, `auth-password`).

### Milestone 02: Backend Issue Engine
- Core issue tracking models, actions, REST APIs, and sequential keys (`WEB-101`).

### Milestone 02B: Issue Management UI
- Global & Project Issue navigators, debounced search, 2-column details view.

### Milestone 03: Agile / Sprint Domain & API
- `sprints`, `sprint_issues`, backlog engine, pessimistic row locking `lockForUpdate()` enforcing **One Active Sprint Per Project**.

### Milestone 03B: Sprint Management & Sprint Planning UI
- TypeScript domain types & API service.
- Project Sprint Management overview (`SprintsPage.tsx`).
- Sprint details overview & metrics bar (`SprintDetailsPage.tsx`).
- Product Backlog view (`BacklogPage.tsx`).
- Split-pane Sprint Planning workspace (`SprintPlanningPage.tsx`).

### Milestone 04: Kanban Board & Active Sprint Execution UI
- Interactive 4-Column Kanban Board (`KanbanBoard.tsx`).
- HTML5 Drag and Drop & accessible keyboard controls.

### Milestone 05: QA / Test Management Domain & API Foundation
- Database schema: `test_suites`, `test_cases`, `test_steps`, `test_case_issues`, `test_runs`, `test_run_cases`, `test_executions`.
- Concurrency-safe keys (`TC-WEB-001`), 26 Domain Actions, 4 Policies, 26 REST API endpoints.

### Milestone 05B: QA / Test Management UI
- TypeScript types (`qa.ts`) & centralized service (`qaService.ts`).
- QA Dashboard (`QADashboardPage.tsx`).
- Test Suites (`TestSuitesPage.tsx`, `TestSuiteDetailsPage.tsx`).
- Test Cases (`TestCasesPage.tsx`, `TestCaseDetailsPage.tsx`).
- Test Steps Manager (`TestStepEditor.tsx`).
- Defect Linker (`TestCaseIssueManager.tsx`).
- Test Runs & Lifecycle (`TestRunsPage.tsx`, `TestRunDetailsPage.tsx`).
- 3-Panel Interactive Execution Workspace (`TestExecutionPage.tsx`).

### Milestone 06: Release Management Domain & API Foundation
- Database schema: `releases`, `release_issues`.
- Project-scoped version uniqueness `UNIQUE(project_id, version, deleted_at)`.
- Release status lifecycle state machine: `planned` -> `in_progress` -> `released`, `planned`|`in_progress` -> `cancelled`.
- Release manager assignment (`release_manager_id`) and issue attachment (`release_issues`).
- 11 Domain Actions, 1 Policy, 4 Form Requests, 2 Controllers, 2 Resources, 14 REST API endpoints.
- Full unit, feature, and multi-tenant isolation tests (88 passed).

### Milestone 06B: Release Management UI
- TypeScript domain types (`release.ts`) & centralized service (`releaseService.ts`).
- Project Releases Overview (`ReleasesPage.tsx`).
- Release Details Workspace (`ReleaseDetailsPage.tsx`).
- Semantic Status Badges & Release Progress Metrics (`ReleaseProgress.tsx`).
- Accessible Create/Edit Modal (`ReleaseFormModal.tsx`).
- Release Manager Selector (`ReleaseManagerSelector.tsx`).
- Debounced Issue Manager & Table (`ReleaseIssueManager.tsx`, `ReleaseIssueTable.tsx`).
- Role-Aware State Machine Controls (`ReleaseLifecycleActions.tsx`).
- Soft Delete Confirmation Modal (`DeleteReleaseConfirmModal.tsx`).
- Full build and test verification (0 TypeScript errors, 88 backend tests passed).

### Milestone 07: Notifications & Activity Management
- Database schema: `notifications`, `notification_preferences`.
- Event-driven `NotificationDispatcher` integrated with Issue, Sprint, and Release domain events.
- 8 Notification Domain Actions & 1 Notification Policy.
- 13 REST API endpoints under `/api/v1` for notifications, preferences, and organization/project/issue/sprint/release audit feeds.
- React + TypeScript frontend: `NotificationBell.tsx`, `NotificationDropdown.tsx`, `NotificationItem.tsx`, `NotificationPreferences.tsx`, `ActivityFeed.tsx`, `ActivityItem.tsx`.
- Management Pages: `NotificationsPage.tsx` (`/notifications`), `ActivityPage.tsx` (`/activity`), `NotificationPreferencesPage.tsx` (`/settings/notification-preferences`).
- Verified with 99 backend tests passing, 0 TypeScript build errors, 0 composer audit advisories, and 0 npm audit vulnerabilities.

---

## Upcoming Milestones

### Milestone 08: Release Management & Automation
- Release delivery cycles, automated workflow triggers, and release readiness dashboards.
