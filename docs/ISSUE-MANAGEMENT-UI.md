# Taskora — Issue Management UI Architecture & Specification

## Overview

Milestone 02B introduces the frontend user experience for Taskora's **Issue Management**, interfacing directly with the Milestone 02 backend REST API (`/api/v1/*`).

---

## 1. Information Architecture & Routing

```text
/issues
  └── Global Issue Navigator (project selector & workspace issue overview)

/projects/:projectId/issues
  └── Project Issues Page (Header, Filter Bar, Desktop Table / Mobile Cards, Server Pagination, Create Modal)

/projects/:projectId/issues/:issueId
  └── Issue Details Page (Breadcrumbs, Header, Quick Inline Controls, 2-Column Grid, Comments, Labels, Links, Hierarchy)
```

---

## 2. Component Structure (`src/components/issues/`)

- **`IssueTypeBadge.tsx`**: Visual badge with icon & theme colors for `bug`, `task`, `story`, `feature`, `improvement`.
- **`IssueStatusBadge.tsx`**: Status pill for `backlog`, `todo`, `in_progress`, `done`.
- **`IssuePriorityBadge.tsx`**: Priority badge for `low`, `medium`, `high`, `urgent`.
- **`IssueSeverityBadge.tsx`**: Severity badge for `minor`, `major`, `critical`, `blocker`.
- **`IssueFilterBar.tsx`**: Debounced search input (400ms), select dropdowns for Type, Status, Priority, Severity, Assignee, Label, Clear Filters button.
- **`IssueTable.tsx`**: Desktop table & mobile card list representation with key (`WEB-101`), title, badges, assignee avatar, and activity counts.
- **`IssueFormModal.tsx`**: Accessible dialog for Create & Edit Issue with validation.
- **`IssueComments.tsx`**: Chronological comment list, rich text input, edit/delete controls.
- **`IssueLabelsManager.tsx`**: Interactive label badges with attach/detach dropdown.
- **`IssueWatchersToggle.tsx`**: Watch/unwatch button & watcher count display.
- **`LinkIssueModal.tsx`**: Searchable issue picker & relationship selector (`blocks`, `relates_to`).
- **`DeleteIssueConfirmModal.tsx`**: Modal confirmation before soft-deleting issue.

---

## 3. TypeScript Domain Types & API Service

Centralized in [`src/types/issue.ts`](file:///c:/wamp64/www/Taskora/frontend/src/types/issue.ts) and [`src/services/issueService.ts`](file:///c:/wamp64/www/Taskora/frontend/src/services/issueService.ts).
- Strictly typed interfaces for `Issue`, `IssueComment`, `Label`, `IssueWatcher`, `IssueLink`, `IssueAttachment`, `PaginatedIssuesResponse`, `IssueFilterParams`.
- Centralized Axios API service handling `/api/v1/*` requests.

---

## 4. Responsive & Accessibility Features

- **Desktop**: Full 2-column details view and multi-column issue table.
- **Mobile**: Collapsible mobile sidebar, stacked issue cards, touch-friendly filter controls, full-width forms.
- **Keyboard & Screen Reader Accessibility**: Semantic buttons, focus management, visible focus rings, dialog modal focus traps.
