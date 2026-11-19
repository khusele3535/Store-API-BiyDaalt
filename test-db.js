const prisma = require("./src/db");

async function main() {
  const count = await prisma.category.count();

  console.log("Database connected successfully!");
  console.log("Total categories:", count);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });