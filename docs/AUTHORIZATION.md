# Taskora Multi-Tenant Authorization Documentation

## Server-Side Multi-Tenant Isolation

Authorization in Taskora is enforced strictly server-side through Laravel Policies and domain checks. No authorization decisions rely on client-side filtering.

---

## Policy Matrix

### Organization Policy (`OrganizationPolicy`)
- `view`: User must belong to organization (`$user->belongsToOrganization($org->id)`).
- `update`: User must be `organization_admin`.
- `manageMembers`: User must be `organization_admin`.
- `createTeam` / `createProject`: User must be `organization_admin` or `project_manager`.

### Team Policy (`TeamPolicy`)
- `view`: User must belong to team's organization.
- `update` / `manageMembers`: User must be `organization_admin`, `project_manager`, or creator of the team.
- `delete`: User must be `organization_admin`.

### Project Policy (`ProjectPolicy`)
- `view`: User must belong to organization AND (visibility is `organization` OR user is project member OR org admin).
- `update` / `manageMembers`: User must be `organization_admin` or project's `project_manager`.
- `delete`: User must be `organization_admin`.

---

## Tenant Isolation Verification Test

Multi-tenant isolation is verified by automated tests in `tests/Feature/TenantIsolationTest.php`, confirming that a user in Organization A attempting to read or modify resources in Organization B receives HTTP 403 Forbidden.
