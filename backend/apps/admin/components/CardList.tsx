// backend/apps/admin/components/CardList.tsx
import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { OrderType, ProductsType } from "@repo/types";
import { auth } from "@clerk/nextjs/server";

type ProductItem = ProductsType[number];

const getProductImageUrl = (item: ProductItem): string | null => {
  const images = item.images as Record<string, unknown> | undefined;
  if (!images) return null;

  const colors = Array.isArray(item.colors) ? item.colors : [];

  // Ưu tiên lấy theo màu đầu tiên trong danh sách colors
  for (const color of colors) {
    const raw = images[color as string];
    if (typeof raw === "string") {
      const value = raw.trim();
      if (value.length > 0) {
        return value;
      }
    }
  }

  // Fallback: lấy value hợp lệ đầu tiên trong images
  const first = Object.values(images).find(
    (raw) => typeof raw === "string" && raw.trim().length > 0
  ) as string | undefined;

  return first ?? null;
};

const CardList = async ({ title }: { title: string }) => {
  let products: ProductsType = [];
  let orders: OrderType[] = [];

  const { getToken } = await auth();
  const token = await getToken({
    template: process.env.CLERK_JWT_TEMPLATE_NAME,
  });

  if (title === "Popular Products") {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=5&popular=true`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.error(
          "[CardList] Failed to fetch popular products:",
          res.status,
          res.statusText
        );
      } else {
        products = await res.json();
      }
    } catch (error) {
      console.error(
        "[CardList] Network error while fetching popular products:",
        error
      );
    }
  } else {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?limit=5`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.error(
          "[CardList] Failed to fetch latest orders:",
          res.status,
          res.statusText
        );
      } else {
        orders = await res.json();
      }
    } catch (error) {
      console.error(
        "[CardList] Network error while fetching latest orders:",
        error
      );
    }
  }

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Popular Products"
          ? products.map((item) => {
              const imageUrl = getProductImageUrl(item);

              return (
                <Card
                  key={item.id}
                  className="flex-row items-center justify-between gap-4 p-4"
                >
                  <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <CardContent className="flex-1 p-0">
                    <CardTitle className="text-sm font-medium">
                      {item.name}
                    </CardTitle>
                  </CardContent>
                  <CardFooter className="p-0">${item.price}K</CardFooter>
                </Card>
              );
            })
          : orders.map((item) => (
              <Card
                key={item._id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.email}
                  </CardTitle>
                  <Badge variant="secondary">{item.status}</Badge>
                </CardContent>
                <CardFooter className="p-0">
                  ${item.amount / 100}
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
