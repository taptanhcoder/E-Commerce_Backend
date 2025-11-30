import { Request, Response } from "express";
import {prisma, Prisma} from "@repo/product-db"


export const createProduct = async (req:Request,res:Response) =>{

  const data: Prisma.ProductCreateInput = req.body;

  const { colors, images } = data;
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({ message: "colors array is required!" });
  }

  if (!images || typeof images !== "object") {
    return res.status(400).json({ message: "images object is required!" });
  }

  const missingColors = colors.filter((color) => !(color in images));

  if (missingColors.length > 0) {
    return res
      .status(400)
      .json({ message: "missing images for colors!", missingColors });
  }

  const product = await prisma.product.create({ data });
  res.status(201).json(product);

};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.ProductUpdateInput = req.body;

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });

  return res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req:Request,res:Response) =>{

};

export const getProducts = async (req: Request, res: Response) => {
  const { sort, category, search, limit } = req.query;

  const orderBy = (() => {
    switch (sort) {
      case "asc":
        return { price: Prisma.SortOrder.asc };
        break;
      case "desc":
        return { price: Prisma.SortOrder.desc };
        break;
      case "oldest":
        return { createdAt: Prisma.SortOrder.asc };
        break;
      default:
        return { createdAt: Prisma.SortOrder.desc };
        break;
    }
  })();

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category as string,
      },
      name: {
        contains: search as string,
        mode: "insensitive",
      },
    },
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  res.status(200).json(products);
};


export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const productId = Number(id);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
};

