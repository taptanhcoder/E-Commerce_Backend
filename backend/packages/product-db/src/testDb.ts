// backend/packages/product-db/src/testDb.ts
import { prisma } from "./client.js";

async function main() {
  try {
    const product = await prisma.product.findFirst();

    console.log("Kết quả prisma.product.findFirst():");
    console.log(product);

    if (!product) {
      console.log(" Hiện tại bảng Product chưa có dữ liệu nào.");
    }
  } catch (err) {
    console.error(" Lỗi khi query bằng Prisma:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
