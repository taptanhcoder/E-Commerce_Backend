import { serve } from "@hono/node-server";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import swaggerUiDist from "swagger-ui-dist";

import sessionRoute from "./routes/session.route.js";
import webhookRoute from "./routes/webhooks.route.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const PORT = 8002;

const app = new Hono();

app.use("*", clerkMiddleware());
app.use("*", cors({ origin: ["http://localhost:3002"] }));

// -------------------- OpenAPI (manual spec for Hono) --------------------
const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "ShopHub Payment Service API",
    version: "1.0.0",
    description: "Stripe checkout session + webhooks + Kafka events",
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { 200: { description: "Service is healthy" } },
      },
    },
    "/sessions/create-checkout-session": {
      post: {
        tags: ["Sessions"],
        summary: "Create Stripe checkout session",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Session created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/sessions/{sessionId}": {
      get: {
        tags: ["Sessions"],
        summary: "Get checkout session status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Session status" },
          401: { description: "Unauthorized" },
          404: { description: "Not found" },
        },
      },
    },
    "/webhooks/stripe": {
      post: {
        tags: ["Webhooks"],
        summary: "Stripe webhook endpoint",
        description:
          "Receives Stripe events and triggers Kafka payment.successful event.",
        responses: {
          200: { description: "Webhook received" },
          400: { description: "Invalid payload/signature" },
        },
      },
    },
  },
};

// Serve OpenAPI JSON
app.get("/api/doc.json", (c) => c.json(openapiSpec));

// Serve Swagger UI HTML (points to /api/doc.json)
app.get("/api/doc", (c) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Service API Docs</title>
  <link rel="stylesheet" href="/api/doc/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/doc/swagger-ui-bundle.js"></script>
  <script src="/api/doc/swagger-ui-standalone-preset.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/doc.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>`;
  return c.html(html);
});

// Serve Swagger UI static assets
app.get("/api/doc/*", async (c) => {
  const path = c.req.path.replace("/api/doc/", "");
  const filePath = swaggerUiDist.getAbsoluteFSPath() + "/" + path;

  // @hono/node-server can serve static files via Bun/Node adapters differently,
  // simplest: use fetch(File) style via Node fs.
  // We'll do a tiny Node-friendly static response:
  const fs = await import("node:fs/promises");
const data = await fs.readFile(filePath);
const body = new Uint8Array(data);

  const contentType =
    path.endsWith(".css")
      ? "text/css"
      : path.endsWith(".js")
      ? "application/javascript"
      : "application/octet-stream";

  return new Response(body, {
  headers: { "content-type": contentType },
});
});

// -------------------- Routes --------------------
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
    await producer.connect();
    await consumer.connect();
    await runKafkaSubscriptions();

    serve(
      {
        fetch: app.fetch,
        port: PORT,
      },
      () => {
        console.log(`payment service is running on port ${PORT}`);
        console.log(`swagger docs: http://localhost:${PORT}/api/doc`);
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
