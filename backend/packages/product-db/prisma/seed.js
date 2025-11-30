// prisma/seed.js
import "dotenv/config";
import pkg from "pg";

const { Client } = pkg;

async function main() {
  console.log("🌱 Seeding database with raw SQL (pg)...");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  // 1) Xóa dữ liệu cũ
  await client.query('DELETE FROM "Product";');
  await client.query('DELETE FROM "Category";');

  // 2) 10 Category mẫu
  await client.query(`
    INSERT INTO "Category" ("name", "slug")
    VALUES
      ('T-Shirts',            't-shirts'),
      ('Shoes',               'shoes'),
      ('Accessories',         'accessories'),
      ('Hoodies & Sweatshirts','hoodies'),
      ('Pants & Jeans',       'pants'),
      ('Jackets & Coats',     'jackets'),
      ('Hats & Caps',         'hats'),
      ('Bags & Backpacks',    'bags'),
      ('Socks',               'socks'),
      ('Sportswear',          'sportswear');
  `);

  // 3) 10 Product mẫu (mỗi cái gắn với 1 category)
  await client.query(`
    INSERT INTO "Product"
      ("name", "shortDescription", "description", "price",
       "sizes", "colors", "images", "categorySlug",
       "createdAt", "updatedAt")
    VALUES
      (
        'Basic White T-Shirt',
        'Áo thun trắng basic, chất cotton thoáng mát',
        'Áo thun trắng form regular, chất liệu 100% cotton, phù hợp mặc hằng ngày.',
        199000,
        ARRAY['S','M','L','XL']::text[],
        ARRAY['white']::text[],
        '["https://example.com/images/white-tshirt-front.jpg","https://example.com/images/white-tshirt-back.jpg"]'::jsonb,
        't-shirts',
        NOW(), NOW()
      ),
      (
        'Oversized Black T-Shirt',
        'Áo thun đen form rộng, phong cách streetwear',
        'Áo thun đen oversize, chất cotton dày dặn, phù hợp đi chơi, dạo phố.',
        249000,
        ARRAY['M','L','XL']::text[],
        ARRAY['black']::text[],
        '["https://example.com/images/black-oversized-tshirt-1.jpg"]'::jsonb,
        't-shirts',
        NOW(), NOW()
      ),
      (
        'Running Shoes Pro',
        'Giày chạy bộ đệm êm, phù hợp luyện tập',
        'Giày chạy bộ với đế đệm êm, phù hợp chạy bộ và tập luyện cường độ cao.',
        899000,
        ARRAY['39','40','41','42','43']::text[],
        ARRAY['black','blue']::text[],
        '["https://example.com/images/running-shoes-1.jpg","https://example.com/images/running-shoes-2.jpg"]'::jsonb,
        'shoes',
        NOW(), NOW()
      ),
      (
        'Casual White Sneakers',
        'Giày sneaker trắng dễ phối đồ',
        'Sneaker trắng đế bằng, thiết kế tối giản, phù hợp nhiều phong cách khác nhau.',
        759000,
        ARRAY['38','39','40','41','42']::text[],
        ARRAY['white']::text[],
        '["https://example.com/images/white-sneakers-1.jpg"]'::jsonb,
        'shoes',
        NOW(), NOW()
      ),
      (
        'Leather Belt',
        'Thắt lưng da công sở',
        'Thắt lưng da bò cao cấp, thiết kế đơn giản, phù hợp môi trường công sở.',
        359000,
        ARRAY['S','M','L']::text[],
        ARRAY['brown','black']::text[],
        '["https://example.com/images/leather-belt-1.jpg"]'::jsonb,
        'accessories',
        NOW(), NOW()
      ),
      (
        'Minimal Silver Bracelet',
        'Vòng tay bạc tối giản',
        'Vòng tay bạc phong cách tối giản, dễ kết hợp với đồng hồ hoặc phụ kiện khác.',
        459000,
        ARRAY['One Size']::text[],
        ARRAY['silver']::text[],
        '["https://example.com/images/silver-bracelet-1.jpg"]'::jsonb,
        'accessories',
        NOW(), NOW()
      ),
      (
        'Grey Fleece Hoodie',
        'Hoodie nỉ xám ấm áp',
        'Hoodie nỉ bông bên trong, giữ ấm tốt, thích hợp thời tiết se lạnh.',
        549000,
        ARRAY['S','M','L','XL']::text[],
        ARRAY['grey']::text[],
        '["https://example.com/images/grey-hoodie-1.jpg"]'::jsonb,
        'hoodies',
        NOW(), NOW()
      ),
      (
        'Slim Fit Jeans',
        'Quần jeans slim fit co giãn nhẹ',
        'Quần jeans slim fit với chất liệu denim co giãn, tạo cảm giác thoải mái khi vận động.',
        499000,
        ARRAY['28','29','30','31','32','33']::text[],
        ARRAY['dark-blue']::text[],
        '["https://example.com/images/slim-jeans-1.jpg"]'::jsonb,
        'pants',
        NOW(), NOW()
      ),
      (
        'Lightweight Windbreaker Jacket',
        'Áo khoác gió mỏng, chống gió nhẹ',
        'Áo khoác gió chất liệu mỏng nhẹ, chống gió, dễ gấp gọn mang theo.',
        629000,
        ARRAY['M','L','XL']::text[],
        ARRAY['navy','black']::text[],
        '["https://example.com/images/windbreaker-1.jpg"]'::jsonb,
        'jackets',
        NOW(), NOW()
      ),
      (
        'Sports Training Set',
        'Bộ đồ thể thao co giãn, thấm hút mồ hôi',
        'Bộ đồ thể thao gồm áo + quần short, chất liệu co giãn, thấm hút mồ hôi tốt.',
        399000,
        ARRAY['S','M','L','XL']::text[],
        ARRAY['black','red']::text[],
        '["https://example.com/images/sports-set-1.jpg"]'::jsonb,
        'sportswear',
        NOW(), NOW()
      );
  `);

  await client.end();

  console.log("✅ Seed completed (raw SQL)!");
}

main().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
