# KOP STUDIO — Super Prompt de Construcción Completa

> **Instrucción para la IA:** Lee TODO este documento antes de escribir una sola línea de código. Este prompt contiene la especificación completa para construir KOP STUDIO desde cero y desplegarla a producción. Sigue el orden exacto de los pasos.

---

## 🏴 BRAND IDENTITY

- **Nombre:** KOP STUDIO
- **Tipo:** Tienda de e-commerce de streetwear gótico oscuro
- **Locación:** La Unión, Nariño, Colombia
- **Idioma:** Todo en español (Colombia)
- **Moneda:** COP (Pesos Colombianos) — formato: `$89.000` (signo $, punto como separador de miles, cero decimales)
- **Slogan implícito:** Estética oscura, angular, premium streetwear
- **Vibras:** Gothic, underground, minimalista oscuro, streetwear colombiano de lujo

---

## 🎨 DESIGN SYSTEM (OBLIGATORIO)

### Paleta de Colores
```
Fondo principal:       #000000 (negro puro)
Fondo tarjetas:        #0a0a0a (casi negro)
Fondo secundario:      #111111
Bordes oscuros:        #1a1a1a
Bordes medios:         #262626
Bordes claros:         #333333
Texto principal:       #ffffff
Texto secundario:      #neutral-400
Texto muted:           #neutral-500 / #737373
ACENTO PRINCIPAL:      #dc2626 (red-600) — PARA TODOS LOS CTAs
ACENTO CLARO:          #ef4444 (red-500)
ACENTO OSCURO:         #991b1b (red-800)
Verde stock:           #22c55e
```

### Tipografía
- **Font Family:** Geist Sans (o Inter como fallback)
- **Headings:** `font-bold` o `font-black`, `UPPERCASE`, `tracking-wider` o `tracking-widest`
- **Body:** `text-sm`, color `text-neutral-400` o `text-white`
- **Labels/Tags:** `text-[10px]` o `text-xs`, `uppercase tracking-widest font-bold`
- **Precios:** `font-bold text-base` o `text-lg`

### Reglas de Diseño
- **Casi NADA de border-radius:** usar `rounded-none` o máximo `rounded-sm` — estética angular y afilada
- **Bordes delgados:** `border border-[#1a1a1a]` o `border-[#262626]`
- **Max width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **NO usar colores azul o índigo en ningún lado**
- **Espaciado generoso** — la tienda debe respirar
- **Efecto hover en tarjetas:** `hover:shadow-lg hover:shadow-red-600/20`

### Animaciones Obligatorias (Framer Motion)
1. **Transiciones de vista:** `AnimatePresence mode="wait"`, fade + slideY (12px, 0.25s)
2. **Entrada de tarjetas:** `whileInView`, stagger de 0.05s, fadeInUp
3. **Efecto 3D en ProductCard:** Mouse-move con perspective transforms (rotateX/Y ±6deg)
4. **Shine-follow en hover:** Gradiente que sigue el mouse en tarjetas
5. **Cambio de imagen:** Crossfade de imagen primaria/secundaria al hover (0.5s)
6. **Parallax en Hero:** useScroll + useTransform para parallax Y + fade
7. **Grain overlay:** CSS `mix-blend-overlay` con textura de ruido en hero
8. **Vignette:** Gradiente radial oscuro sobre el hero
9. **Marquee:** CSS `@keyframes marquee` (20s linear infinite) para announcement bar
10. **Confetti:** Animación CSS + framer-motion en página de confirmación de orden
11. **Spring physics:** `type: 'spring', stiffness: 300-500, damping: 15-30`
12. **Botón press:** Scale ligeramente menor al hacer click (active:scale-95)

### Clases CSS Custom (crear en globals.css)
```css
.vignette-overlay       — Radial gradient overlay para hero
.gradient-line          — Línea de gradiente rojo
.shimmer-text           — Texto con efecto shimmer
.shine-follow           — Gradiente que sigue el mouse
.perspective-card       — Contenedor con perspective para 3D
.discount-badge-glow    — Glow rojo en badges de descuento
.glass-card             — Efecto glassmorphism sutil
.noise-overlay          — Overlay de ruido/grain
.hover-underline-red    — Underline rojo animado en hover
.btn-press              — Scale en active
.skeleton-shine         — Shimmer en skeletons
.custom-scrollbar-thin  — Scrollbar personalizado fino
```

