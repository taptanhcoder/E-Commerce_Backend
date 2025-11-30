
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
  console.log(" Seeding database...");

  // 1) Seed Category (15 dòng)
  const categories = [
    { name: "Đồ thể thao", slug: "sportswear" },
    { name: "Áo thun nam", slug: "men-tshirt" },
    { name: "Áo khoác nữ", slug: "women-jacket" },
    { name: "Giày chạy bộ", slug: "running-shoes" },
    { name: "Phụ kiện", slug: "accessories" },
    { name: "Đồ mặc nhà", slug: "homewear" },
    { name: "Đồ công sở", slug: "officewear" },
    { name: "Áo sơ mi nam", slug: "men-shirt" },
    { name: "Váy nữ", slug: "women-dress" },
    { name: "Đồ trẻ em", slug: "kids-clothing" },
    { name: "Đồ tập gym", slug: "gymwear" },
    { name: "Đồ yoga", slug: "yoga-wear" },
    { name: "Đồ bơi", slug: "swimwear" },
    { name: "Đồ lót", slug: "underwear" },
    { name: "Áo khoác nam", slug: "men-jacket" }
  ];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log(" Seed Category xong");


  const products = [
    {
      name: "Sports Training Set",
      shortDescription: "Bộ đồ thể thao co giãn, thấm hút mồ hôi",
      description:
        "Bộ đồ thể thao gồm áo + quần short, chất liệu co giãn, thấm hút mồ hôi tốt. Phù hợp tập gym, chạy bộ.",
      price: 399000,
      sizes: ["S", "M", "L", "XL"],
      colors: ["black", "red"],
      images: {
        black: ["https://example.com/images/sports-set-black.jpg"],
        red: ["https://example.com/images/sports-set-red.jpg"],
      },
      categorySlug: "sportswear",
    },
    {
      name: "Áo thun nam basic",
      shortDescription: "Áo thun cotton 100%, form regular",
      description:
        "Áo thun nam chất liệu cotton 100%, thấm hút mồ hôi tốt, form regular, dễ phối đồ hằng ngày.",
      price: 199000,
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "black", "navy"],
      images: {
        white: ["https://example.com/images/men-tshirt-basic-white.jpg"],
        black: ["https://example.com/images/men-tshirt-basic-black.jpg"],
        navy: ["https://example.com/images/men-tshirt-basic-navy.jpg"],
      },
      categorySlug: "men-tshirt",
    },
    {
      name: "Áo thun nam oversize",
      shortDescription: "Áo thun form rộng, phong cách streetwear",
      description:
        "Áo thun nam form rộng, chất cotton dày dặn, phù hợp phong cách streetwear hiện đại.",
      price: 249000,
      sizes: ["M", "L", "XL"],
      colors: ["black", "gray"],
      images: {
        black: ["https://example.com/images/men-tshirt-oversize-black.jpg"],
        gray: ["https://example.com/images/men-tshirt-oversize-gray.jpg"],
      },
      categorySlug: "men-tshirt",
    },
    {
      name: "Áo khoác gió nữ dáng rộng",
      shortDescription: "Áo khoác gió nữ oversize, chống nước nhẹ",
      description:
        "Áo khoác gió nữ dáng rộng, chống nước nhẹ, có mũ trùm, phù hợp đi chơi, đi làm.",
      price: 459000,
      sizes: ["S", "M", "L"],
      colors: ["beige", "black"],
      images: {
        beige: ["https://example.com/images/women-jacket-oversize-beige.jpg"],
        black: ["https://example.com/images/women-jacket-oversize-black.jpg"],
      },
      categorySlug: "women-jacket",
    },
    {
      name: "Áo khoác jeans nữ",
      shortDescription: "Áo khoác jeans nữ form regular",
      description:
        "Áo khoác jeans nữ chất liệu denim bền, form regular, dễ phối với váy hoặc quần jeans.",
      price: 499000,
      sizes: ["S", "M", "L"],
      colors: ["blue"],
      images: {
        blue: ["https://example.com/images/women-jeans-jacket-blue.jpg"],
      },
      categorySlug: "women-jacket",
    },
    {
      name: "Giày chạy bộ nam ComfortRun",
      shortDescription: "Giày chạy bộ đệm êm, nhẹ",
      description:
        "Giày chạy bộ nam với đệm êm, trọng lượng nhẹ, phù hợp chạy bộ hằng ngày và tập luyện.",
      price: 799000,
      sizes: ["40", "41", "42", "43"],
      colors: ["black", "blue"],
      images: {
        black: ["https://example.com/images/running-shoes-men-black.jpg"],
        blue: ["https://example.com/images/running-shoes-men-blue.jpg"],
      },
      categorySlug: "running-shoes",
    },
    {
      name: "Giày chạy bộ nữ LightStep",
      shortDescription: "Giày chạy bộ nữ siêu nhẹ",
      description:
        "Giày chạy bộ nữ với thiết kế siêu nhẹ, thoáng khí, hỗ trợ bàn chân tốt khi vận động.",
      price: 759000,
      sizes: ["36", "37", "38", "39"],
      colors: ["pink", "white"],
      images: {
        pink: ["https://example.com/images/running-shoes-women-pink.jpg"],
        white: ["https://example.com/images/running-shoes-women-white.jpg"],
      },
      categorySlug: "running-shoes",
    },
    {
      name: "Balo thể thao đa năng",
      shortDescription: "Balo thể thao dung tích lớn",
      description:
        "Balo thể thao dung tích lớn, nhiều ngăn, có ngăn riêng cho giày, phù hợp đi tập gym hoặc du lịch ngắn ngày.",
      price: 359000,
      sizes: [],
      colors: ["black"],
      images: {
        black: ["https://example.com/images/sports-backpack-black.jpg"],
      },
      categorySlug: "accessories",
    },
    {
      name: "Nón lưỡi trai basic",
      shortDescription: "Nón lưỡi trai unisex, đơn giản",
      description:
        "Nón lưỡi trai unisex với thiết kế đơn giản, dễ phối đồ, phù hợp đi chơi, đi dạo.",
      price: 129000,
      sizes: [],
      colors: ["black", "white"],
      images: {
        black: ["https://example.com/images/cap-basic-black.jpg"],
        white: ["https://example.com/images/cap-basic-white.jpg"],
      },
      categorySlug: "accessories",
    },
    {
      name: "Bộ đồ ngủ cotton",
      shortDescription: "Bộ đồ ngủ cotton thoáng mát",
      description:
        "Bộ đồ ngủ cotton tay ngắn, quần short, chất liệu mềm mại, dễ chịu khi ngủ.",
      price: 279000,
      sizes: ["S", "M", "L"],
      colors: ["pink", "gray"],
      images: {
        pink: ["https://example.com/images/homewear-set-pink.jpg"],
        gray: ["https://example.com/images/homewear-set-gray.jpg"],
      },
      categorySlug: "homewear",
    },
    {
      name: "Áo sơ mi nam công sở",
      shortDescription: "Áo sơ mi nam tay dài, kiểu dáng lịch sự",
      description:
        "Áo sơ mi nam tay dài, form slim fit, chất liệu ít nhăn, phù hợp môi trường công sở.",
      price: 349000,
      sizes: ["M", "L", "XL"],
      colors: ["white", "light-blue"],
      images: {
        white: ["https://example.com/images/men-shirt-office-white.jpg"],
        "light-blue": [
          "https://example.com/images/men-shirt-office-lightblue.jpg",
        ],
      },
      categorySlug: "men-shirt",
    },
    {
      name: "Quần tây nam",
      shortDescription: "Quần tây nam công sở, ống đứng",
      description:
        "Quần tây nam công sở, ống đứng, chất liệu ít nhăn, dễ phối với áo sơ mi, áo vest.",
      price: 399000,
      sizes: ["M", "L", "XL"],
      colors: ["black"],
      images: {
        black: ["https://example.com/images/men-office-pants-black.jpg"],
      },
      categorySlug: "officewear",
    },
    {
      name: "Váy chữ A basic",
      shortDescription: "Váy chữ A đơn giản, dễ phối",
      description:
        "Váy chữ A dáng ngắn, phù hợp đi làm hoặc đi chơi, dễ phối với áo sơ mi hoặc áo thun.",
      price: 329000,
      sizes: ["S", "M", "L"],
      colors: ["black", "beige"],
      images: {
        black: ["https://example.com/images/women-skirt-a-black.jpg"],
        beige: ["https://example.com/images/women-skirt-a-beige.jpg"],
      },
      categorySlug: "women-dress",
    },
    {
      name: "Quần legging tập gym",
      shortDescription: "Quần legging co giãn, ôm body",
      description:
        "Quần legging nữ co giãn tốt, ôm body, phù hợp tập gym, yoga, chạy bộ.",
      price: 259000,
      sizes: ["S", "M", "L"],
      colors: ["black"],
      images: {
        black: ["https://example.com/images/gym-leggings-black.jpg"],
      },
      categorySlug: "gymwear",
    },
    {
      name: "Áo bra thể thao",
      shortDescription: "Áo bra thể thao nâng đỡ tốt",
      description:
        "Áo bra thể thao với khả năng nâng đỡ tốt, chất liệu mềm mại, thấm hút mồ hôi.",
      price: 219000,
      sizes: ["S", "M", "L"],
      colors: ["black", "purple"],
      images: {
        black: ["https://example.com/images/sports-bra-black.jpg"],
        purple: ["https://example.com/images/sports-bra-purple.jpg"],
      },
      categorySlug: "gymwear",
    }
  ];

  await prisma.product.createMany({
    data: products,
  });

  console.log(" Seed Product xong");
}

main()
  .then(async () => {
    console.log("Seeding hoàn tất!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(" Lỗi khi seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
