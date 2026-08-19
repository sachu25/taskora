# Taskora API Reference Documentation (`/api/v1`)

All API responses follow a unified response structure.

## Standard Response Structure

### Success Response Example (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "01J5X31G4B7C5K2D9E8F1A2B3C",
    "organization_id": "01J5X29A8B7C5K2D9E8F1A2B3C",
    "name": "Website Revamp",
    "key": "WEB",
    "status": "active",
    "visibility": "organization"
  }
}
```

### Error Response Example (HTTP 422 / 403 / 401)
```json
{
  "success": false,
  "message": "The project key has already been taken in this organization.",
  "errors": {
    "key": ["The project key has already been taken in this organization."]
  }
}
```

---

## Authentication Endpoints

- `POST /api/v1/auth/register` — Register user & organization
- `POST /api/v1/auth/login` — Authenticate and issue Sanctum token
- `POST /api/v1/auth/logout` — Revoke token
- `GET /api/v1/auth/me` — Retrieve profile & organization memberships
- `POST /api/v1/auth/forgot-password` — Password reset request foundation
- `POST /api/v1/auth/reset-password` — Reset password foundation

---

## Organization Endpoints

- `GET /api/v1/organizations` — List user's organizations
- `POST /api/v1/organizations` — Create organization
- `GET /api/v1/organizations/{organization}` — Organization details
- `PATCH /api/v1/organizations/{organization}` — Update organization
- `GET /api/v1/organizations/{organization}/dashboard` — Foundation metrics
- `GET /api/v1/organizations/{organization}/members` — Organization members
- `POST /api/v1/organizations/{organization}/members` — Add member
- `DELETE /api/v1/organizations/{organization}/members/{user}` — Remove member

---

## Team Endpoints

- `GET /api/v1/organizations/{organization}/teams` — List teams
- `POST /api/v1/organizations/{organization}/teams` — Create team
- `GET /api/v1/teams/{team}` — Team details
- `PATCH /api/v1/teams/{team}` — Update team
- `DELETE /api/v1/teams/{team}` — Delete team
- `GET /api/v1/teams/{team}/members` — Team members
- `POST /api/v1/teams/{team}/members` — Add member to team
- `DELETE /api/v1/teams/{team}/members/{user}` — Remove member from team

---

## Project Endpoints

- `GET /api/v1/organizations/{organization}/projects` — List projects
- `POST /api/v1/organizations/{organization}/projects` — Create project
- `GET /api/v1/projects/{project}` — Project details
- `PATCH /api/v1/projects/{project}` — Update project
- `DELETE /api/v1/projects/{project}` — Delete project
- `GET /api/v1/projects/{project}/members` — Project members
- `POST /api/v1/projects/{project}/members` — Add member to project
- `DELETE /api/v1/projects/{project}/members/{user}` — Remove member from project