---

## 🛠 TECH STACK (NO CAMBIAR)

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** con App Router (output: "standalone") |
| Language | **TypeScript 5** strict |
| Runtime | **Bun** (no Node.js) |
| CSS | **Tailwind CSS 4** con `tailwindcss-animate` |
| UI Components | **shadcn/ui** (New York style) + **Lucide Icons** |
| State Management | **Zustand 5** con middleware `persist` |
| Database ORM | **Prisma 6** (SQLite local, PostgreSQL producción) |
| Forms | **React Hook Form 8** + **Zod 4** |
| Animations | **Framer Motion 12** |
| Charts | **Recharts** (solo admin dashboard) |
| DnD | **@dnd-kit** (solo admin categorías) |
| Auth | **bcryptjs** (hash de contraseñas, sin JWT) |
| Search UI | **cmdk** (command palette) |
| Carousel | **embla-carousel-react** |
| Toasts | **sonner** |

### package.json — engines OBLIGATORIO:
```json
"engines": { "node": ">=22" }
```

---

## 🏗 ARQUITECTURA SPA (CRÍTICO)

**NO usar file-based routing de Next.js.** La app es un SPA con una sola ruta (`/`). Toda la navegación se maneja client-side con Zustand.

### Sistema de Navegación
```typescript
type AppView =
  | "home"
  | "collection"
  | "product"
  | "checkout"
  | "order-confirmation"
  | "wishlist"
  | "order-tracking"
  | "order-history"
  | "product-comparison"
  | "admin-dashboard"
  | "admin-products"
  | "admin-products-new"
  | "admin-products-edit"
  | "admin-promos"
  | "admin-orders"
  | "admin-categories";

// Store de navegación con Zustand:
interface NavigationStore {
  currentView: AppView;
  viewParams: Record<string, string>; // ej: { id: "producto-123", category: "camisetas" }
  previousView: AppView | null;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;
}
```

### Estructura de page.tsx
```
page.tsx renderiza:
  - Si NO es admin: AnnouncementBar → PromoBanner → Header → ViewRouter → Footer → NewsletterSuccess
  - Si es admin: Solo ViewRouter (sin header/footer)
  - Siempre montados: CartDrawer, SearchCommandPalette, UserAuthDialog,
    SocialProofNotification, CompareFloatingBar, AbandonedCartNotification,
    Botón WhatsApp, Botón Back-to-top

ViewRouter usa AnimatePresence y renderiza el componente correspondiente a currentView.
Los componentes de vista se lazy-load con React.lazy + Suspense.
```

---

## 📦 MODELOS DE DATOS (Prisma Schema)

```prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider = "sqlite"   // Se cambia a "postgresql" en deploy vía sed
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  phone        String?
  role         String   @default("USER")   // "USER" o "ADMIN"
  createdAt    DateTime @default(now())
  orders       Order[]
}

model Category {
  id       String     @id @default(cuid())
  name     String
  slug     String     @unique
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  products Product[]
}

model Product {
  id             String          @id @default(cuid())
  title          String
  slug           String          @unique
  description    String
  price          Float
  compareAtPrice Float?          // Precio anterior (para mostrar descuento)
  sku            String?
  isActive       Boolean         @default(true)
  isNew          Boolean         @default(false)
  isBestseller   Boolean         @default(false)
  categoryId     String
  category       Category        @relation(fields: [categoryId], references: [id])
  variants       ProductVariant[]
  images         ProductImage[]
  reviews        Review[]
  createdAt      DateTime        @default(now())
}

model ProductVariant {
  id            String      @id @default(cuid())
  productId     String
  product       Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  size          String                   // "S", "M", "L", "XL", "OS"
  color         String                   // "Negro"
  stockQuantity Int         @default(0)
  orderItems    OrderItem[]
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String                   // "/images/products/nombre.png"
  altText   String
  isPrimary Boolean @default(false)
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  status          String      @default("PENDING")  // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
  totalAmount     Float
  shippingAddress String                   // JSON string con dirección completa
  customerEmail   String?
  createdAt       DateTime    @default(now())
  items           OrderItem[]
}

model OrderItem {
  id               String         @id @default(cuid())
  orderId          String
  order            Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productVariantId String
  productVariant   ProductVariant @relation(fields: [productVariantId], references: [id])
  quantity         Int
  priceAtPurchase  Float
}

model Review {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  authorName  String
  rating      Int                // 1-5
  title       String?
  comment     String
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([productId])
}

model PromoCode {
  id          String    @id @default(cuid())
  code        String    @unique
  type        String              // "PERCENTAGE" o "FIXED"
  value       Int                 // Porcentaje (ej: 15) o monto fijo en COP (ej: 20000)
  minPurchase Int?                // Monto mínimo de compra
  maxUses     Int?                // Máximo de usos (null = ilimitado)
  usedCount   Int       @default(0)
  isActive    Boolean   @default(true)
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
}
```

