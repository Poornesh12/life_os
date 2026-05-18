# Authentication Flow

## Login Flow

1. User logs in
2. Backend validates credentials
3. Access token returned
4. Refresh token returned

---

## JWT Strategy

- Short-lived access token
- Long-lived refresh token

---

## Protected Routes

Frontend stores:
- access token
- refresh token

Backend validates JWT using middleware.