import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route";
import { producer } from "./utils/kafka.js";

const app = express();

// Lấy origin từ env CORS_ORIGINS, fallback = localhost:3003 cho dev
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3003"];

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

// Bảo vệ toàn bộ /users bằng shouldBeAdmin
app.use("/users", shouldBeAdmin, userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "server error!" });
});

const start = async () => {
  try {
    await producer.connect();

    // Đọc PORT từ env (Azure), fallback = 8003 khi dev local
    const PORT = Number(process.env.PORT) || 8003;

    app.listen(PORT, () => {
      console.log(`auth service is running on ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