---

## 🔌 API ROUTES (16 endpoints públicos + admin)

### Formato de precios en responses: Números (Float), el frontend los formatea.

### Rutas Públicas

| Método | Ruta | Descripción | Body/Query | Response |
|--------|------|-------------|------------|----------|
| GET | `/api` | Health check | — | `{message: "Hello, world!"}` |
| GET | `/api/products` | Listar productos | `?category=slug&search=q&new=true&bestseller=true&sort=price-asc\|price-desc\|newest&active=false` | `Product[]` con category, variants, images |
| POST | `/api/products` | Crear producto | `{title,description,price,compareAtPrice?,sku,categoryId,isNew?,isBestseller?,variants:[{size,color,stockQuantity}],images:[{url,altText,isPrimary}]}` | Product (201) |
| GET | `/api/products/[id]` | Obtener producto | — | Product o 404 |
| PUT | `/api/products/[id]` | Actualizar producto | `{title,description,price,compareAtPrice?,sku,categoryId,isNew,isBestseller,isActive}` | Product |
| DELETE | `/api/products/[id]` | Eliminar producto | — | `{success: true}` |
| GET | `/api/products/[id]/reviews` | Listar reseñas | — | `{reviews, averageRating, totalReviews}` |
| POST | `/api/products/[id]/reviews` | Crear reseña | `{authorName, rating(1-5), title?, comment(min 10 chars)}` | Review (201) |
| GET | `/api/categories` | Listar categorías | — | `Category[]` con `_count: {products}` |
| POST | `/api/categories` | Crear categoría | `{name, parentId?}` | Category (201) |
| POST | `/api/auth` | Login | `{email, password}` | `{user: {id,name,email,role}}` o 401 |
| POST | `/api/auth/register` | Registro | `{name, email, password, phone?}` | `{user, message}` (201) |
| GET | `/api/orders` | Listar órdenes | `?email=` | `Order[]` con items, variants, products |
| POST | `/api/orders` | Crear orden | `{items:[{variantId,quantity,price}], totalAmount, shippingAddress, userId, customerEmail?}` | Order (201), decrementa stock |
| GET | `/api/orders/[id]` | Obtener orden | — | Order o 404 |
| PATCH | `/api/orders/[id]` | Actualizar estado | `{status}` | Order |
| GET | `/api/orders/track` | Rastrear por email | `?email=` | `{orders: Order[]}` |
| GET | `/api/search` | Buscar productos | `?q=` (min 2 chars) | `Product[]` (max 8) |
| POST | `/api/newsletter` | Suscribir | `{email}` | `{success, message}` |
| POST | `/api/promo` | Validar código | `{code, subtotal}` | `{valid, code?, type?, value?, discountAmount?, error?}` |
| POST | `/api/promo/use` | Registrar uso | `{code}` | `{success: true}` |
| GET | `/api/setup/seed` | Seed DB | — | `{success, stats}` |

### Rutas Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin` | Stats: totalSales, pendingOrders, activeProducts, totalOrders, recentOrders |
| CRUD completo | `/api/admin/orders` | Listar/actualizar órdenes |
| CRUD completo | `/api/admin/categories` | Listar/crear/editar/eliminar categorías |
| CRUD completo | `/api/admin/promos` | Listar/crear/editar/eliminar códigos promo |

