# Taskora Authentication Documentation

## Overview

Taskora uses **Laravel Sanctum** token-based authentication for stateful SPA and REST API access.

## Flow

1. **User Registration (`/api/v1/auth/register`)**:
   - Accepts `name`, `email`, `password`, `organization_name`.
   - Executes inside a database transaction:
     1. Creates user with bcrypt hashed password.
     2. Creates organization with unique slug.
     3. Creates `organization_members` entry with role `organization_admin`.
     4. Logs `user.registered` activity.
     5. Generates plain-text Sanctum token.

2. **User Login (`/api/v1/auth/login`)**:
   - Validates credentials and verifies account status is `active`.
   - Issues a new Sanctum token and returns user profile + organization array.

3. **Request Authentication**:
   - Client sends token in `Authorization: Bearer <token>` header.
   - Protected routes use `auth:sanctum` middleware.

4. **User Logout (`/api/v1/auth/logout`)**:
   - Revokes current access token.
