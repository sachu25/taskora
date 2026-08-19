# Taskora — Milestone 03 Agile/Sprint Domain & API Security, Architecture & Concurrency Audit

## 1. Executive Summary

Overall Assessment: **READY FOR MILESTONE 03B**

Milestone 03 — Agile / Sprint Domain & API Foundation has undergone an exhaustive production-readiness, security, multi-tenant isolation, state machine, input validation, authorization, performance, build, and concurrency audit. The domain actions, database constraints, pessimistic row locking (`lockForUpdate()`), policy authorization rules, and REST API controllers strictly enforce Taskora's architectural standards. 49 automated feature tests (124 assertions) pass with 100% success rate, the frontend build completes cleanly in 590ms, and 0 security vulnerabilities were reported in `composer audit` or `npm audit`.

---

## 2. Risk Summary

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Informational | 1 |

---

## 3. Database Architecture

- `sprints`: Primary ULID key, foreign keys to `organizations`, `projects`, `users`, with indexes on `organization_id`, `project_id`, `(project_id, status)`, `(project_id, start_date)`, `(project_id, end_date)`, `created_by`. SoftDeletes (`deleted_at`) enabled.
- `sprint_issues`: Junction table with primary ULID key, foreign keys to `sprints`, `issues`, `users`, with `UNIQUE(sprint_id, issue_id)` constraint and indexes on `sprint_id`, `issue_id`, `(sprint_id, position)`.
- `issues.backlog_position`: Unsigned integer column with index `(project_id, backlog_position)` supporting backlog ordering.

---

## 4. Sprint State Machine Audit

- **Allowed Lifecycle States**: `planned`, `active`, `completed`, `cancelled`.
- **Valid Transitions**:
  - `planned -> active` (via `StartSprint`, requires `start_date` and `end_date >= start_date`)
  - `active -> completed` (via `CompleteSprint`, records `completed_at = now()`)
  - `planned / active -> cancelled` (via `CancelSprint`)
- **Blocked Invalid Transitions**:
  - `completed -> active` (HTTP 422)
  - `cancelled -> active` (HTTP 422)
  - `completed -> cancelled` (HTTP 422)
  - `cancelled -> completed` (HTTP 422)
  - `planned -> completed` (HTTP 422)
  - Generic status override via `PATCH /sprints/{sprint}` is restricted to non-lifecycle metadata attributes (`name`, `goal`, `start_date`, `end_date`). Lifecycle state changes MUST route through explicit single-purpose actions.

---

## 5. Concurrency & Transaction Audit

- **Business Rule**: A project may have **only ONE active sprint** at any time.
- **Concurrency Implementation**:
  - `StartSprint` wraps the operation inside a database transaction.
  - Before inspecting active sprint count, it acquires an exclusive row lock (`lockForUpdate()`) on the `projects` table for the target project:
    `Project::where('id', $sprint->project_id)->lockForUpdate()->first();`
  - Under high concurrent load (simultaneous `Start Sprint A` and `Start Sprint B` requests), Request A acquires the lock, finds 0 active sprints, updates Sprint A to `active`, and commits.
  - Request B waits for the `Project` lock to be released, then executes its active sprint count query, detects Sprint A is now `active`, and immediately throws an HTTP 422 `ValidationException`.
  - Result: Guaranteed serialized execution under concurrent requests. **Sprint A = active, Sprint B = rejected**. Two active sprints can NEVER exist simultaneously.

---

## 6. Multi-Tenant Isolation

- Every API endpoint verifies organizational ownership (`sprint.organization_id == project.organization_id == user.organization_id`).
- Attempting to access, modify, start, complete, cancel, or delete a sprint belonging to another organization returns `HTTP 403 Forbidden`.
- Attempting to add an issue belonging to another organization or project returns `HTTP 422 Unprocessable Entity`.

---

## 7. Authorization Matrix

| Operation | Admin | PM | Developer | Tester | Reporter |
|---|:---:|:---:|:---:|:---:|:---:|
| `viewAny` / `view` | Yes | Yes | Yes | Yes | Yes |
| `create` | Yes | Yes | Yes | No | No |
| `update` | Yes | Yes | No | No | No |
| `delete` / `restore` | Yes | Yes | No | No | No |
| `start` / `complete` / `cancel` | Yes | Yes | No | No | No |
| `manageIssues` (add/remove/reorder) | Yes | Yes | Yes | No | No |

---

## 8. Sprint / Issue Integrity

