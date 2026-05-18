# Backend Guidelines

## General Rules

- Use async everywhere
- Use type hints
- Use dependency injection
- Use Pydantic schemas
- Keep routes thin

---

## Naming Conventions

### Files
snake_case.py

### Classes
PascalCase

### Variables
snake_case

---

## Services

Services contain:
- business logic
- validation
- orchestration

Services should NOT:
- contain route logic
- contain HTTP logic

---

## Repository Layer

Repositories should only:
- interact with MongoDB
- return database objects

No business logic in repositories.

---

## Error Handling

Use centralized exceptions.

Avoid generic Exception usage.

---

## API Standards

All APIs should:
- return proper status codes
- use response schemas
- validate inputs