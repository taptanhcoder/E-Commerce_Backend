import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🟢 Seeding database...");

  // 🔹 Xóa product trước rồi mới xóa category (tránh lỗi FK)
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("✅ Đã xóa dữ liệu cũ");

  // 1) Seed Category (match với list ở frontend, bỏ icon)
  const categories = [
    { name: "All", slug: "all" },
    { name: "T-shirts", slug: "t-shirts" },
    { name: "Shoes", slug: "shoes" },
    { name: "Accessories", slug: "accessories" },
    { name: "Bags", slug: "bags" },
    { name: "Dresses", slug: "dresses" },
    { name: "Jackets", slug: "jackets" },
    { name: "Gloves", slug: "gloves" },
  ];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log("✅ Seed Category xong");

  // 2) Seed Product (đúng theo data bạn đưa + thêm categorySlug)
  const products = [
    {
      name: "Adidas CoreFit T-Shirt",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 39.9, // ⚠ nếu schema dùng Int thì đổi thành 3990 hoặc sửa schema sang Decimal
      sizes: ["s", "m", "l", "xl", "xxl"],
      colors: ["gray", "purple", "green"],
      images: {
        gray: "/products/1g.png",
        purple: "/products/1p.png",
        green: "/products/1gr.png",
      },
      categorySlug: "t-shirts",
    },
    {
      name: "Puma Ultra Warm Zip",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 59.9,
      sizes: ["s", "m", "l", "xl"],
      colors: ["gray", "green"],
      images: {
        gray: "/products/2g.png",
        green: "/products/2gr.png",
      },
      categorySlug: "jackets",
    },
    {
      name: "Nike Air Essentials Pullover",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 69.9,
      sizes: ["s", "m", "l"],
      colors: ["green", "blue", "black"],
      images: {
        green: "/products/3gr.png",
        blue: "/products/3b.png",
        black: "/products/3bl.png",
      },
      categorySlug: "jackets",
    },
    {
      name: "Nike Dri Flex T-Shirt",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 29.9,
      sizes: ["s", "m", "l"],
      colors: ["white", "pink"],
      images: {
        white: "/products/4w.png",
        pink: "/products/4p.png",
      },
      categorySlug: "t-shirts",
    },
    {
      name: "Under Armour StormFleece",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 49.9,
      sizes: ["s", "m", "l"],
      colors: ["red", "orange", "black"],
      images: {
        red: "/products/5r.png",
        orange: "/products/5o.png",
        black: "/products/5bl.png",
      },
      categorySlug: "jackets",
    },
    {
      name: "Nike Air Max 270",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 59.9,
      sizes: ["40", "42", "43", "44"],
      colors: ["gray", "white"],
      images: {
        gray: "/products/6g.png",
        white: "/products/6w.png",
      },
      categorySlug: "shoes",
    },
    {
      name: "Nike Ultraboost Pulse",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 69.9,
      sizes: ["40", "42", "43"],
      colors: ["gray", "pink"],
      images: {
        gray: "/products/7g.png",
        pink: "/products/7p.png",
      },
      categorySlug: "shoes",
    },
    {
      name: "Levi’s Classic Denim",
      shortDescription:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      description:
        "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
      price: 59.9,
      sizes: ["s", "m", "l"],
      colors: ["blue", "green"],
      images: {
        blue: "/products/8b.png",
        green: "/products/8gr.png",
      },
      categorySlug: "dresses", // hoặc tạo thêm category "pants" nếu schema cho phép
    },
  ];

  await prisma.product.createMany({
    data: products,
  });

  console.log("✅ Seed Product xong");
}

main()
  .then(async () => {
    console.log("🎉 Seeding hoàn tất!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Lỗi khi seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