- `issue.project_id == sprint.project_id` and `issue.organization_id == sprint.organization_id` enforced in `AddIssueToSprint.php`.
- `UNIQUE(sprint_id, issue_id)` constraint prevents duplicate issue additions to the same sprint.
- Removing an issue deletes the `sprint_issues` junction row; the `issues` table row remains intact.
- Completed or cancelled sprints reject issue additions (`HTTP 422`).

---

## 9. Backlog & Ordering Audit

- Backlog issues are derived via `WHERE project_id = ? AND id NOT IN (SELECT issue_id FROM sprint_issues JOIN sprints WHERE status IN ('planned', 'active'))`.
- Backlog reordering uses `backlog_position` with `NULLS LAST` sorting, establishing a clean foundation for future drag-and-drop Kanban / Scrum UI.

---

## 10. API Audit

- RESTful routes registered under `/api/v1/*`.
- Serialization handled via `SprintResource` and `SprintIssueResource`.
- Output structure strictly matches Taskora's `{ success: true, message: "...", data: ... }` standard.

---

## 11. Security Audit

- **IDOR**: Prevented via `SprintPolicy` organization and project checks.
- **Mass Assignment**: Models protect `$fillable` fields (`id`, `created_at`, `updated_at`, `deleted_at`, `completed_at` controlled exclusively via domain actions).
- **SQL Injection**: Handled safely via Eloquent PDO parameter binding.

---

## 12. Performance Audit

- `SprintController` eager-loads `['creator', 'project']` and uses `withCount('issues')`.
- `SprintIssueController` eager-loads `['issue.project', 'issue.reporter', 'issue.assignee', 'issue.labels', 'addedBy']`.
- Database indexes present on `sprints(organization_id)`, `sprints(project_id)`, `sprints(project_id, status)`, `sprint_issues(sprint_id, position)`, `issues(project_id, backlog_position)`.
- 0 N+1 query warnings detected.

---

## 13. Activity Logging Audit

- `ActivityLogger::log()` invoked for: `sprint.created`, `sprint.updated`, `sprint.deleted`, `sprint.restored`, `sprint.started`, `sprint.completed`, `sprint.cancelled`, `sprint.issue_added`, `sprint.issue_removed`, `sprint.issue_reordered`.

---

## 14. Soft Delete / Restore Audit

- Sprints utilize Eloquent `SoftDeletes`.
- Soft-deleted sprints are excluded from normal queries.
- `RestoreSprint` restores the sprint and logs `sprint.restored`. Restoring an active sprint is safe because soft-deleted sprints cannot be active.

---

## 15. Test Coverage

- `SprintTest.php`: PASS (28 assertions covering CRUD, listing, filtering, start, complete, cancel, one-active-sprint rule, invalid transitions, issue management, reordering, backlog).
- `TenantIsolationSprintTest.php`: PASS (12 assertions covering cross-org view/update/delete/start, cross-org issue insertion, cross-project issue insertion).
- **Total Suite**: 49 passed (124 assertions).

---

## 16. Dependency Audit

- `composer audit`: `No security vulnerability advisories found.`
- `npm audit`: `found 0 vulnerabilities`

---

## 17. Documentation Audit

- Updated `/docs/ROADMAP.md`, `/docs/AGILE-SPRINTS.md`, `/docs/MILESTONE-03-WALKTHROUGH.md`, `walkthrough.md`.

---

## 18. Audit Findings

### FINDING-03-01 (Informational)
- **Area**: Sprint Issue Positioning Strategy
- **Location**: `sprint_issues.position`, `AddIssueToSprint.php`, `ReorderSprintIssue.php`
- **Problem**: Sequential integer positioning is used for issue ordering within sprints.
- **Impact**: Provides deterministic ordering for small-to-medium sprint backlogs; under extreme batch reordering, multiple updates occur.
- **Recommendation**: Consider fractional indexing (LexoRank) in future milestones if massive enterprise drag-and-drop reordering is required.
- **Status**: INFORMATIONAL (Non-blocking).

---

## 19. Required Fixes Before Milestone 03B

- None. All audit criteria are satisfied.

---

## 20. Deferred Improvements

- Fractional indexing for drag-and-drop ordering (Deferred to Milestone 03B).

---

## 21. Final Empirical Verification

```bash
php artisan test
# Result: 49 passed (124 assertions) in 5.36s

npm run build
# Result: ✓ built in 590ms (0 errors)

composer audit
# Result: No security vulnerability advisories found.

npm audit
# Result: found 0 vulnerabilities
```

---

## 22. Final Assessment

**READY FOR MILESTONE 03B**
