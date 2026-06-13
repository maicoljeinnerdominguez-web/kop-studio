export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  isActive: boolean;
  isNew: boolean;
  isBestseller: boolean;
  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stockQuantity: number;
  product?: Product;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  productVariant?: ProductVariant & { product?: Product };
  quantity: number;
  priceAtPurchase: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export type AppView =
  | "home"
  | "collection"
  | "product"
  | "checkout"
  | "order-confirmation"
  | "admin-dashboard"
  | "admin-products"
  | "admin-products-new"
  | "admin-products-edit";

export interface ProductFilters {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  sortBy: "price-asc" | "price-desc" | "newest" | "bestseller";
  searchQuery: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  neighborhood: string;
  postalCode: string;
  notes: string;
  paymentMethod: "card" | "pse" | "nequi";
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface AdminStats {
  totalSales: number;
  pendingOrders: number;
  activeProducts: number;
  totalOrders: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}