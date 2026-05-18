# Database Design

## Collections

### users
Stores authentication and profile data.

### transactions
Stores user income and expense entries.

### habits
Stores user-created habits.

### habit_logs
Stores habit completion records.

---

## Relationships

users → transactions
users → habits
habits → habit_logs

---

## Important Rules

- Every document must contain user_id
- Use ObjectId references
- created_at and updated_at required