const prisma = require("../src/db");

async function main() {
  console.log("Starting Store API seed...");

  // 1. Categories
  const categoryNames = [
    "Electronics",
    "Clothing",
    "Home",
    "Beauty",
    "Sports",
  ];

  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    categories.push(category);
  }

  // 2. Brands
  const brandData = [
    { name: "Samsung", foundedYear: 1938 },
    { name: "Apple", foundedYear: 1976 },
    { name: "Nike", foundedYear: 1964 },
    { name: "Adidas", foundedYear: 1949 },
    { name: "Sony", foundedYear: 1946 },
    { name: "Xiaomi", foundedYear: 2010 },
  ];

  const brands = [];

  for (const brand of brandData) {
    let existing = await prisma.brand.findFirst({
      where: { name: brand.name },
    });

    if (!existing) {
      existing = await prisma.brand.create({
        data: brand,
      });
    }

    brands.push(existing);
  }

  // 3. Products
  for (let i = 1; i <= 25; i++) {
    const title = `Store Product ${i}`;

    let product = await prisma.product.findFirst({
      where: { title },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          title,
          price: 15000 + i * 5000,
          stock: i * 3,
          description: `Description for product ${i}`,
          isAvailable: i % 5 !== 0,
          categoryId: categories[(i - 1) % categories.length].id,
          brandId:
            i <= 3
              ? null
              : brands[(i - 4) % brands.length].id,
        },
      });
    }

    // 4. Reviews: 60 total
    const reviewCount = i <= 10 ? 3 : 2;

    for (let j = 1; j <= reviewCount; j++) {
      await prisma.review.upsert({
        where: {
          productId_authorName: {
            productId: product.id,
            authorName: `Customer ${j}`,
          },
        },
        update: {},
        create: {
          productId: product.id,
          authorName: `Customer ${j}`,
          rating: ((i + j) % 5) + 1,
          comment: `Review ${j} for ${title}`,
        },
      });
    }
  }

  console.log("Seed completed successfully!");

  console.log({
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    products: await prisma.product.count(),
    reviews: await prisma.review.count(),
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });