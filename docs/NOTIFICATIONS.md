# Taskora — Notifications Subsystem Architecture & API Documentation

## 1. Executive Summary

The **Notifications Subsystem** provides Taskora users with automated, event-driven in-app notifications. It ensures users receive real-time visibility into issue assignments, comments, workflow status changes, sprint lifecycle transitions, release published states, and QA test execution failures.

---

## 2. Architecture & Design Principles

1. **Server-Side Event Generation**:
   - Notifications are constructed server-side inside single-purpose Domain Actions via `NotificationDispatcher`.
   - Notifications are generated only for authorized users who have access to the target entity and organization.
2. **User Preference Controls**:
   - Every user maintains category-level preference toggles stored in `notification_preferences`.
   - `CreateNotification` domain action checks preferences before writing records.
3. **Multi-Tenant Isolation**:
   - All notifications include `organization_id` and `user_id`.
   - API queries strictly scope results by authenticated user and active organization context.
4. **Soft / Hard Lifecycle Rules**:
   - Notifications can be marked read/unread individually or in bulk.
   - Read notifications can be purged using bulk deletion endpoints.

---

## 3. Supported Notification Event Types

| Type Constant | Category | Trigger Event |
| :--- | :--- | :--- |
| `issue.assigned` | Issue | User is assigned to an issue |
| `issue.commented` | Issue | A comment is added to a watched or reported issue |
| `issue.status_changed` | Issue | Issue workflow status updates |
| `issue.mentioned` | Issue | User is @mentioned in issue description/comment |
| `issue.watched` | Issue | Update on an issue user is watching |
| `sprint.started` | Sprint | Sprint enters active state |
| `sprint.completed` | Sprint | Sprint is completed |
| `sprint.cancelled` | Sprint | Sprint is cancelled |
| `release.started` | Release | Release status changes to in progress |
| `release.completed` | Release | Release status changes to published |
| `release.cancelled` | Release | Release status changes to cancelled |
| `qa.execution_failed` | QA | Test case execution fails in run |
| `qa.execution_completed` | QA | Test run completes |

---

## 4. REST API Endpoints

All endpoints require Sanctum Bearer authentication and `X-Organization-Id` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Paginated list of notifications for authenticated user |
| `GET` | `/api/v1/notifications/unread-count` | Returns integer unread notification count |
| `GET` | `/api/v1/notifications/{id}` | Get single notification details |
| `POST` | `/api/v1/notifications/{id}/read` | Mark single notification as read |
| `POST` | `/api/v1/notifications/{id}/unread` | Mark single notification as unread |
| `POST` | `/api/v1/notifications/read-all` | Mark all notifications as read |
| `DELETE` | `/api/v1/notifications/{id}` | Delete single notification |
| `DELETE` | `/api/v1/notifications/read` | Delete all read notifications |
| `GET` | `/api/v1/notification-preferences` | List user notification preferences |
| `PATCH` | `/api/v1/notification-preferences/{key}` | Enable/disable specific notification preference |
| `POST` | `/api/v1/notification-preferences/reset` | Reset preferences to defaults |
