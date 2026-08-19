# Taskora — Milestone 03 Agile / Sprint Domain & API Walkthrough

## 1. Milestone Overview

Milestone 03 delivers the complete backend domain engine, database schema, transactional actions, authorization policies, seed data, and REST APIs for Taskora's **Agile Project Management, Scrum Sprints, and Product Backlog Subsystem**.

---

## 2. Architecture & Database Changes

- Created migrations:
  - `2026_08_18_110001_create_sprints_table.php`
  - `2026_08_18_110002_create_sprint_issues_table.php`
  - `2026_08_18_110003_add_backlog_position_to_issues_table.php`
- Created Eloquent Models:
  - `app/Models/Sprint.php`
  - `app/Models/SprintIssue.php`
  - Extended `app/Models/Issue.php` and `app/Models/Project.php`

---

## 3. Domain Actions (`app/Domain/Sprint/Actions/`)

- `CreateSprint`, `UpdateSprint`, `DeleteSprint`, `RestoreSprint`
- `StartSprint` (enforces **One Active Sprint Per Project** rule via `lockForUpdate()` pessimistic locking)
- `CompleteSprint`, `CancelSprint`
- `AddIssueToSprint`, `RemoveIssueFromSprint`, `ReorderSprintIssue`

---

## 4. Authorization & Security (`app/Policies/SprintPolicy.php`)

- Enforces organization and project boundaries.
- Permissions: `organization_admin`, `project_manager` (full management); `developer` (manage sprint issues); `tester` / `reporter` (view only).

---

## 5. API Endpoints & Backlog Engine

- Project Sprints: `GET/POST /api/v1/projects/{project}/sprints`
- Lifecycle: `POST /api/v1/sprints/{sprint}/start`, `complete`, `cancel`, `restore`
- Sprint Issues & Ordering: `GET/POST /api/v1/sprints/{sprint}/issues`, `DELETE /sprints/{sprint}/issues/{issue}`, `PATCH /sprints/{sprint}/issues/{issue}/position`
- Backlog: `GET /api/v1/projects/{project}/backlog`, `PATCH /api/v1/projects/{project}/backlog/{issue}/position`

---

## 6. Verification Results

- **Backend Test Suite (`php artisan test`)**:
  `49 passed (124 assertions)` in 6.33s (100% pass rate).
- **Frontend Build (`npm run build`)**:
  `✓ built in 592ms` (0 TypeScript / Vite compilation errors).
- **Composer & NPM Security Audits**:
  `0 vulnerabilities found`.

---

## 7. Next Milestone Readiness

**READY** — Taskora is 100% prepared to proceed to **Milestone 03B — Scrum Board & Agile Sprint UI**.
