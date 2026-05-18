# API Conventions

## Base URL

/api/v1

---

## Naming

Use plural resources.

Good:
- /transactions
- /habits

Bad:
- /getTransactions

---

## Response Format

Success:

{
  "success": true,
  "data": {}
}

Error:

{
  "success": false,
  "message": ""
}

---

## Status Codes

200 → success
201 → created
400 → validation error
401 → unauthorized
404 → not found
500 → internal server error