---

## 🧠 ZUSTAND STORES (9 stores)

### 1. useNavigationStore
```
currentView: AppView, viewParams: {}, previousView: null
navigate(view, params?), goBack()
```
NO persistido.

### 2. useCartStore (persist: "kop-cart")
```
items: CartItem[], isUpsellActive: false, isCartOpen: false
openCart(), closeCart(), toggleCart()
addItem(variantId, productId, size, color, price, title, image, quantity)
removeItem(variantId), updateQuantity(variantId, qty), clearCart()
toggleUpsell()
getSubtotal(), getTotal(), getItemCount()
getShippingProgress(), getRemainingForFreeShipping(), hasFreeShipping()
```
**Reglas de carrito:**
- Envío gratis: compras > $250.000 COP
- Costo envío: $15.000 COP
- Upsell: "Puffer Bag Urban" a $40.000 COP (se activa con isUpsellActive)

### 3. useWishlistStore (persist: "kop-wishlist")
```
wishlist: string[] (product IDs)
toggleWishlist(id), isInWishlist(id), clearWishlist()
```

### 4. useAuthStore (persist: "kop-auth")
```
isAuthenticated: false, user: null, isAdmin: false
login(email, password) → POST /api/auth
register(name, email, password, phone?) → POST /api/auth/register
logout()
```

### 5. useAuthDialogStore
```
isOpen: false, initialTab: "login" | "register"
open(tab?), close()
```

### 6. useCompareStore (persist: "kop-compare")
```
productIds: string[] (max 3)
addProduct(id), removeProduct(id), clearComparison()
```

### 7. useNewsletterStore
```
showSuccess: false
triggerSuccess(), dismissSuccess()
```

### 8. useSearchOpenStore
```
isOpen: false
setOpen(bool), toggle()
```

### 9. useRecentlyViewedStore (persist: "kop-recently-viewed")
```
recentlyViewed: SimplifiedProduct[] (max 12)
addViewedProduct(product), clearRecent()
```

---

## 🖼 VISTAS Y COMPONENTES (Descripción completa)

### HOME VIEW (~950 líneas, la vista más importante)
Secciones en orden vertical:
1. **Hero Section** — Full viewport, imagen de fondo con parallax, overlay de grain/ruido, overlay vignette, texto "ASCENSIÓN COLECCIÓN 2026" con animación, botones "EXPLORAR COLECCIÓN" y "VER BESTSELLERS"
2. **Brand Stats Row** — 3 stats animadas con count-up: "100+ Diseños", "5K+ Clientes", "4.9★ Rating"
3. **Category Cards** — 4 categorías horizontales con scroll (New Merch, Camisetas, Inferiores, Accesorios), flechas de navegación, hover con zoom
4. **New Arrivals Carousel** — Scroll horizontal de ProductCards, fetch `?new=true`
5. **Trust Features** — 3 columnas con iconos (Camión/Devolución/Escudo), números animados: "24H Envío", "30 DÍAS Devolución", "100% Original"
6. **Bestsellers Carousel** — Scroll horizontal, fetch `?bestseller=true`
7. **Complete The Look** — Grid de productos de la categoría "total-looks"
8. **SocialFeed** — Grid 2x4 de imágenes estilo Instagram, grayscale→color en hover, overlay con likes/comentarios
9. **Recently Viewed** — Últimos 12 productos vistos (desde store)

### PRODUCT CARD (el componente más complejo visualmente)
- **3D tilt** al mover el mouse (perspective + rotateX/Y)
- **Shine-follow** — Gradiente de luz que sigue el cursor
- **Doble imagen** — Se muestra imagen secundaria al hover con crossfade
- **Badge de descuento** — Calculado si compareAtPrice > price, con glow rojo
- **Badge "NUEVO"** — Si isNew es true
- **Dot de stock** — Verde si hay stock, rojo si no
- **Mini tallas disponibles** — Chips S/M/L/XL/OS
- **Iconos de acción** — Corazón (wishlist), ojo (quick view)
- **Botones slide-up** — "AÑADIR" y "COMPRAR AHORA" aparecen al hover
- **Rating** — Estrellas + número de reseñas
- **Precio** — Precio actual en grande, tachado el anterior, porcentaje de ahorro

