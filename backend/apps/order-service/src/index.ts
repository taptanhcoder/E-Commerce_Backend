import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { shouldBeUser } from "./middleware/authMiddleware.js";
import { orderRoute } from "./routes/order.js";
import { connectOrderDB } from "@repo/order-db";
import { consumer, producer } from "./utils/kafka.js";

const PORT = 8001;

const fastify = Fastify({ logger: true });

// Clerk auth
await fastify.register(clerkPlugin);

// Swagger / OpenAPI
await fastify.register(swagger, {
  openapi: {
    info: {
      title: "ShopHub Order Service API",
      version: "1.0.0",
      description: "Orders endpoints + event-driven order creation",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: "/api/doc",
});

fastify.get("/api/doc.json", async () => fastify.swagger());

fastify.get("/health", async (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get(
  "/test",
  {
    preHandler: shouldBeUser,
    schema: {
      tags: ["System"],
      summary: "Test auth-protected route (User)",
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            userId: { type: "string" },
          },
        },
      },
    },
  },
  async (request: any, reply) => {
    return reply.send({
      message: "order service is authenticated!",
      userId: request.userId,
    });
  }
);

// Register routes (you can add schemas inside route files later for richer docs)
fastify.register(orderRoute);

const start = async () => {
  try {
    await connectOrderDB();
    await producer.connect();
    await consumer.connect();

    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Order service is running on port ${PORT}`);
    console.log(`swagger docs: http://localhost:${PORT}/api/doc`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
