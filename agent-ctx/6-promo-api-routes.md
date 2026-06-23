# Task 6 - Promo Code Admin CRUD API Routes

## Work Log
- Read project worklog and existing API patterns (`/api/admin`, `/api/promo`, `/api/orders`)
- Created directory structure: `src/app/api/admin/promos/[id]/`
- Implemented `GET` + `POST` in `/src/app/api/admin/promos/route.ts`
- Implemented `GET` + `PUT` + `DELETE` in `/src/app/api/admin/promos/[id]/route.ts`
- All validation error messages in Spanish
- Lint passed with no errors
- Dev server compiled successfully

## API Endpoints

### `GET /api/admin/promos`
- Returns all promo codes ordered by `createdAt` desc
- Optional query param `?active=true` to filter active/inactive only

### `POST /api/admin/promos`
- Creates a new promo code
- Validates: code (required, uppercase, trimmed, min 3 chars, unique), type (PERCENTAGE|FIXED), value (positive int, ≤100 for percentage), minPurchase, maxUses, isActive, expiresAt (ISO date)
- Returns 409 on duplicate code
- Returns 201 on success

### `GET /api/admin/promos/[id]`
- Returns single promo code or 404

### `PUT /api/admin/promos/[id]`
- Partial update — only sends fields present in request body
- Re-validates changed fields (uniqueness, types, ranges)
- Returns 404 if not found, 409 on duplicate code, 400 if no fields provided

### `DELETE /api/admin/promos/[id]`
- Deletes promo code
- If `usedCount > 0`, includes a `warning` field in response but still deletes
- Returns 404 if not found