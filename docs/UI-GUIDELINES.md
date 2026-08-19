# Taskora UI / UX Design Guidelines

## Overview

Taskora provides a modern, dark-mode-first, glassmorphic user experience inspired by Linear, Notion, and contemporary SaaS applications.

---

## Design System & Palette

- **Background Primary**: `#0f172a` (Slate 950)
- **Background Secondary**: `#1e293b` (Slate 900)
- **Card Background**: `rgba(30, 41, 59, 0.6)` with backdrop blur
- **Accent Primary**: `#6366f1` (Indigo 500/600)
- **Borders**: `#334155` (Slate 700)
- **Typography**: Inter / system UI font stack

---

## Component System Rules

1. **State Handling**: Every screen handles `Loading` (skeletons), `Success`, `Empty` (reusable EmptyState component), and `Error`.
2. **Reusability**: Core components (`Button`, `Input`, `Card`, `Modal`, `Badge`, `Skeleton`, `EmptyState`) live in `components/ui/`.
3. **Responsive Design**: Mobile viewport uses a slide-out navigation drawer triggered via topbar hamburger icon.
