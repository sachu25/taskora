# Milestone 07 — Notifications & Activity Management Walkthrough

## Overview

Milestone 07 establishes the backend domain foundation, database schema, REST API, policy security, event dispatchers, and dark glassmorphic React UI for **Notifications & Activity Management** in Taskora.

---

## Deliverables Completed

### 1. Database Schema & Models
- `database/migrations/2026_08_19_140001_create_notifications_table.php` (`notifications` table with ULID primary keys, tenant isolation, entity mapping, and read timestamps).
- `database/migrations/2026_08_19_140002_create_notification_preferences_table.php` (`notification_preferences` table with unique constraint on `[user_id, preference_key]`).
- Eloquent Models: `Notification.php`, `NotificationPreference.php`.

### 2. Domain Layer & Single-Purpose Actions
- `NotificationType.php`: Constant mapping for notification event types & preference categories.
- Domain Actions:
  - `CreateNotification`: Creates notifications if recipient category is enabled.
  - `MarkNotificationAsRead`: Marks notification read timestamp.
  - `MarkNotificationAsUnread`: Resets notification read timestamp to null.
  - `MarkAllNotificationsAsRead`: Bulk marks unread notifications as read.
  - `DeleteNotification`: Deletes single notification.
  - `DeleteAllReadNotifications`: Bulk purges read notifications.
  - `UpdateNotificationPreference`: Updates user preference setting.
  - `ResetNotificationPreferences`: Restores default preferences.
- Helper Service: `NotificationDispatcher`.

### 3. Integrated Domain Triggers
- Integrated `NotificationDispatcher` into:
  - `UpdateIssue`: Dispatches `ISSUE_ASSIGNED` and `ISSUE_STATUS_CHANGED`.
  - `AddIssueComment`: Dispatches `ISSUE_COMMENTED`.
  - `StartSprint`, `CompleteSprint`, `CancelSprint`: Dispatches `SPRINT_STARTED`, `SPRINT_COMPLETED`, `SPRINT_CANCELLED`.
  - `StartRelease`, `CompleteRelease`, `CancelRelease`: Dispatches `RELEASE_STARTED`, `RELEASE_COMPLETED`, `RELEASE_CANCELLED`.

### 4. REST Controllers & API Layer
- Controllers: `NotificationController`, `NotificationPreferenceController`, `ActivityController`.
- Policy: `NotificationPolicy`.
- Resources: `NotificationResource`, `NotificationPreferenceResource`, `ActivityResource`.
- Routes: Registered 13 REST API endpoints under `/api/v1` in `routes/api.php`.

### 5. Frontend React + TypeScript UI
- Types: `frontend/src/types/notification.ts`.
- Services: `notificationService.ts`, `activityService.ts`.
- Components:
  - `NotificationBell.tsx`: Topbar header component with unread counter badge and 30-second polling.
  - `NotificationDropdown.tsx`: Popover menu with recent notifications and quick actions.
  - `NotificationItem.tsx`: Custom formatted item with status icons and action URL navigation.
  - `NotificationPreferences.tsx`: Preference matrix toggles.
  - `ActivityFeed.tsx` & `ActivityItem.tsx`: Activity audit timeline.
- Pages:
  - `NotificationsPage.tsx` (`/notifications`)
  - `ActivityPage.tsx` (`/activity`)
  - `NotificationPreferencesPage.tsx` (`/settings/notification-preferences`)
- Navigation: Updated `AppRouter`, `Topbar`, and `Sidebar`.

---

## Verification & Quality Assurance Results

1. **Automated Backend Test Suite**:
   - Executed `php artisan test`: **99 passed (267 assertions)**.
   - Tested notification CRUD, unread count, bulk read/delete, preferences, activity feeds, and tenant isolation protection.

2. **Frontend Production Build**:
   - Executed `cmd /c npm run build`: **0 errors (✓ built in 918ms)**.

3. **Security Audits**:
   - Executed `cmd /c composer audit`: **No security vulnerability advisories found**.
   - Executed `cmd /c npm audit`: **found 0 vulnerabilities**.