### PRODUCT DETAIL VIEW (~46KB)
- **Galería de imágenes** con lightbox (click para fullscreen)
- **Selector de talla** con flash verde al seleccionar
- **Selector de color**
- **Selector de cantidad**
- **Botón "AÑADIR AL CARRITO"** y "COMPRAR AHORA"
- **Wishlist y compartir**
- **Guía de tallas** (tabla)
- **Acordeón** — Descripción / Cuidados / Envío
- **Sección de reseñas** — Promedio, lista, formulario para escribir
- **"Complete The Look"** — Productos recomendados
- **Breadcrumb**

### CART DRAWER (Sheet lateral derecho)
- Estado vacío: "Tu carrito está vacío" con emoji corazón roto
- **Barra de progreso de envío gratis** — "Te faltan $XX para envío gratis", la barra se llena de rojo→verde
- **Items** con +/- cantidad, precio, eliminar
- **Upsell** — "Puffer Bag Urban" a $40K (si no está en el carrito)
- **Resumen** — Subtotal, envío, total, indicador de ahorro
- **Botón "IR A PAGAR"** que navega a checkout

### CHECKOUT VIEW (~68KB, 3 pasos)
**Paso 1 — Contacto:** Nombre, email, teléfono (validación Zod)
**Paso 2 — Dirección:** Dirección, ciudad, departamento, barrio, código postal, notas
**Paso 3 — Pago:** Método (Tarjeta/PSE/Nequi), campos de tarjeta, validación de código promo
**Sidebar** — Resumen de orden con items, subtotal, envío, descuento, total

### ORDER CONFIRMATION
- Animación de confetti
- Checkmark animado
- Número de orden aleatorio "KOP-XXXXXX" con botón copiar
- Timeline de seguimiento (5 pasos)
- Estimación de entrega (3-5 días hábiles)

### HEADER (sticky)
- Logo SVG "KOP STUDIO" a la izquierda
- 8 links de navegación: New Merch, Bestsellers, Total Looks, Camisetas, Inferiores, Básicos, Descuentos, Favoritos
- Iconos: Búsqueda (Cmd+K), Wishlist (con count), Carrito (con count), Usuario
- Menú móvil: Sheet con links animados con stagger
- Línea de gradiente rojo debajo
- Sombra al hacer scroll

### FOOTER (sticky al bottom)
- 4 columnas: Marca, Tienda, Información, Newsletter
- Métodos de pago: Visa, Mastercard, PSE, Nequi, Addi
- Iconos sociales
- Copyright: "La Unión, Nariño, Colombia © 2026"

### COMPONENTES DE UX
- **SocialProofNotification** — Popup cada 20-35s: "Alguien en Medellín compró Memento Tee..." (datos falsos aleatorios)
- **AbandonedCartNotification** — Aparece después de 60s si hay items en el carrito: "¿Olvidaste algo?"
- **SearchCommandPalette** — Cmd+K, búsqueda debounced, navegación con teclado (↑↓/Enter/Esc), links rápidos
- **CompareFloatingBar** — Barra fija abajo mostrando productos comparados
- **NewsletterSuccess** — Notificación "¡Bienvenido a la familia KOP!" auto-dismiss 5s
- **AnnouncementBar** — Marquee: "🔥 ENVIO GRATIS X COMPRAS SUPERIORES A $250.000"
- **PromoBanner** — "10% de descuento con **KOP10**", botón copiar, dismissible

