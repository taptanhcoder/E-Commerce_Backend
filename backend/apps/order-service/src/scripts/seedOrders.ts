
import "dotenv/config";
import { connectOrderDB, Order } from "@repo/order-db";

type OrderStatus = "success" | "failed";

interface SeedOrder {
  userId: string;
  email: string;
  amount: number;
  status: OrderStatus;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const seedData: SeedOrder[] = [
  {
    userId: "user_001",
    email: "user1@example.com",
    amount: 250_000,
    status: "success",
    products: [
      { name: "Product A", quantity: 1, price: 100_000 },
      { name: "Product B", quantity: 3, price: 50_000 },
    ],
  },
  {
    userId: "user_002",
    email: "user2@example.com",
    amount: 150_000,
    status: "failed",
    products: [
      { name: "Product C", quantity: 2, price: 75_000 },
    ],
  },
];

const main = async () => {
  try {

    await connectOrderDB();



    const result = await Order.insertMany(seedData);
    console.log(`Đã seed ${result.length} orders vào MongoDB`);

    process.exit(0);
  } catch (err) {
    console.error("Lỗi khi seed orders:", err);
    process.exit(1);
  }
};

main();
