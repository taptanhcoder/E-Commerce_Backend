// backend/apps/admin/lib/image.ts
import { ProductType } from "@repo/types";

/**
 * Lấy URL ảnh sản phẩm một cách an toàn:
 * - Ưu tiên ảnh theo màu trong product.colors
 * - Sau đó fallback sang bất kỳ giá trị string hợp lệ nào trong images
 * - Nếu không có ảnh hợp lệ => trả về null
 */
export const getProductImageUrl = (product: ProductType): string | null => {
  if (!product || !product.images) return null;

  // Không tin tưởng runtime, nên để kiểu any và tự check lại
  const images: Record<string, unknown> = product.images as Record<
    string,
    unknown
  >;

  // Helper: chỉ nhận string, trim và kiểm tra rỗng
  const isValidString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim() !== "";
  };

  // 1️⃣ Ưu tiên lấy theo màu (product.colors)
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    const keyWithImage = product.colors.find((color) => {
      const value = images[color];
      return isValidString(value);
    });

    if (keyWithImage) {
      const value = images[keyWithImage];
      if (isValidString(value)) {
        return value.trim();
      }
    }
  }


  const firstValid = Object.values(images).find((value) => isValidString(value));

  return firstValid ? firstValid.trim() : null;
};
