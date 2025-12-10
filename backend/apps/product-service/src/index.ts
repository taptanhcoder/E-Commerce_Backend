import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route.js";
import categoryRouter from "./routes/category.route.js";
import { consumer, producer } from "./utils/kafka.js";

const app = express();

/**
 * CORS config:
 * - Đọc origin từ env CORS_ORIGINS (phân tách bằng dấu phẩy)
 * - Nếu không có, fallback cho dev: localhost:3002 (client), localhost:3003 (admin)
 *
 * Ví dụ trên Azure:
 *   CORS_ORIGINS=https://ecom-client.azurewebsites.net,https://ecom-admin.azurewebsites.net
 */
const allowedOriginsEnv = process.env.CORS_ORIGINS ?? "";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

const defaultOrigins = ["http://localhost:3002", "http://localhost:3003"];
const whitelist = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Request không có Origin (server-to-server, Postman, curl, health check) -> cho qua
      if (!origin) {
        return callback(null, true);
      }

      if (whitelist.includes(origin)) {
        return callback(null, true);
      }

      // Origin không nằm trong whitelist -> bị chặn CORS
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
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
    // Connect Kafka (nếu Aiven đang dùng), giữ nguyên logic cũ nhưng nhớ await Promise.all
    await Promise.all([producer.connect(), consumer.connect()]);

    // Azure inject biến PORT, local fallback 8000
    const port = process.env.PORT ? Number(process.env.PORT) : 8000;

    app.listen(port, () => {
      console.log(`product service is running on port ${port}`);
      console.log("CORS whitelist:", whitelist);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
