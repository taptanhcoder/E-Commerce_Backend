// backend/apps/admin/app/(dashboard)/orders/page.tsx
import { auth } from "@clerk/nextjs/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { OrderType } from "@repo/types";

const getData = async (): Promise<OrderType[]> => {
  const { getToken } = await auth();
  const token = await getToken({
    template: process.env.CLERK_JWT_TEMPLATE_NAME,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "[OrdersPage] Failed to fetch orders:",
        res.status,
        res.statusText
      );
      return [];
    }

    const data = (await res.json()) as OrderType[];
    return data;
  } catch (err) {
    console.error(
      "[OrdersPage] Network error while fetching orders:",
      err
    );
    return [];
  }
};

const OrdersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Payments</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default OrdersPage;