### ADMIN VIEWS
- **Dashboard** — Stats (ventas totales, órdenes pendientes, productos activos), gráfico de ventas, órdenes recientes
- **Productos** — Tabla con acciones, búsqueda, crear/editar/eliminar
- **Categorías** — CRUD con drag-and-drop para ordenar
- **Órdenes** — Tabla con filtros por estado, actualizar estado
- **Promos** — CRUD de códigos de descuento

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/
├── app/
│   ├── page.tsx                    ← ÚNICA ruta, renderiza todo el SPA
│   ├── layout.tsx                  ← Root layout con fonts y metadata
│   ├── globals.css                 ← Tailwind + CSS custom classes
│   └── api/
│       ├── route.ts                ← Health check
│       ├── products/
│       │   ├── route.ts            ← GET (list) + POST (create)
│       │   ├── [id]/
│       │   │   ├── route.ts        ← GET + PUT + DELETE
│       │   │   └── reviews/
│       │   │       └── route.ts    ← GET + POST
│       ├── categories/route.ts     ← GET + POST
│       ├── auth/
│       │   ├── route.ts            ← POST (login)
│       │   └── register/route.ts   ← POST (register)
│       ├── orders/
│       │   ├── route.ts            ← GET + POST
│       │   ├── [id]/route.ts       ← GET + PATCH
│       │   └── track/route.ts      ← GET
│       ├── search/route.ts         ← GET
│       ├── newsletter/route.ts     ← POST
│       ├── promo/
│       │   ├── route.ts            ← POST (validate)
│       │   └── use/route.ts        ← POST (register use)
│       ├── setup/seed/route.ts     ← GET (seed DB)
│       └── admin/
│           ├── route.ts            ← GET (dashboard stats)
│           ├── orders/
│           │   ├── route.ts        ← GET (list all)
│           │   └── [id]/route.ts   ← GET + PUT
│           ├── categories/
│           │   ├── route.ts        ← GET + POST
│           │   └── [id]/route.ts   ← GET + PUT + DELETE
│           └── promos/
│               ├── route.ts        ← GET + POST
│               └── [id]/route.ts   ← GET + PUT + DELETE
├── components/
│   ├── ui/                         ← 42 componentes shadcn/ui
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AnnouncementBar.tsx
│   │   ├── PromoBanner.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── UserAuthDialog.tsx
│   │   ├── SearchCommandPalette.tsx
│   │   ├── SocialProofNotification.tsx
│   │   ├── AbandonedCartNotification.tsx
│   │   ├── NewsletterSuccess.tsx
│   │   ├── CompareFloatingBar.tsx
│   │   └── AdminLogin.tsx
│   ├── views/
│   │   ├── HomeView.tsx            ← ~950 líneas
│   │   ├── CollectionView.tsx
│   │   ├── ProductDetailView.tsx   ← ~46KB
│   │   ├── CheckoutView.tsx        ← ~68KB
│   │   ├── OrderConfirmation.tsx
│   │   ├── WishlistView.tsx
│   │   ├── OrderTrackingView.tsx
│   │   ├── OrderHistoryView.tsx
│   │   ├── ProductComparisonView.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminProducts.tsx
│   │       ├── AdminProductForm.tsx
│   │       ├── AdminPromos.tsx
│   │       ├── AdminOrders.tsx
│   │       └── AdminCategories.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductQuickView.tsx
│   │   ├── QuickBuyModal.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── ProductLightbox.tsx
│   │   ├── ImageLightbox.tsx
│   │   ├── CompleteTheLook.tsx
│   │   ├── SizeQuizDialog.tsx
│   │   └── ProductComparisonTable.tsx
│   └── shared/
│       ├── SocialFeed.tsx
│       └── ... (otros componentes compartidos)
├── stores/
│   ├── useNavigationStore.ts
│   ├── useCartStore.ts
│   ├── useWishlistStore.ts
│   ├── useAuthStore.ts
│   ├── useAuthDialogStore.ts
│   ├── useCompareStore.ts
│   ├── useNewsletterStore.ts
│   ├── useSearchOpenStore.ts
│   └── useRecentlyViewedStore.ts
├── lib/
│   └── db.ts                       ← Prisma Client singleton
└── hooks/
    └── useCountUp.ts               ← Hook de animación count-up

prisma/
├── schema.prisma                   ← provider = "sqlite" (se cambia en deploy)
└── seed.ts                         ← (opcional, usamos /api/setup/seed en su lugar)

