# Task 8c - AdminOrders Management Page

## Agent: Main Agent
## Status: Completed

### Files Created:
1. **`/src/app/api/admin/orders/route.ts`** — GET endpoint for listing all orders with user info, items (including product variant + product title + primary image), and item count. Supports `?status=PENDING` query filter. Ordered by `createdAt desc`.

2. **`/src/app/api/admin/orders/[id]/route.ts`** — GET single order with full details (including user phone, product slug). PUT endpoint to update order status (validates against PENDING/PAID/SHIPPED/DELIVERED/CANCELLED).

3. **`/src/components/admin/AdminOrders.tsx`** — Complete admin orders management page featuring:
   - Header with "GESTIÓN DE ÓRDENES" title, order count, back button to admin-dashboard
   - Status filter button group (All/Pending/Paid/Shipped/Delivered/Cancelled) with active red highlight
   - Full data table with columns: expand toggle, Order ID (truncated), Cliente, Email, Items count, Total (COP), Status badge, Date, Actions
   - Status badges with color coding: PENDING (yellow), PAID (blue), SHIPPED (purple), DELIVERED (green), CANCELLED (red), each with icon
   - Inline status change via Select dropdown per row (calls PUT API)
   - Expandable row showing order items with product image, name, size, color, quantity, price
   - Order detail Sheet (right side panel) with: full order details, status timeline (PENDING→PAID→SHIPPED→DELIVERED visual flow + CANCELLED state), customer info, shipping address, all items with images, total, status change select
   - Dark gothic theme consistent with project (bg-black, bg-[#0a0a0a], bg-[#1a1a1a], rounded-none, red-600 accents)
   - Loading skeletons, error toasts, framer-motion animations
   - Uses: shadcn/ui Table, Badge, Select, Sheet, Skeleton, Button, Separator + lucide-react icons + sonner toasts + useNavigationStore

### Files Modified:
4. **`/src/types/index.ts`** — Added `"admin-orders"` to the `AppView` union type
5. **`/src/app/page.tsx`** — Added lazy import for `AdminOrders` and `'admin-orders'` entry in views record
6. **`/src/components/admin/AdminDashboard.tsx`** — Changed "VER ÓRDENES COMPLETAS" button from `toast.info(...)` to `navigate('admin-orders')`

### Lint: Clean (0 errors)
### Dev Server: Running successfully