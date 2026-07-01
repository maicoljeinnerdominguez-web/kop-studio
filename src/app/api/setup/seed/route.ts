import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

// This endpoint seeds the database with initial data.
// Visit /api/setup/seed ONCE after deployment to load products.
// It is safe to run multiple times (uses upsert for products).

export async function GET() {
  try {
    // Check if database is reachable
    await db.$queryRaw`SELECT 1`;

    // Create admin user
    const admin = await db.user.upsert({
      where: { email: "admin@kopstudio.com" },
      update: {},
      create: {
        name: "Admin KOP",
        email: "admin@kopstudio.com",
        passwordHash: await hash("admin123", 10),
        role: "ADMIN",
      },
    });

    // Create demo user
    await db.user.upsert({
      where: { email: "cliente@kopstudio.com" },
      update: {},
      create: {
        name: "Cliente Demo",
        email: "cliente@kopstudio.com",
        passwordHash: await hash("demo123", 10),
        role: "USER",
      },
    });

    // Create categories
    const catMap: Record<string, string> = {};
    const categories = [
      { name: "New Merch", slug: "new-merch" },
      { name: "Bestsellers", slug: "bestsellers" },
      { name: "Total Looks", slug: "total-looks" },
      { name: "Camisetas", slug: "camisetas" },
      { name: "Inferiores", slug: "inferiores" },
      { name: "Basicos", slug: "basicos" },
      { name: "Accesorios", slug: "accesorios" },
      { name: "Descuentos", slug: "descuentos" },
    ];

    for (const cat of categories) {
      const created = await db.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      catMap[cat.slug] = created.id;
    }

    // Products
    const productsData = [
      {
        title: "Memento Tee - Gothic Cross",
        slug: "memento-tee-gothic-cross",
        description:
          "Camiseta oversized con grafico de cruz gotica impreso en serigrafia de alta calidad. Algodon premium 240gsm, corte relajado urbano.",
        price: 89000,
        compareAtPrice: 120000,
        sku: "KOP-MNT-GC-001",
        isNew: true,
        isBestseller: true,
        categorySlug: "camisetas",
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
        description:
          "Sudadera con capucha y grafico de mandala sagrado en espalda. Tela polar de alto gramaje, interior cepillado.",
        price: 165000,
        compareAtPrice: null,
        sku: "KOP-SVR-MN-002",
        isNew: true,
        isBestseller: true,
        categorySlug: "new-merch",
        images: [
          { url: "/images/products/hoodie-mandala-2.png", altText: "Sivere Hoodie Mandala - Frontal", isPrimary: true },
          { url: "/images/products/hoodie-mandala-new.png", altText: "Sivere Hoodie Mandala - Espalda", isPrimary: false },
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
        description:
          "Pantalon cargo de corte amplio con multiples bolsillos funcionales. Tela ripstop resistente.",
        price: 135000,
        compareAtPrice: 175000,
        sku: "KOP-CRG-TB-003",
        isNew: false,
        isBestseller: true,
        categorySlug: "inferiores",
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
        title: "Fiat Lux Tee - Oracion",
        slug: "fiat-lux-tee-oracion",
        description:
          "Camiseta con grafico de manos en oracion y texto Fiat Lux. Impresion DTG de alta resolucion.",
        price: 79000,
        compareAtPrice: 95000,
        sku: "KOP-FLX-OR-004",
        isNew: false,
        isBestseller: false,
        categorySlug: "camisetas",
        images: [
          { url: "/images/products/tshirt-pray-4.png", altText: "Fiat Lux Tee Oracion - Frontal", isPrimary: true },
          { url: "/images/products/tshirt-oracion.png", altText: "Fiat Lux Tee Oracion - Detalle", isPrimary: false },
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
        description:
          "Bolsa puffer con textura acolchada y correa de cadena metalica. Cierre magnetico.",
        price: 65000,
        compareAtPrice: null,
        sku: "KOP-PBG-CE-005",
        isNew: true,
        isBestseller: false,
        categorySlug: "accesorios",
        images: [
          { url: "/images/products/puffer-bag-5.png", altText: "Puffer Bag Urban Chain", isPrimary: true },
          { url: "/images/products/puffer-bag-chain.png", altText: "Puffer Bag - Detalle", isPrimary: false },
        ],
        variants: [{ size: "OS", color: "Negro", stockQuantity: 15 }],
      },
      {
        title: "Jogger Obsidian - Minimal Street",
        slug: "jogger-obsidian-minimal",
        description:
          "Jogger de algodon pique con acabado minimalista. Cintura elastica con cordon ajustable.",
        price: 95000,
        compareAtPrice: null,
        sku: "KOP-JOG-MS-006",
        isNew: false,
        isBestseller: false,
        categorySlug: "basicos",
        images: [
          { url: "/images/products/jogger-6.png", altText: "Jogger Obsidian Minimal", isPrimary: true },
          { url: "/images/products/jogger-basic.png", altText: "Jogger Obsidian - Detalle", isPrimary: false },
        ],
        variants: [
          { size: "S", color: "Negro", stockQuantity: 8 },
          { size: "M", color: "Negro", stockQuantity: 14 },
          { size: "L", color: "Negro", stockQuantity: 10 },
          { size: "XL", color: "Negro", stockQuantity: 6 },
        ],
      },
      {
        title: "Ascension Tee - Angel Wings",
        slug: "ascension-tee-angel-wings",
        description:
          "Camiseta con grafico de alas de angel en dorado metalico sobre fondo negro. Edicion limitada.",
        price: 99000,
        compareAtPrice: 140000,
        sku: "KOP-ASC-AW-007",
        isNew: true,
        isBestseller: false,
        categorySlug: "new-merch",
        images: [
          { url: "/images/products/tshirt-angel-7.png", altText: "Ascension Tee Angel Wings", isPrimary: true },
          { url: "/images/products/tshirt-angel-wings.png", altText: "Ascension Tee - Detalle", isPrimary: false },
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
        description:
          "La camiseta basica perfecta. Algodon peinado 200gsm, corte regular.",
        price: 55000,
        compareAtPrice: 70000,
        sku: "KOP-BAS-MM-008",
        isNew: false,
        isBestseller: true,
        categorySlug: "basicos",
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

    // Create products with variants and images
    let productCount = 0;
    for (const pd of productsData) {
      const existing = await db.product.findUnique({ where: { slug: pd.slug } });

      if (!existing) {
        await db.product.create({
          data: {
            title: pd.title,
            slug: pd.slug,
            description: pd.description,
            price: pd.price,
            compareAtPrice: pd.compareAtPrice,
            sku: pd.sku,
            isActive: true,
            isNew: pd.isNew,
            isBestseller: pd.isBestseller,
            categoryId: catMap[pd.categorySlug],
            variants: { create: pd.variants },
            images: { create: pd.images },
          },
        });
        productCount++;
      } else {
        productCount++;
      }
    }

    // Promo codes
    const promoCodes = [
      { code: "KOP10", type: "PERCENTAGE", value: 10, minPurchase: 100000, maxUses: 100 },
      { code: "BIENVENIDO", type: "FIXED", value: 15000, minPurchase: 50000, maxUses: 500 },
      { code: "SILVER20", type: "PERCENTAGE", value: 20, minPurchase: 200000 },
    ];

    for (const pc of promoCodes) {
      await db.promoCode.upsert({
        where: { code: pc.code },
        update: {},
        create: pc,
      });
    }

    // Reviews
    const reviewsData = [
      { productSlug: "sivere-hoodie-mandala", authorName: "Carlos M.", rating: 5, title: "El mejor hoodie que he tenido", comment: "La calidad del tejido es impresionante, super pesado y calido." },
      { productSlug: "sivere-hoodie-mandala", authorName: "Sofia L.", rating: 5, comment: "Compre el negro y queda perfecto." },
      { productSlug: "sivere-hoodie-mandala", authorName: "Andres R.", rating: 4, title: "Muy bueno pero tardo", comment: "Calidad 10/10 pero el envio tardo 5 dias." },
      { productSlug: "memento-tee-gothic-cross", authorName: "Valentina P.", rating: 5, comment: "La grafica gotica es brutal." },
      { productSlug: "memento-tee-gothic-cross", authorName: "Diego F.", rating: 4, comment: "Buena calidad, talla correcta." },
      { productSlug: "cargo-pants-tactical-black", authorName: "Juan D.", rating: 5, title: "Cargo perfecto", comment: "La tela ripstop es de primera." },
      { productSlug: "ascension-tee-angel-wings", authorName: "Maria G.", rating: 5, comment: "Las alas de angel se ven increibles." },
      { productSlug: "fiat-lux-tee-oracion", authorName: "Camilo H.", rating: 4, title: "Diseno unico", comment: "La geometria sagrada es muy original." },
    ];

    for (const r of reviewsData) {
      const product = await db.product.findUnique({ where: { slug: r.productSlug } });
      if (product) {
        const existing = await db.review.findFirst({
          where: { productId: product.id, authorName: r.authorName },
        });
        if (!existing) {
          await db.review.create({
            data: {
              productId: product.id,
              authorName: r.authorName,
              rating: r.rating,
              title: r.title || null,
              comment: r.comment,
              isVerified: false,
            },
          });
        }
      }
    }

    // Sample order for admin
    const mementoProduct = await db.product.findUnique({
      where: { slug: "memento-tee-gothic-cross" },
      include: { variants: true },
    });
    if (mementoProduct && mementoProduct.variants.length > 0) {
      const existingOrder = await db.order.findFirst({
        where: { userId: admin.id },
      });
      if (!existingOrder && mementoProduct.variants.length > 1) {
        await db.order.create({
          data: {
            userId: admin.id,
            status: "DELIVERED",
            totalAmount: mementoProduct.price * 2 + 15000,
            shippingAddress: "Calle 72 #10-45, Bogota, Cundinamarca",
            customerEmail: admin.email,
            items: {
              create: {
                productVariantId: mementoProduct.variants[1].id,
                quantity: 2,
                priceAtPurchase: mementoProduct.price,
              },
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        users: 2,
        categories: categories.length,
        products: productsData.length,
        promoCodes: promoCodes.length,
        reviews: reviewsData.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}