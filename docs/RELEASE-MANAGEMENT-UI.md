# Taskora Release Management UI Documentation

## 1. Overview

Milestone 06B implements the complete React + Vite + TypeScript frontend interface for Taskora's **Release Management Subsystem**.

It connects to the Milestone 06 backend REST API without modifying any backend code or introducing parallel state engines.

Key features:
- **Project Release Overview**: Summary metric cards (`Total Releases`, `Planned`, `In Progress`, `Released`, `Cancelled`), debounced search (400ms), and status filter dropdown.
- **Responsive Layout**: Desktop tables and mobile card layouts across `ReleasesPage.tsx` and `ReleaseDetailsPage.tsx`.
- **Release Lifecycle State Machine**: Single-purpose lifecycle action triggers (`Start Release`, `Complete Release`, `Cancel Release`, `Edit`, `Delete`, `Restore`).
- **Release Manager Assignment**: Assign or remove release managers from the organization context.
- **Issue Association**: Search, attach, and detach project issues to releases with live progress calculation.
- **Async Safety**: `requestIdRef` guards to prevent race conditions during rapid search queries.
- **Role-Aware UI**: Controls reflect policy rules (`organization_admin`, `project_manager`, `developer`, `tester`, `reporter`).

---

## 2. Component Architecture

```
frontend/src/
├── types/
│   └── release.ts                    # Strict TypeScript interfaces & payload types
├── services/
│   └── releaseService.ts             # Centralized Axios API service for /api/v1/releases
├── components/releases/
│   ├── ReleaseStatusBadge.tsx        # Semantic color status badges (planned, in_progress, released, cancelled)
│   ├── ReleaseProgress.tsx           # Multi-segmented progress bar & percentage metrics
│   ├── ReleaseFormModal.tsx          # Accessible Modal for Creating / Updating Releases
│   ├── ReleaseManagerSelector.tsx    # Assign / Change / Remove Release Manager
│   ├── ReleaseIssueManager.tsx       # Search & attach project issues with debounced query
│   ├── ReleaseIssueTable.tsx         # Desktop Table & Mobile Cards for release issues
│   ├── ReleaseLifecycleActions.tsx   # Role-aware state machine controls
│   └── DeleteReleaseConfirmModal.tsx # Soft-delete confirmation modal
└── pages/releases/
    ├── ReleasesPage.tsx              # /projects/:projectId/releases
    └── ReleaseDetailsPage.tsx       # /projects/:projectId/releases/:releaseId
```

---

## 3. Routes & Integration

Registered protected routes in `frontend/src/app/router/index.tsx`:
- `/projects/:projectId/releases` -> `ReleasesPage.tsx`
- `/projects/:projectId/releases/:releaseId` -> `ReleaseDetailsPage.tsx`

Integrated in `ProjectDetailsPage.tsx` navigation header tabs.

---

## 4. API Service Methods (`releaseService.ts`)

| Service Method | HTTP Endpoint | Description |
|---|---|---|
| `getProjectReleases` | `GET /projects/{project}/releases` | Search, filter, paginate project releases |
| `createRelease` | `POST /projects/{project}/releases` | Create new release |
| `getRelease` | `GET /releases/{release}` | Fetch release details & count |
| `updateRelease` | `PATCH /releases/{release}` | Update metadata |
| `deleteRelease` | `DELETE /releases/{release}` | Soft delete release |
| `restoreRelease` | `POST /releases/{release}/restore` | Restore soft-deleted release |
| `startRelease` | `POST /releases/{release}/start` | Transition status to `in_progress` |
| `completeRelease` | `POST /releases/{release}/complete` | Transition status to `released` |
| `cancelRelease` | `POST /releases/{release}/cancel` | Transition status to `cancelled` |
| `getReleaseIssues` | `GET /releases/{release}/issues` | List attached issues |
| `addIssueToRelease` | `POST /releases/{release}/issues` | Attach issue to release |
| `removeIssueFromRelease` | `DELETE /releases/{release}/issues/{issue}` | Detach issue from release |
| `assignReleaseManager` | `POST /releases/{release}/manager` | Assign release manager |
| `removeReleaseManager` | `DELETE /releases/{release}/manager` | Unassign release manager |
