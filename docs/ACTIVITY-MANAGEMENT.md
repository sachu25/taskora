# Taskora — Activity Management Architecture & API Documentation

## 1. Executive Summary

The **Activity Management Subsystem** provides Taskora with an append-only audit trail for all domain events across organizations, projects, issues, sprints, and releases.

---

## 2. Key Architecture Principles

1. **Centralized Logging via `ActivityLogger`**:
   - Single point of entry for writing audit trail records across all domain actions.
   - Activity logs capture `organization_id`, `user_id`, `action`, `subject_type`, `subject_id`, `description`, and `metadata`.
2. **Append-Only Immutable Design**:
   - Activity records are historical audit trails and cannot be edited or deleted via API endpoints.
3. **Multi-Tenant Context Scoping**:
   - Organization feed returns activity scoped to active tenant organization.
   - Entity-specific feeds validate user membership in the target project/organization before returning activity logs.

---

## 3. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/activity` | Paginated organization activity feed |
| `GET` | `/api/v1/projects/{project}/activity` | Paginated project activity feed |
| `GET` | `/api/v1/issues/{issue}/activity` | Paginated issue activity feed |
| `GET` | `/api/v1/sprints/{sprint}/activity` | Paginated sprint activity feed |
| `GET` | `/api/v1/releases/{release}/activity` | Paginated release activity feed |
