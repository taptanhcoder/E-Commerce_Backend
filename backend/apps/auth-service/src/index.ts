import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route";
import { producer } from "./utils/kafka.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3003"],
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

// -------------------- Swagger / OpenAPI --------------------
const PORT = 8003;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShopHub Auth Service API",
      version: "1.0.0",
      description: "Auth/admin endpoints backed by Clerk",
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
  // Make sure this matches your TS file locations
  apis: ["./src/**/*.ts"],
});

app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/doc.json", (req: Request, res: Response) => res.json(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *   post:
 *     tags: [Users]
 *     summary: Create user (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 *   delete:
 *     tags: [Users]
 *     summary: Delete user by id (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
app.use("/users", shouldBeAdmin, userRoute);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "server error!" });
});

const start = async () => {
  try {
    await producer.connect();
    app.listen(PORT, () => {
      console.log(`auth service is running on ${PORT}`);
      console.log(`swagger docs: http://localhost:${PORT}/api/doc`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