public/
├── logo.svg
├── robots.txt
└── images/
    ├── hero/hero-main.png
    ├── brand/                      ← 10 imágenes de marca (hero, collage, etc.)
    └── products/                   ← ~18 imágenes de productos PNG

railway.toml                        ← Config de deploy
start.sh                            ← Script de inicio (chmod +x)
.env                                ← DATABASE_URL=file:./db/custom.db (local)
next.config.ts                      ← output: "standalone"
```

---

## 🚀 PLAN DE DESPLIEGUE A PRODUCCIÓN (Railway)

### Paso 1: Crear repositorio en GitHub
1. Crear repo privado en GitHub
2. Subir todo el código

### Paso 2: Crear proyecto en Railway
1. Ir a railway.app → New Project → Deploy from GitHub repo
2. Seleccionar el repositorio

### Paso 3: Configurar railway.toml (YA INCLUIDO en el repo)
```toml
[build]
builder = "nixpacks"
buildCommand = "sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/' prisma/schema.prisma && DATABASE_URL='postgresql://x:x@x:5432/x' bun run db:generate && bun run build"

[deploy]
startCommand = "bash start.sh"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[plugins]]
plugin = "postgresql"
```

### Paso 4: Configurar start.sh (YA INCLUIDO)
```bash
#!/bin/bash
# Construye DATABASE_URL desde variables de Railway
if [ -n "$POSTGRES_URL" ]; then
  DB_URL="$POSTGRES_URL"
elif [ -n "$POSTGRES_HOST" ]; then
  DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}"
else
  echo "ERROR: No PostgreSQL config"
  exit 1
fi
echo "DATABASE_URL=$DB_URL" > .env
[ -d ".next/standalone" ] && echo "DATABASE_URL=$DB_URL" > .next/standalone/.env
bunx prisma db push --accept-data-loss 2>&1
exec node .next/standalone/server.js
```

### Paso 5: Configurar next.config.ts
```typescript
const nextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
export default nextConfig;
```

### Paso 6: Esperar a que el deploy esté ✅ verde

### Paso 7: Seed de la base de datos
Visitar: `https://tu-app.up.railway.app/api/setup/seed`
Debería mostrar: `{"success":true,"stats":{...}}`

### Paso 8: Verificar
- Entrar a la URL pública
- Probar registro de usuario
- Probar login con admin@kopstudio.com / admin123

### LECCIONES APRENDIDAS (errores que NO debes cometer):
1. ❌ NO usar Dockerfile — Railway lo prefiere sobre Nixpacks. Bórralo si existe.
2. ❌ NO omitir `"engines": { "node": ">=22" }` en package.json — Nixpacks detecta Node 18 y falla.
3. ❌ NO usar `npx` en startCommand — Railway runner no tiene Node, usar `bunx` o `node`.
4. ❌ NO usar `prisma migrate` — usar `prisma db push --accept-data-loss` (sin --skip-generate, Prisma 6 lo removió).
5. ❌ NO dejar el `.env` con `DATABASE_URL=file:...` sin override — El start.sh debe sobreescribirlo.
6. ❌ NO crear PostgreSQL como servicio separado — Usar `[[plugins]] plugin = "postgresql"` en railway.toml.
7. ❌ NO usar `NIXPACKS_NODE_VERSION` en `[env]` — Nixpacks no lo lee en fase de detección. Usar `engines` en package.json.
8. ❌ NO usar variables de entorno de Railway en buildCommand — Solo están disponibles en deploy. Para build, usar URL dummy.
9. ✅ SIEMPRE copiar .env a .next/standalone/.env también.
10. ✅ El buildCommand de Nixpacks usa `bun` pero el startCommand puede usar `node` (el runner de Railway tiene Node).

---

## 📊 SEED DATA

### Usuarios:
- admin@kopstudio.com / admin123 (ADMIN)
- cliente@kopstudio.com / demo123 (USER)

### 8 Categorías: New Merch, Bestsellers, Total Looks, Camisetas, Inferiores, Básicos, Accesorios, Descuentos

