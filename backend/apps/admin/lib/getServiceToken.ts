// backend/apps/admin/lib/getServiceToken.ts
import { auth } from "@clerk/nextjs/server";

/**
 * Lấy JWT dùng cho các microservice (order-service, auth-service, v.v.)
 * Nhớ tạo JWT Template trong Clerk với tên trùng `CLERK_JWT_TEMPLATE_NAME`
 * và include metadata.role nếu backend đang check role.
 */
export const getServiceToken = async () => {
  const { getToken } = await auth();

  const template =
    process.env.CLERK_JWT_TEMPLATE_NAME || "microservice"; // Đổi "microservice" thành tên template bạn dùng

  const token = await getToken({
    template,
  });

  if (!token) {
    console.error("[getServiceToken] Failed to get JWT token for services");
  }

  return token;
};
