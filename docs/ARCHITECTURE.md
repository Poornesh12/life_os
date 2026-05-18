# Architecture Guidelines

## Backend Architecture

The backend uses modular domain architecture.

Each module contains:
- api
- schemas
- models
- services
- repository
- utils

---

## Request Flow

Route
→ Service
→ Repository
→ Database

---

## Rules

- Routes should contain minimal logic
- Business logic belongs in services
- Database logic belongs in repository layer
- Services must not directly access MongoDB
- Shared utilities belong in shared/

---

## Frontend Architecture

Frontend uses feature-based architecture.

Each feature contains:
- api
- hooks
- components
- pages
- store
- types