### 8 Productos:
1. Memento Tee - Gothic Cross — $89.000 (antes $120.000) — camisetas — Tallas S/M/L/XL/OS
2. Sivere Hoodie - Mandala Sacred — $165.000 — new-merch — Tallas S/M/L/XL
3. 72+1 Cargo Pants - Tactical Black — $135.000 (antes $175.000) — inferiores — Tallas S/M/L/XL
4. Fiat Lux Tee - Oración — $79.000 (antes $95.000) — camisetas — Tallas S/M/L/XL/OS
5. Puffer Bag Urban - Chain Edition — $65.000 — accesorios — Talla OS
6. Jogger Obsidian - Minimal Street — $95.000 — basicos — Tallas S/M/L/XL
7. Ascension Tee - Angel Wings — $99.000 (antes $140.000) — new-merch — Tallas S/M/L/OS
8. Basic Essential Tee - Midnight — $55.000 (antes $70.000) — basicos — Tallas S/M/L/XL/OS

### 3 Códigos Promo:
- KOP10 — 10% descuento, mínimo $100.000, máximo 100 usos
- BIENVENIDO — $15.000 fijos, mínimo $50.000, máximo 500 usos
- SILVER20 — 20% descuento, mínimo $200.000

### 8 Reseñas de ejemplo con ratings 4-5 estrellas

---

## 💰 REGLAS DE NEGOCIO

- **Envío gratis:** Compras superiores a $250.000 COP
- **Costo de envío estándar:** $15.000 COP
- **Moneda:** COP (sin decimales)
- **Formato de precio:** `$89.000` (`$${price.toLocaleString('es-CO')}`)
- **Tallas disponibles:** S, M, L, XL, OS (One Size)
- **Color principal:** Negro (todas las variantes)
- **Métodos de pago:** Tarjeta de crédito/débito, PSE, Nequi
- **Tiempo de entrega estimado:** 3-5 días hábiles
- **Política de devolución:** 30 días
- **Pedido mínimo para envío gratis:** $250.000

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

Antes de declarar el proyecto completo, verificar:

- [ ] La página principal carga sin errores
- [ ] El hero tiene parallax + grain + vignette
- [ ] Los ProductCards tienen efecto 3D tilt + shine + cambio de imagen
- [ ] El carrito persiste al recargar (Zustand persist)
- [ ] El registro y login funcionan
- [ ] El checkout de 3 pasos completa y crea la orden
- [ ] La confirmación muestra confetti
- [ ] Los códigos promo funcionan (KOP10, BIENVENIDO)
- [ ] El admin dashboard muestra stats
- [ ] El admin puede crear/editar/eliminar productos
- [ ] El admin puede gestionar categorías (DnD)
- [ ] El admin puede gestionar órdenes y promos
- [ ] La búsqueda Cmd+K funciona
- [ ] Los social proof popups aparecen
- [ ] El abandoned cart notification aparece
- [ ] El footer es sticky al bottom
- [ ] Responsive en móvil
- [ ] El deploy en Railway está en verde
- [ ] El seed cargó los 8 productos
- [ ] Las reseñas se pueden crear
- [ ] La comparación de productos funciona (max 3)
- [ ] El wishlist persiste
- [ ] El order tracking por email funciona

---

## 📝 NOTAS FINALES PARA LA IA CONSTRUCTORA

1. **Prioriza el frontend primero** — Construye todas las vistas y componentes visuales ANTES de conectar la base de datos. Usa datos mock si es necesario.
2. **Sigue el orden:** Layout → Home → ProductCard → Collection → ProductDetail → Cart → Checkout → Auth → Admin
3. **Cada componente debe ser un archivo separado** — No pongas todo en un solo archivo.
4. **Usa shadcn/ui** para todos los componentes base (Dialog, Sheet, Button, Input, etc.)
5. **Las animaciones son OBLIGATORIAS** — Sin ellas la tienda se ve genérica.
6. **El dark mode es el ÚNICO modo** — No implementes light mode toggle.
7. **Todo el texto en español** — incluyendo errores de validación, placeholders, labels.
8. **Los precios SIEMPRE en COP** — Nunca dólares.
9. **Prueba cada vista en móvil** — La mayoría de clientes de streetwear compran desde celular.
10. **El deploy es PARTE del proyecto** — No lo dejes para el final, configúralo desde el principio.