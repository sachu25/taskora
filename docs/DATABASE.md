# Taskora Database Documentation

## Primary Key Strategy: ULID

Taskora uses 26-character **ULIDs (Universally Unique Lexicographically Sortable Identifiers)** for all primary keys. ULIDs provide non-sequential security, lexicographical sorting, and native support across Laravel models.

---

## Core Entities & Relationships

### `organizations`
- `id` (ULID, PK)
- `name` (string)
- `slug` (string, UNIQUE)
- `logo` (string, nullable)
- `description` (text, nullable)
- `timezone` (string, default 'UTC')
- `status` (string, default 'active')
- `created_at`, `updated_at`

### `users`
- `id` (ULID, PK)
- `name` (string)
- `email` (string, UNIQUE)
- `password` (string, hashed)
- `avatar` (string, nullable)
- `timezone` (string, default 'UTC')
- `locale` (string, default 'en')
- `status` (string, default 'active')
- `email_verified_at` (timestamp, nullable)
- `remember_token` (string, nullable)
- `created_at`, `updated_at`

### `organization_members`
- `id` (ULID, PK)
- `organization_id` (FK -> organizations.id, CASCADE)
- `user_id` (FK -> users.id, CASCADE)
- `role` (enum: `organization_admin`, `project_manager`, `developer`, `tester`, `reporter`)
- `status` (string, default 'active')
- `joined_at` (timestamp, nullable)
- `created_at`, `updated_at`
- Unique Index: `(organization_id, user_id)`

### `teams`
- `id` (ULID, PK)
- `organization_id` (FK -> organizations.id, CASCADE)
- `name` (string)
- `slug` (string)
- `description` (text, nullable)
- `created_by` (FK -> users.id, SET NULL, nullable)
- `created_at`, `updated_at`
- Unique Index: `(organization_id, slug)`

### `team_members`
- `id` (ULID, PK)
- `team_id` (FK -> teams.id, CASCADE)
- `user_id` (FK -> users.id, CASCADE)
- `created_at`, `updated_at`
- Unique Index: `(team_id, user_id)`

### `projects`
- `id` (ULID, PK)
- `organization_id` (FK -> organizations.id, CASCADE)
- `name` (string)
- `key` (string, uppercase shortcode like `WEB`, `CRM`, `MOB`)
- `slug` (string)
- `description` (text, nullable)
- `status` (enum: `planned`, `active`, `on_hold`, `completed`, `archived`)
- `visibility` (enum: `private`, `organization`)
- `start_date` (date, nullable)
- `target_date` (date, nullable)
- `created_by` (FK -> users.id, SET NULL, nullable)
- `created_at`, `updated_at`
- Unique Indexes: `(organization_id, key)` & `(organization_id, slug)`

### `project_members`
- `id` (ULID, PK)
- `project_id` (FK -> projects.id, CASCADE)
- `user_id` (FK -> users.id, CASCADE)
- `role` (enum: `project_manager`, `developer`, `tester`, `reporter`, `viewer`)
- `created_at`, `updated_at`
- Unique Index: `(project_id, user_id)`

### `activity_logs`
- `id` (ULID, PK)
- `organization_id` (FK -> organizations.id, CASCADE)
- `user_id` (FK -> users.id, SET NULL, nullable)
- `action` (string)
- `subject_type` (string, nullable)
- `subject_id` (string, nullable)
- `description` (text)
- `metadata` (json, nullable)
- `created_at` (timestamp)

### `releases`
- `id` (ULID, PK)
- `organization_id` (FK -> organizations.id, CASCADE)
- `project_id` (FK -> projects.id, CASCADE)
- `name` (string)
- `version` (string)
- `description` (text, nullable)
- `status` (enum: `planned`, `in_progress`, `released`, `cancelled`, default `planned`)
- `start_date` (date, nullable)
- `release_date` (date, nullable)
- `released_at` (timestamp, nullable)
- `created_by` (FK -> users.id, CASCADE)
- `release_manager_id` (FK -> users.id, SET NULL, nullable)
- `created_at`, `updated_at`, `deleted_at`
- Unique Index: `(project_id, version, deleted_at)`

### `release_issues`
- `id` (ULID, PK)
- `release_id` (FK -> releases.id, CASCADE)
- `issue_id` (FK -> issues.id, CASCADE)
- `added_by` (FK -> users.id, CASCADE)
- `created_at` (timestamp)
- Unique Index: `(release_id, issue_id)`

