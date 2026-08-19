# Taskora — Kanban Board & Active Sprint Execution UI

## 1. Overview

Milestone 04 introduces Taskora's **Kanban Board and Active Sprint Execution Workspace**. It provides an interactive 4-column visual board (`Backlog`, `Todo`, `In Progress`, `Done`) that allows authorized team members to execute active sprints by moving issues across workflow states.

---

## 2. Architecture & Components

```text
frontend/src/
├── components/kanban/
│   ├── KanbanBoard.tsx           # Main board grid & drag-and-drop handler
│   ├── KanbanColumn.tsx          # Status column container & drop zones
│   ├── KanbanIssueCard.tsx       # Compact draggable card with accessible controls
│   └── KanbanToolbar.tsx         # Search, priority/type filter bar, refresh
├── pages/kanban/
│   └── KanbanBoardPage.tsx       # Active sprint execution workspace page controller
```

---

## 3. Key Technical Strategies

### HTML5 Drag and Drop & Accessibility
- Native HTML5 Drag and Drop (`onDragStart`, `onDragOver`, `onDrop`) handles visual issue movement across status columns.
- Explicit keyboard status move buttons (**Move Left**, **Move Right**, **Move Up**, **Move Down**) are provided on every card to ensure 100% keyboard accessibility.

### Optimistic UI & Rollback
- Issue status updates update local state instantly for zero-latency feedback.
- If the backend returns `HTTP 403`, `HTTP 422`, or a network error, local state automatically rolls back to its prior state and presents a user-friendly alert banner (`ActionError`).

### Read-Only Presentation for Non-Active Sprints
- `planned`, `completed`, and `cancelled` sprints display an informational read-only banner and disable status mutations.

---

## 4. Verification Results

- `php artisan test`: `49 passed (124 assertions)` (100% pass rate).
- `npm run build`: `✓ built in 641ms` (0 errors).
- `composer audit`: `0 security vulnerabilities`.
- `npm audit`: `0 vulnerabilities`.
