# Taskora — Agile Scrum Sprints & Product Backlog Specification

## Overview

Milestone 03 establishes the backend domain engine, database architecture, policies, and REST APIs for Taskora's **Agile Scrum Sprints & Product Backlog Subsystem**.

---

## 1. Domain Model & Entity Hierarchy

```text
Organization
  └── Project
        ├── Product Backlog (Unscheduled issues with backlog_position)
        └── Sprints (planned, active, completed, cancelled)
              └── Sprint Issues (ordered junction records)
```

---

## 2. Database Schema (`sprints`, `sprint_issues`, `issues.backlog_position`)

- **`sprints`**:
  - `id` (ULID)
  - `organization_id`, `project_id` (ULID foreign keys)
  - `name` (string), `goal` (text nullable)
  - `status` (`planned`, `active`, `completed`, `cancelled`, default `planned`)
  - `start_date`, `end_date` (date nullable)
  - `created_by` (ULID foreign key -> `users.id`)
  - `completed_at` (timestamp nullable)
  - SoftDeletes (`deleted_at`)
  - Indexes: `organization_id`, `project_id`, `(project_id, status)`, `(project_id, start_date)`, `(project_id, end_date)`, `created_by`.

- **`sprint_issues`**:
  - `id` (ULID)
  - `sprint_id`, `issue_id` (ULID foreign keys)
  - `added_by` (ULID nullable)
  - `position` (unsigned integer)
  - `added_at` (timestamp)
  - Unique constraint: `UNIQUE(sprint_id, issue_id)`

- **`issues.backlog_position`**:
  - Nullable unsigned integer with index `(project_id, backlog_position)` for backlog ordering.

---

## 3. Sprint Lifecycle & Business Rules

1. **One Active Sprint Rule**: A project can have only **one active sprint** at any time. Enforced via pessimistic row locking (`lockForUpdate()`) in `StartSprint`.
2. **Lifecycle Transitions**:
   - `planned` -> `active` (requires `start_date` & `end_date >= start_date`)
   - `active` -> `completed` (sets `completed_at = now()`)
   - `planned`/`active` -> `cancelled`
   - Invalid transitions (`completed -> active`, `cancelled -> active`, `planned -> completed`) are strictly rejected with HTTP 422.
3. **Project & Organization Boundary**: An issue can only be added to a sprint if `issue.project_id == sprint.project_id` and `issue.organization_id == sprint.organization_id`. Cross-project or cross-tenant additions are rejected with HTTP 422/403.
4. **Issue Removal Preservation**: Removing an issue from a sprint deletes the `sprint_issues` junction row, but **never deletes the issue**.

---

## 4. REST API Endpoints

- `GET /api/v1/projects/{project}/sprints`
- `POST /api/v1/projects/{project}/sprints`
- `GET /api/v1/sprints/{sprint}`
- `PATCH /api/v1/sprints/{sprint}`
- `DELETE /api/v1/sprints/{sprint}`
- `POST /api/v1/sprints/{sprint}/restore`
- `POST /api/v1/sprints/{sprint}/start`
- `POST /api/v1/sprints/{sprint}/complete`
- `POST /api/v1/sprints/{sprint}/cancel`
- `GET /api/v1/sprints/{sprint}/issues`
- `POST /api/v1/sprints/{sprint}/issues`
- `DELETE /api/v1/sprints/{sprint}/issues/{issue}`
- `PATCH /api/v1/sprints/{sprint}/issues/{issue}/position`
- `GET /api/v1/projects/{project}/backlog`
- `PATCH /api/v1/projects/{project}/backlog/{issue}/position`
