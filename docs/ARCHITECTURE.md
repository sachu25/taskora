# Taskora Architecture Documentation

## Overview

Taskora is an API-first, multi-tenant SaaS application built for Agile project management, bug tracking, and product delivery.

Milestone 01 establishes the application foundation covering multi-tenancy, authentication, user management, organization memberships, teams, projects, centralized activity logging, and a responsive React TypeScript SPA.

---

## Technical Stack

- **Backend**: Laravel 12, PHP 8.2+, Sanctum, PostgreSQL / MySQL / SQLite support.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, React Router v6.
- **API Design**: RESTful API routed under `/api/v1` returning standardized JSON structures.
- **Identifier Strategy**: Consistent ULID primary keys across all domain models.

---

## Architectural Principles

1. **API-First Design**: Separation of business logic into server-side Action classes and Policies.
2. **Multi-Tenancy Isolation**: Strict server-side verification ensuring data belonging to Organization A cannot be accessed or modified by Organization B users.
3. **Thin Controllers**: Controllers validate requests, authorize via Policies, invoke domain actions, and return formatted API resources.
4. **Single-Purpose Action Layer**: Isolated classes (`CreateOrganization`, `CreateProject`, `AddTeamMember`, etc.) performing transactional mutations and logging activity via `ActivityLogger`.
