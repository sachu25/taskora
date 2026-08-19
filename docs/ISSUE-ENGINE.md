# Taskora — Issue Engine Technical Specification

## Overview

The Issue Engine is the core domain foundation of Taskora. It provides unified data structures, sequential issue numbering, policy-driven authorization, and multi-tenant isolation for all issue types (`bug`, `task`, `story`, `feature`, `improvement`).

---

## 1. Domain Model & Entity Hierarchy

```text
Organization
  └── Projects
       └── Issues
            ├── Issue Comments (SoftDeletes)
            ├── Issue Labels (Pivot to Organization Labels)
            ├── Issue Watchers (Pivot to Users)
            ├── Issue Links (Self-referencing relationships)
            └── Issue Attachments (Metadata foundation)
```

---

## 2. Issue Numbering & Human-Readable Key Generation

Every issue possesses:
1. **Internal ULID**: 26-character globally unique primary key (e.g. `01m09nq7...`).
2. **Project-Scoped Sequential Issue Number**: Integer incrementing per project (`1`, `2`, `3`).
3. **Computed Key**: Exposed dynamically in API responses as `project.key + '-' + issue_number` (e.g., `WEB-101`).

### Race-Condition Protection Strategy
To ensure zero duplicate issue numbers under concurrent requests:
1. Issue creation is wrapped inside a database transaction (`DB::transaction`).
2. The parent `Project` row is locked using pessimistic locking (`lockForUpdate()`).
3. The next number is derived via `$max = Issue::where('project_id', $project->id)->withTrashed()->max('issue_number') ?: 0;`.
4. A database constraint `UNIQUE(project_id, issue_number)` serves as the final integrity safeguard.

---

## 3. Classifications, Statuses & Severities

- **Issue Types**: `bug`, `task`, `story`, `feature`, `improvement` (default: `task`).
- **Statuses**: `backlog`, `todo`, `in_progress`, `done` (default: `todo`).
- **Priorities**: `low`, `medium`, `high`, `urgent` (default: `medium`).
- **Severities**: `minor`, `major`, `critical`, `blocker` (default for bugs: `major`).

---

## 4. Multi-Tenant Isolation & Authorization

Server-side policy enforcement (`IssuePolicy`, `IssueCommentPolicy`, `LabelPolicy`) guarantees that:
- Users can only view or manipulate issues within organizations they belong to.
- Assignees and watchers must belong to the issue's organization.
- Labels and linked issues cannot cross organization boundaries.
- Cross-tenant requests return `403 Forbidden` or `422 Unprocessable Entity` validation errors.

---

## 5. API Endpoints Reference

### Issues
- `GET /api/v1/projects/{project}/issues`: Paginated list (default 25/page, max 100/page). Supports filtering by `type`, `status`, `priority`, `severity`, `assignee`, `reporter`, `label`, and keyword `search`.
- `POST /api/v1/projects/{project}/issues`: Create issue (reporter automatically set to authenticated user).
- `GET /api/v1/issues/{issue}`: Get issue details.
- `PATCH /api/v1/issues/{issue}`: Update issue properties.
- `DELETE /api/v1/issues/{issue}`: Soft-delete issue.
- `POST /api/v1/issues/{issue}/restore`: Restore soft-deleted issue.

### Supporting Features
- **Comments**: `GET/POST /api/v1/issues/{issue}/comments`, `PATCH/DELETE /api/v1/comments/{comment}`
- **Labels**: `GET/POST /api/v1/organizations/{organization}/labels`, `PATCH/DELETE /api/v1/labels/{label}`, `POST/DELETE /api/v1/issues/{issue}/labels/{label}`
- **Watchers**: `GET/POST /api/v1/issues/{issue}/watchers`, `DELETE /api/v1/issues/{issue}/watchers/{user}`
- **Links**: `GET/POST /api/v1/issues/{issue}/links`, `DELETE /api/v1/issue-links/{link}`
