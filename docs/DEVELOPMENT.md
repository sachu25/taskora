# Taskora Development Guide

## Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 18+ & npm
- PostgreSQL / MySQL / SQLite database engine
- Redis (optional/cache)

---

## Local Setup

### 1. Backend Setup

```bash
# Install PHP dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Run Database Migrations & Seeders
php artisan migrate:fresh --seed

# Start Backend API Server
php artisan serve
# Server runs on http://127.0.0.1:8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
# Dev server runs on http://localhost:5173
```

---

## Testing & Quality Checks

```bash
# Run PHPUnit / Pest Backend Tests
php artisan test

# Run Frontend Type Checking & Production Build
cd frontend
npm run build
```

---

## Default Seed Credentials

- **Admin User**: `admin@taskora.io` / `password`
- **Project Manager**: `pm@taskora.io` / `password`
- **Developer**: `dev@taskora.io` / `password`
- **Tester**: `tester@taskora.io` / `password`
- **Reporter**: `reporter@taskora.io` / `password`
