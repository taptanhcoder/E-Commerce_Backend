import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import { consumer, producer } from "./utils/kafka.js";

const app = express();

// Lấy danh sách origin cho phép từ env CORS_ORIGINS (phân tách bằng dấu phẩy).
// Ví dụ: CORS_ORIGINS=https://client.azurewebsites.net,https://admin.azurewebsites.net
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3002", "http://localhost:3003"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.get("/test", shouldBeUser, (req: Request, res: Response) => {
  res.json({ message: "product service authenticated", userId: req.userId });
});

app.use("/products", productRouter);
app.use("/categories", categoryRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    // Giữ nguyên cách connect Kafka như cũ để tránh ảnh hưởng logic.
    Promise.all([await producer.connect(), await consumer.connect()]);

    // Đọc PORT từ env (Azure sẽ set), fallback = 8000 khi dev local.
    const PORT = Number(process.env.PORT) || 8000;

    app.listen(PORT, () => {
      console.log(`product service is running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
