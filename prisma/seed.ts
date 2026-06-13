import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: "Admin KOP",
      email: "admin@kopstudio.com",
      passwordHash: "admin123",
      role: "ADMIN",
    },
  });

  // Create demo user
  await prisma.user.create({
    data: {
      name: "Cliente Demo",
      email: "cliente@kopstudio.com",
      passwordHash: "demo123",
      role: "USER",
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "New Merch", slug: "new-merch" } }),
    prisma.category.create({ data: { name: "Bestsellers", slug: "bestsellers" } }),
    prisma.category.create({ data: { name: "Total Looks", slug: "total-looks" } }),
    prisma.category.create({ data: { name: "Camisetas", slug: "camisetas" } }),
    prisma.category.create({ data: { name: "Inferiores", slug: "inferiores" } }),
    prisma.category.create({ data: { name: "Básicos", slug: "basicos" } }),
    prisma.category.create({ data: { name: "Accesorios", slug: "accesorios" } }),
    prisma.category.create({ data: { name: "Descuentos", slug: "descuentos" } }),
  ]);

  // Product data with streetwear aesthetic
  const productsData = [
    {
      title: "Memento Tee - Gothic Cross",
      slug: "memento-tee-gothic-cross",
      description: "Camiseta oversized con gráfico de cruz gótica impreso en serigrafía de alta calidad. Algodón premium 240gsm, corte relajado urbano. Cada pieza es única por su proceso de impresión artesanal.",
      price: 89000,
      compareAtPrice: 120000,
      sku: "KOP-MNT-GC-001",
      isNew: true,
      isBestseller: true,
      categoryId: categories[3].id, // Camisetas
      images: [
        { url: "/images/products/tshirt-gothic-1.png", altText: "Memento Tee Gothic Cross - Frontal", isPrimary: true },
        { url: "/images/products/tshirt-angel-7.png", altText: "Memento Tee Gothic Cross - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 8 },
        { size: "M", color: "Negro", stockQuantity: 15 },
        { size: "L", color: "Negro", stockQuantity: 12 },
        { size: "XL", color: "Negro", stockQuantity: 5 },
        { size: "OS", color: "Negro", stockQuantity: 3 },
      ],
    },
    {
      title: "Sivere Hoodie - Mandala Sacred",
      slug: "sivere-hoodie-mandala",
      description: "Sudadera con capucha y gráfico de mandala sagrado en espalda. Tela polar de alto gramaje, interior cepillado. Detalle de logo bordado en pecho izquierdo. Corte oversize para un look streetwear auténtico.",
      price: 165000,
      compareAtPrice: null,
      sku: "KOP-SVR-MN-002",
      isNew: true,
      isBestseller: true,
      categoryId: categories[0].id, // New Merch
      images: [
        { url: "/images/products/hoodie-mandala-2.png", altText: "Sivere Hoodie Mandala - Frontal", isPrimary: true },
        { url: "/images/products/tshirt-gothic-1.png", altText: "Sivere Hoodie Mandala - Espalda", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 5 },
        { size: "M", color: "Negro", stockQuantity: 10 },
        { size: "L", color: "Negro", stockQuantity: 8 },
        { size: "XL", color: "Negro", stockQuantity: 4 },
      ],
    },
    {
      title: "72+1 Cargo Pants - Tactical Black",
      slug: "cargo-pants-tactical-black",
      description: "Pantalón cargo de corte amplio con múltiples bolsillos funcionales. Tela ripstop resistente, cintura ajustable con cordón. Diseño táctico inspirado en la cultura urbana contemporánea.",
      price: 135000,
      compareAtPrice: 175000,
      sku: "KOP-CRG-TB-003",
      isNew: false,
      isBestseller: true,
      categoryId: categories[4].id, // Inferiores
      images: [
        { url: "/images/products/cargo-black-3.png", altText: "Cargo Tactical Black - Frontal", isPrimary: true },
        { url: "/images/products/jogger-6.png", altText: "Cargo Tactical Black - Lateral", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 6 },
        { size: "M", color: "Negro", stockQuantity: 12 },
        { size: "L", color: "Negro", stockQuantity: 9 },
        { size: "XL", color: "Negro", stockQuantity: 4 },
      ],
    },
    {
      title: "Fiat Lux Tee - Oración",
      slug: "fiat-lux-tee-oracion",
      description: "Camiseta con gráfico de manos en oración y texto 'Fiat Lux'. Impresión DTG de alta resolución que respeta la textura del algodón. Corte boxy contemporáneo.",
      price: 79000,
      compareAtPrice: 95000,
      sku: "KOP-FLX-OR-004",
      isNew: false,
      isBestseller: false,
      categoryId: categories[3].id, // Camisetas
      images: [
        { url: "/images/products/tshirt-pray-4.png", altText: "Fiat Lux Tee Oración - Frontal", isPrimary: true },
        { url: "/images/products/tshirt-angel-7.png", altText: "Fiat Lux Tee Oración - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 10 },
        { size: "M", color: "Negro", stockQuantity: 18 },
        { size: "L", color: "Negro", stockQuantity: 14 },
        { size: "XL", color: "Negro", stockQuantity: 7 },
        { size: "OS", color: "Negro", stockQuantity: 5 },
      ],
    },
    {
      title: "Puffer Bag Urban - Chain Edition",
      slug: "puffer-bag-urban-chain",
      description: "Bolsa puffer con textura acolchada y correa de cadena metálica. Cierre magnético, compartimento interno con bolsillo oculto. El accesorio perfecto para complementar tu look urbano.",
      price: 65000,
      compareAtPrice: null,
      sku: "KOP-PBG-CE-005",
      isNew: true,
      isBestseller: false,
      categoryId: categories[6].id, // Accesorios
      images: [
        { url: "/images/products/puffer-bag-5.png", altText: "Puffer Bag Urban Chain", isPrimary: true },
        { url: "/images/products/cargo-black-3.png", altText: "Puffer Bag - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "OS", color: "Negro", stockQuantity: 15 },
      ],
    },
    {
      title: "Jogger Obsidian - Minimal Street",
      slug: "jogger-obsidian-minimal",
      description: "Jogger de algodón piqué con acabado minimalista. Cintura elástica con cordón ajustable, bolsillos laterales con cierre. El básico que todo urbanista necesita.",
      price: 95000,
      compareAtPrice: null,
      sku: "KOP-JOG-MS-006",
      isNew: false,
      isBestseller: false,
      categoryId: categories[5].id, // Básicos
      images: [
        { url: "/images/products/jogger-6.png", altText: "Jogger Obsidian Minimal", isPrimary: true },
        { url: "/images/products/cargo-black-3.png", altText: "Jogger Obsidian - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 8 },
        { size: "M", color: "Negro", stockQuantity: 14 },
        { size: "L", color: "Negro", stockQuantity: 10 },
        { size: "XL", color: "Negro", stockQuantity: 6 },
      ],
    },
    {
      title: "Ascensión Tee - Angel Wings",
      slug: "ascension-tee-angel-wings",
      description: "Camiseta con gráfico de alas de ángel en dorado metálico sobre fondo negro. Algodón orgánico 280gsm. Edición limitada de la colección Ascensión 2026.",
      price: 99000,
      compareAtPrice: 140000,
      sku: "KOP-ASC-AW-007",
      isNew: true,
      isBestseller: false,
      categoryId: categories[0].id, // New Merch
      images: [
        { url: "/images/products/tshirt-angel-7.png", altText: "Ascensión Tee Angel Wings", isPrimary: true },
        { url: "/images/products/tshirt-gothic-1.png", altText: "Ascensión Tee - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 4 },
        { size: "M", color: "Negro", stockQuantity: 9 },
        { size: "L", color: "Negro", stockQuantity: 7 },
        { size: "OS", color: "Negro", stockQuantity: 3 },
      ],
    },
    {
      title: "Basic Essential Tee - Midnight",
      slug: "basic-essential-tee-midnight",
      description: "La camiseta básica perfecta. Algodón peinado 200gsm, corte regular. Ideal para layering o como pieza standalone. Disponible en negro absoluto.",
      price: 55000,
      compareAtPrice: 70000,
      sku: "KOP-BAS-MM-008",
      isNew: false,
      isBestseller: true,
      categoryId: categories[5].id, // Básicos
      images: [
        { url: "/images/products/tshirt-gothic-1.png", altText: "Basic Essential Tee Midnight", isPrimary: true },
        { url: "/images/products/tshirt-pray-4.png", altText: "Basic Essential Tee - Detalle", isPrimary: false },
      ],
      variants: [
        { size: "S", color: "Negro", stockQuantity: 20 },
        { size: "M", color: "Negro", stockQuantity: 30 },
        { size: "L", color: "Negro", stockQuantity: 25 },
        { size: "XL", color: "Negro", stockQuantity: 15 },
        { size: "OS", color: "Negro", stockQuantity: 10 },
      ],
    },
  ];

  // Create all products with their variants and images
  for (const pd of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: pd.slug },
      create: {
        title: pd.title,
        slug: pd.slug,
        description: pd.description,
        price: pd.price,
        compareAtPrice: pd.compareAtPrice,
        sku: pd.sku,
        isActive: true,
        isNew: pd.isNew,
        isBestseller: pd.isBestseller,
        categoryId: pd.categoryId,
        variants: {
          create: pd.variants,
        },
        images: {
          create: pd.images,
        },
      },
      include: { variants: true, images: true },
      update: { title: pd.title },
    });
    console.log(`✓ Created product: ${product.title}`);
  }

  // Create a sample order
  const firstProduct = await prisma.product.findFirst({
    where: { slug: "memento-tee-gothic-cross" },
    include: { variants: true },
  });

  if (firstProduct && firstProduct.variants.length > 0) {
    const variant = firstProduct.variants[1]; // M size
    await prisma.order.create({
      data: {
        userId: admin.id,
        status: "DELIVERED",
        totalAmount: firstProduct.price * 2 + 15000,
        shippingAddress: "Calle 72 #10-45, Bogotá, Cundinamarca",
        customerEmail: admin.email,
        items: {
          create: {
            productVariantId: variant.id,
            quantity: 2,
            priceAtPurchase: firstProduct.price,
          },
        },
      },
    });
    console.log("✓ Created sample order");
  }

  // Create promo codes
  await prisma.promoCode.createMany({
    data: [
      { code: "KOP10", type: "PERCENTAGE", value: 10, minPurchase: 100000, maxUses: 100 },
      { code: "BIENVENIDO", type: "FIXED", value: 15000, minPurchase: 50000, maxUses: 500 },
      { code: "SILVER20", type: "PERCENTAGE", value: 20, minPurchase: 200000 },
    ],
  });
  console.log("✓ Created promo codes");

  // Create product reviews
  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  const hoodie = products.find((p) => p.slug === "sivere-hoodie-mandala");
  const memento = products.find((p) => p.slug === "memento-tee-gothic-cross");
  const cargo = products.find((p) => p.slug === "cargo-pants-tactical-black");
  const angel = products.find((p) => p.slug === "ascension-tee-angel-wings");
  const geometry = products.find((p) => p.slug === "fiat-lux-tee-oracion");

  const reviewData: { productId: string; authorName: string; rating: number; title?: string; comment: string }[] = [
    { productId: hoodie!.id, authorName: "Carlos M.", rating: 5, title: "El mejor hoodie que he tenido", comment: "La calidad del tejido es impresionante, súper pesado y cálido. El diseño del mandala es una obra de arte. Llegó en 3 días a Bogotá." },
    { productId: hoodie!.id, authorName: "Sofía L.", rating: 5, comment: "Compré el negro y queda perfecto. El fit oversizado es justo lo que necesitaba." },
    { productId: hoodie!.id, authorName: "Andrés R.", rating: 4, title: "Muy bueno pero tardó", comment: "Calidad 10/10 pero el envío tardó 5 días. De resto todo perfecto." },
    { productId: memento!.id, authorName: "Valentina P.", rating: 5, comment: "La gráfica gótica es brutal. Ya quiero el de Fiat Lux también." },
    { productId: memento!.id, authorName: "Diego F.", rating: 4, comment: "Buena calidad, talla correcta. Recomendado para quienes buscan estilo oscuro." },
    { productId: cargo!.id, authorName: "Juan D.", rating: 5, title: "Cargo perfecto", comment: "La tela ripstop es de primera. Los bolsillos son enormes, ideal para el día a día." },
    { productId: angel!.id, authorName: "María G.", rating: 5, comment: "Las alas de ángel se ven increíbles. Mucho mejor en persona que en las fotos." },
    { productId: geometry!.id, authorName: "Camilo H.", rating: 4, title: "Diseño único", comment: "La geometría sagrada es muy original. Siento que es una prenda de colección." },
  ];

  for (const r of reviewData) {
    await prisma.review.create({ data: r });
  }
  console.log(`✓ Created ${reviewData.length} reviews`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`Admin: admin@kopstudio.com / admin123`);
  console.log(`User: cliente@kopstudio.com / demo123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());