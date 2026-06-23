# Task 7 - AdminPromos Component

## Agent: Main Agent

## Work Log
- Read worklog.md, AdminProducts.tsx, AdminProductForm.tsx, AdminDashboard.tsx to understand existing patterns
- Read prisma/schema.prisma to confirm PromoCode model exists (code, type, value, minPurchase, maxUses, usedCount, isActive, expiresAt)
- Read src/types/index.ts - no PromoCode type existed yet
- Read src/stores/useNavigationStore.ts to understand navigation API
- Read src/app/page.tsx to understand view routing

### Changes Made:

1. **`src/types/index.ts`** — Added `PromoCode` interface and `"admin-promos"` to `AppView` union type
2. **`src/app/page.tsx`** — Added lazy import for `AdminPromos` and wired it into the view router
3. **`src/components/admin/AdminPromos.tsx`** — Created complete component (new file, ~430 lines)

### AdminPromos.tsx Features:

**List View (default):**
- Header with "GESTIÓN DE PROMOCIONES" title + promo count
- Back button (→ admin-dashboard) using useNavigationStore
- "CREAR NUEVO CUPÓN" button switches to form view
- Search/filter by code (case-insensitive)
- Table with responsive columns (hide on smaller screens): Código, Tipo, Valor, Mínimo Compra, Usos, Estado, Expiración, Acciones
- Status badges: Activo (green), Inactivo (gray), Expirado (red) — auto-detected from expiresAt
- Actions: Toggle active/inactive (Power/PowerOff icons), Edit (Pencil), Delete (Trash2 with AlertDialog)
- Loading skeletons matching table structure
- Empty state with Tag icon, contextual messages
- Values formatted: percentages show "15%", fixed show "$20,000 COP"
- Dates formatted in es-CO locale (español Colombia)
- Uses display: "5 / 100" or "5 / ∞" for unlimited
- framer-motion row animations

**Form View (internal state toggle):**
- Back button returns to list
- Title: "NUEVO CUPÓN" or "EDITAR CUPÓN"
- Fields: Código (auto-uppercase, trim), Tipo (PORCENTAJE/VALOR FIJO select), Valor (number with %/COP label), Compra mínima (optional COP), Usos máximos (optional), ¿Activo? (switch with red-600), Fecha de expiración (date input)
- Form validation in Spanish: required code (min 3 chars, alphanumeric only), value > 0, percentage ≤ 100
- Submit calls POST/PUT /api/admin/promos
- Cancel returns to list
- Loading spinner during submit

**Dark Theme (matching existing patterns):**
- bg-black page, bg-[#0a0a0a] cards, bg-[#1a1a1a] inputs
- text-white headings, text-neutral-400/500 secondary
- red-600/red-500 accents
- border-[#1a1a1a] / border-[#262626]
- All inputs rounded-none (sharp corners)
- shadcn/ui components: Button, Input, Label, Select, Switch, Table, Badge, AlertDialog, Skeleton
- framer-motion animations, sonner toasts, lucide-react icons

### Verification:
- ESLint passes with zero errors
- Dev server compiles successfully