// backend/apps/admin/app/(dashboard)/page.tsx
import AppAreaChart from "@/components/AppAreChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { auth } from "@clerk/nextjs/server";

import { OrderChartType } from "@repo/types";

const Homepage = async () => {
  const { getToken } = await auth();
  const token = await getToken(); 

  const orderChartData: Promise<OrderChartType[]> = fetch(
    `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/order-chart`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    }
  )
    .then(async (res) => {
      if (!res.ok) {
        console.error(
          "[Dashboard] Failed to fetch order chart data:",
          res.status,
          res.statusText
        );
        return [] as OrderChartType[];
      }

      try {
        const data = (await res.json()) as OrderChartType[];
        return data;
      } catch (error) {
        console.error(
          "[Dashboard] Error parsing order chart JSON:",
          error
        );
        return [] as OrderChartType[];
      }
    })
    .catch((error) => {
      console.error(
        "[Dashboard] Network error while fetching chart data:",
        error
      );
      return [] as OrderChartType[];
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppBarChart dataPromise={orderChartData} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Latest Transactions" />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <AppPieChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <TodoList />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Popular Products" />
      </div>
    </div>
  );
};

export default Homepage;
