// Additional products to add via API or direct DB insert
// These would be added to the main seed.ts products array

const extraProducts = [
  {
    title: "Sacred Geometry L/S - Oversized",
    slug: "sacred-geometry-ls-oversized",
    description: "Camisa manga larga con gráfico de geometría sagrada. Algodón premium 260gsm, corte oversize con hombros caídos. Ideal para las noches frescas de la ciudad.",
    price: 115000,
    compareAtPrice: null,
    sku: "KOP-SG-LS-009",
    isNew: true,
    isBestseller: false,
    categorySlug: "camisetas",
    images: [
      { url: "/images/products/longsleeve-geo-8.png", altText: "Sacred Geometry LS - Frontal", isPrimary: true },
      { url: "/images/products/tshirt-gothic-1.png", altText: "Sacred Geometry LS - Detalle", isPrimary: false },
    ],
    variants: [
      { size: "S", color: "Negro", stockQuantity: 6 },
      { size: "M", color: "Negro", stockQuantity: 10 },
      { size: "L", color: "Negro", stockQuantity: 8 },
      { size: "XL", color: "Negro", stockQuantity: 4 },
    ],
  },
  {
    title: "KOP Beanie - Embroidered Logo",
    slug: "kop-beanie-embroidered",
    description: "Gorro beanies de punto grueso con logo KOP bordado en frente. Acrílico premium, ajuste perfecto. El complemento esencial para el streetwear invernal.",
    price: 45000,
    compareAtPrice: 60000,
    sku: "KOP-BN-EL-010",
    isNew: true,
    isBestseller: false,
    categorySlug: "accesorios",
    images: [
      { url: "/images/products/beanie-9.png", altText: "KOP Beanie Embroidered", isPrimary: true },
      { url: "/images/products/puffer-bag-5.png", altText: "KOP Beanie - Detalle", isPrimary: false },
    ],
    variants: [
      { size: "OS", color: "Negro", stockQuantity: 20 },
    ],
  },
  {
    title: "Shadow Track Jacket - Minimal",
    slug: "shadow-track-jacket-minimal",
    description: "Chaqueta track oversize en nylon negro con diseño minimalista. Cierre completo, bolsillos laterales con cremallera, interior acolchado. La capa perfecta para cualquier look urbano.",
    price: 185000,
    compareAtPrice: null,
    sku: "KOP-STJ-MN-011",
    isNew: false,
    isBestseller: true,
    categorySlug: "new-merch",
    images: [
      { url: "/images/products/track-jacket-10.png", altText: "Shadow Track Jacket - Frontal", isPrimary: true },
      { url: "/images/products/hoodie-mandala-2.png", altText: "Shadow Track Jacket - Detalle", isPrimary: false },
    ],
    variants: [
      { size: "S", color: "Negro", stockQuantity: 5 },
      { size: "M", color: "Negro", stockQuantity: 8 },
      { size: "L", color: "Negro", stockQuantity: 6 },
      { size: "XL", color: "Negro", stockQuantity: 3 },
    ],
  },
];
