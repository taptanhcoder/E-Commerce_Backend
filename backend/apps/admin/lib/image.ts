
import { ProductType } from "@repo/types";


export const getProductImageUrl = (product: ProductType): string | null => {
  if (!product || !product.images) return null;

  const images = product.images as unknown;

  const isValidString = (value: unknown): value is string =>
    typeof value === "string" && value.trim() !== "";


  if (Array.isArray(images)) {
    const firstValid = images.find((val) => isValidString(val));
    return firstValid ? firstValid.trim() : null;
  }


  if (typeof images === "object" && images !== null) {
    const map = images as Record<string, unknown>;


    if (Array.isArray(product.colors) && product.colors.length > 0) {
      for (const color of product.colors) {
        const value = map[color];
        if (isValidString(value)) {
          return value.trim();
        }
      }
    }


    for (const value of Object.values(map)) {
      if (isValidString(value)) {
        return value.trim();
      }
    }
  }


  return null;
};
