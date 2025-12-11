import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import { consumer, producer } from "./utils/kafka.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

// -------------------- Swagger / OpenAPI --------------------
const PORT = 8000;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShopHub Product Service API",
      version: "1.0.0",
      description: "Products & categories endpoints",
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
 * /test:
 *   get:
 *     tags: [System]
 *     summary: Test auth-protected route (User)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
app.get("/test", shouldBeUser, (req, res) => {
  res.json({ message: "product service authenticated", userId: req.userId });
});

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Products]
 *     summary: Create a product (Admin UI uses this)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201: { description: Created }
 *
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   put:
 *     tags: [Products]
 *     summary: Update product by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Products]
 *     summary: Delete product by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
app.use("/products", productRouter);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201: { description: Created }
 *
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
app.use("/categories", categoryRouter);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    // Connect Kafka
    await producer.connect();
    await consumer.connect();

    app.listen(PORT, () => {
      console.log(`product service is running on ${PORT}`);
      console.log(`swagger docs: http://localhost:${PORT}/api/doc`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
