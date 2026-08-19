# Taskora — Sprint Management, Product Backlog & Sprint Planning UI

## Overview

Milestone 03B implements the frontend user interface for Taskora's **Sprint Management, Product Backlog, Sprint Planning Workspace, and Active Sprint Overview** using the Milestone 03 REST APIs.

---

## 1. UI Architecture & Components

```text
src/
├── types/
│   └── sprint.ts                       # Strongly typed domain & API interfaces
├── services/
│   └── sprintService.ts                # Centralized Axios API service wrapper
├── components/sprints/
│   ├── SprintStatusBadge.tsx           # Semantic badges (planned, active, completed, cancelled)
│   ├── SprintProgress.tsx              # Completion bar & metrics summary
│   ├── SprintSelector.tsx              # Active/Planned sprint dropdown
│   └── SprintFormModal.tsx             # Create & Edit Sprint modal dialog
├── pages/
│   ├── sprints/
│   │   ├── SprintsPage.tsx             # Project Sprint Management overview
│   │   └── SprintDetailsPage.tsx       # Sprint details & issue breakdown
│   ├── backlog/
│   │   └── BacklogPage.tsx             # Product Backlog view & debounced filtering
│   └── sprint-planning/
│       └── SprintPlanningPage.tsx      # Split-pane Sprint Planning workspace
```

---

## 2. Protected Routes

- `/projects/:projectId/sprints`: Project Sprints overview
- `/projects/:projectId/sprints/:sprintId`: Sprint Details
- `/projects/:projectId/backlog`: Product Backlog page
- `/projects/:projectId/sprint-planning`: Split-pane Sprint Planning workspace

---

## 3. Sprint Planning Workspace (`SprintPlanningPage.tsx`)

- **Left Pane (Product Backlog)**: Shows unscheduled issues in the project with search filtering and an **"Add to Sprint"** action.
- **Right Pane (Sprint Backlog)**: Allows selecting a sprint, viewing current issue positions, reordering issues (`Move Up`, `Move Down`), or removing issues from the sprint.
- **Race Condition Safety**: Uses counter-based request tracking (`requestIdRef`) during debounced search.

---

## 4. Empirical Verification Results

- **Frontend Production Build (`npm run build`)**: `✓ built in 886ms` (0 TypeScript / Vite compilation errors).
- **Backend Test Suite (`php artisan test`)**: `49 passed (124 assertions)` (100% pass rate).
- **Security Audits**: `0 vulnerabilities found` across composer and npm packages.
