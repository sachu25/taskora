# Taskora Release Management Subsystem Documentation

## 1. Overview

Milestone 06 implements the complete backend/domain/API foundation for Taskora's **Release Management Subsystem**.

The subsystem enables software engineering teams to manage product releases, versioning, deployment readiness, and release-issue traceability within Taskora projects.

Key features:
- **Project-Scoped Version Uniqueness**: Each version string (e.g. `v1.0.0`) must be unique within a project.
- **Strict State Machine Lifecycle**: Releases progress through standard state transitions (`planned` -> `in_progress` -> `released`, or `planned`/`in_progress` -> `cancelled`).
- **Release Manager Assignment**: Assign an authorized user from the organization as the release manager.
- **Issue Association**: Link issues from the same project to track release scope.
- **Soft Deletion & Safe Restoration**: Soft delete releases with validation to prevent version conflicts upon restoration.
- **Activity Logging**: Full audit trail for all release actions (`release.created`, `release.updated`, `release.started`, `release.completed`, `release.cancelled`, etc.).

---

## 2. Architecture & Data Model

### Data Tables

#### `releases`
| Field | Type | Description |
|---|---|---|
| `id` | ULID | Primary key |
| `organization_id` | ULID (FK) | Foreign key to `organizations` |
| `project_id` | ULID (FK) | Foreign key to `projects` |
| `name` | String | Human-readable release name |
| `version` | String | Release version tag (e.g. `v1.2.0`) |
| `description` | Text (Nullable) | Markdown description / release notes |
| `status` | Enum | `'planned'`, `'in_progress'`, `'released'`, `'cancelled'` |
| `start_date` | Date (Nullable) | Target/actual start date |
| `release_date` | Date (Nullable) | Target release date |
| `released_at` | Timestamp (Nullable) | Actual completion timestamp |
| `created_by` | ULID (FK) | Foreign key to `users` |
| `release_manager_id` | ULID (FK, Nullable) | Foreign key to `users` |
| `timestamps` | Timestamps | `created_at`, `updated_at` |
| `deleted_at` | Timestamp (Nullable) | Soft delete timestamp |

#### `release_issues`
| Field | Type | Description |
|---|---|---|
| `id` | ULID | Primary key |
| `release_id` | ULID (FK) | Foreign key to `releases` |
| `issue_id` | ULID (FK) | Foreign key to `issues` |
| `added_by` | ULID (FK) | Foreign key to `users` |
| `created_at` | Timestamp | Timestamp when issue was linked |

---

## 3. Lifecycle State Machine

```
  [ planned ] ──────────────► [ in_progress ] ──────────────► [ released ]
       │                             │
       │                             │
       └─────────────────────────────┴──────────────────────► [ cancelled ]
```

### Valid Transitions
- `planned` -> `in_progress` (Start Release via `POST /api/v1/releases/{release}/start`)
- `in_progress` -> `released` (Complete Release via `POST /api/v1/releases/{release}/complete`)
- `planned` -> `cancelled` (Cancel Release via `POST /api/v1/releases/{release}/cancel`)
- `in_progress` -> `cancelled` (Cancel Release via `POST /api/v1/releases/{release}/cancel`)

### Invalid Transitions (HTTP 422 Rejected)
- `released` -> `planned`, `in_progress`, `cancelled`
- `cancelled` -> `planned`, `in_progress`, `released`
- `planned` -> `released` (Must start release first)

---

## 4. API Endpoints

| Method | Endpoint | Description | Authorization Policy |
|---|---|---|---|
| `GET` | `/api/v1/projects/{project}/releases` | List project releases (paginated, searchable, status filter) | `viewAny` |
| `POST` | `/api/v1/projects/{project}/releases` | Create new release | `create` |
| `GET` | `/api/v1/releases/{release}` | Show release details | `view` |
| `PATCH` | `/api/v1/releases/{release}` | Update release details | `update` |
| `DELETE` | `/api/v1/releases/{release}` | Soft delete release | `delete` |
| `POST` | `/api/v1/releases/{id}/restore` | Restore soft-deleted release | `restore` |
| `POST` | `/api/v1/releases/{release}/start` | Transition status to `in_progress` | `start` |
| `POST` | `/api/v1/releases/{release}/complete` | Transition status to `released` | `complete` |
| `POST` | `/api/v1/releases/{release}/cancel` | Transition status to `cancelled` | `cancel` |
| `GET` | `/api/v1/releases/{release}/issues` | List issues linked to release | `view` |
| `POST` | `/api/v1/releases/{release}/issues` | Attach issue to release | `manageIssues` |
| `DELETE` | `/api/v1/releases/{release}/issues/{issue}` | Remove issue from release | `manageIssues` |
| `POST` | `/api/v1/releases/{release}/manager` | Assign release manager | `manageReleaseManager` |
| `DELETE` | `/api/v1/releases/{release}/manager` | Remove release manager | `manageReleaseManager` |
