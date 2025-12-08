// backend/apps/payment-service/src/index.ts
import { serve } from "@hono/node-server";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import sessionRoute from "./routes/session.route.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();

// Middleware Clerk cho tất cả route
app.use("*", clerkMiddleware());

// Chuẩn bị danh sách origin được phép từ env CORS_ORIGINS
// Ví dụ: CORS_ORIGINS=https://client.azurewebsites.net,https://admin.azurewebsites.net
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

// CORS cho tất cả route
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // Nếu request không có Origin (server-to-server, webhook Stripe, v.v.) → cho qua, không set CORS đặc biệt
      if (!origin) return origin;

      // Nếu chưa cấu hình CORS_ORIGINS → fallback cho dev: cho phép localhost 3002/3003
      const defaultOrigins = ["http://localhost:3002", "http://localhost:3003"];

      const whitelist =
        allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

      // Nếu origin nằm trong whitelist → trả lại origin (hono sẽ set Access-Control-Allow-Origin = origin đó)
      if (whitelist.includes(origin)) {
        return origin;
      }

      // Không cho phép origin khác → trả null (hono sẽ không set header CORS cho origin này)
      return null;
    },
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

const start = async () => {
  try {
    // Giữ nguyên cách connect Kafka như cũ để không ảnh hưởng logic
    Promise.all([await producer.connect(), await consumer.connect()]);
    await runKafkaSubscriptions();

    // Đọc PORT từ env (Azure), fallback = 8002 khi dev local
    const PORT = Number(process.env.PORT) || 8002;

    serve(
      {
        fetch: app.fetch,
        port: PORT,
      },
      () => {
        console.log(`payment service is running on port ${PORT}`);
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
