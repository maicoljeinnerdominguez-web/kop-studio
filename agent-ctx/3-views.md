# Worklog - Task 3-views

## Task: View Components for KOP STUDIO

### Summary
Created all 4 view components for the KOP STUDIO streetwear e-commerce SPA: ProductCard, HomeView, CollectionView, and ProductDetailView. All use dark streetwear aesthetic, framer-motion animations, and integrate with navigation/cart stores.

### Files Created

1. **`src/components/product/ProductCard.tsx`**
   - Dark card (`bg-[#0a0a0a]`, `border-[#1a1a1a]`) with hover image swap using CSS classes `product-card-image-primary` / `product-card-image-secondary`
   - Discount badge (red, top-left) showing "X% OFF" when `compareAtPrice > price`
   - "NUEVO" badge (white bg, black text, top-right) when `isNew`
   - Product title (truncated), category name (gray-500), price in COP format (`toLocaleString('es-CO')`)
   - Quick "AÑADIR" button appears on hover, finds first available variant (stockQuantity > 0), adds to cart via `useCartStore`, shows sonner toast, opens cart drawer
   - `framer-motion whileHover={{ y: -4 }}` animation on the card

2. **`src/components/home/HomeView.tsx`**
   - **Hero Section**: Full-width with `/images/hero/hero-main.png`, dark overlay (`bg-black/60`), centered "ASCENSIÓN COLECCIÓN 2026" (tracking-widest, font-bold), cursive "Built in Silence", two CTA buttons (white solid + transparent outline), framer-motion fade-in/slide-up, min-height 70vh mobile / 80vh desktop
   - **Categories Grid**: 2x2 mobile / 4-col desktop, 4 category cards (New Merch, Camisetas, Inferiores, Accesorios) with images, hover scale + red border, product count from `/api/categories` API, click → collection view
   - **LO NUEVO Carousel**: Section title with red underline, horizontal scrollable div with snap scrolling, fetches `/api/products?new=true`, left/right navigation buttons, "VER TODOS" button
   - **BEST SELLERS Carousel**: Same pattern, fetches `/api/products?bestseller=true`
   - **Reviews Section**: 3 hardcoded review cards (1 col mobile / 3 col desktop), star ratings using Lucide Star icon (filled red / empty gray), name, comment, date
   - Loading skeletons for carousels and category counts

3. **`src/components/product/CollectionView.tsx`**
   - Header with category name (from `viewParams.category`) and breadcrumb
   - Uses `key={categorySlug}` pattern on inner `CollectionInner` component for clean state reset on navigation
   - **Filter Sidebar**: Size checkboxes (S, M, L, XL, OS) using shadcn Checkbox, price range radio buttons (5 options), sort Select dropdown (4 options), "LIMPIAR FILTROS" button
   - All filtering/sorting is client-side on the products array
   - Mobile: filters in a Sheet (side="left"), desktop: sticky sidebar (w-56)
   - Product grid: 2 cols mobile, 3 cols md, 4 cols lg
   - Empty state: "No se encontraron productos" with clear filters button
   - Product count display

4. **`src/components/product/ProductDetailView.tsx`**
   - Uses `key={slug}` pattern on inner `ProductDetailInner` component for clean state reset
   - Fetches all products via `/api/products`, filters by slug, finds related products from same category
   - **Image Gallery**: Main image with `AnimatePresence` for smooth transitions, thumbnail row for image selection
   - Product title, price with discount calculation, badges (Nuevo / Best Seller)
   - **Size Selector**: Buttons for each unique size, disabled state (grayed out) when `stockQuantity === 0`, selected state (white bg/black text/border-white), default (transparent/white border)
   - **Color display**: Shows available colors from variants
   - **Add to Cart**: Full-width red button, disabled without size selection or if out of stock, adds variant to cart + toast + opens cart drawer
   - **Benefits row**: Envío Express, Devoluciones, Compra Segura with Lucide icons
   - **Accordion sections** (shadcn): Descripción, Detalles de la prenda (4 items with red Check icons), Guía de lavado (4 items)
   - **Related Products**: 4 products from same category using ProductCard
   - Back button using `useNavigationStore().goBack()`
   - Breadcrumb: Inicio → Category → Product title

### Lint Status
✅ All files pass ESLint with zero errors.

### Notes
- Used `key={slug}` and `key={categorySlug}` patterns on inner components to avoid the React 19 `react-hooks/set-state-in-effect` lint rule (no synchronous setState calls in effects)
- All components use `'use client'` directive
- Stores used: `useNavigationStore`, `useCartStore`
- shadcn components used: Button, Badge, Accordion, Select, Checkbox, Sheet, Skeleton, Breadcrumb
- Uses `<img>` tags (not next/image) per instructions
- Price formatting: `$XX.XXX` with `toLocaleString('es-CO')`
- All product navigation uses `navigate('product', { slug })` / `navigate('collection', { category })`