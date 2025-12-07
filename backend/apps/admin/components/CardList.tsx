// backend/apps/admin/components/CardList.tsx
import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { OrderType, ProductsType } from "@repo/types";
import { auth } from "@clerk/nextjs/server";
import { getProductImageUrl } from "@/lib/image";

const CardList = async ({ title }: { title: string }) => {
  let products: ProductsType = [];
  let orders: OrderType[] = [];

  if (title === "Popular Products") {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=5&popular=true`
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
      console.error("[CardList] Network error while fetching products:", error);
    }
  } else {
    const { getToken } = await auth();
    const token = await getToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?limit=5`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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
      console.error("[CardList] Network error while fetching orders:", error);
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
                  {/* Ảnh hoặc placeholder nếu không có ảnh */}
                  {imageUrl ? (
                    <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                      No image
                    </div>
                  )}

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
                <CardFooter className="p-0">${item.amount / 100}</CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
