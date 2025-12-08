// backend/apps/admin/app/(dashboard)/users/page.tsx
import { auth, type User } from "@clerk/nextjs/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async (): Promise<{ data: User[]; totalCount: number }> => {
  // LẤY TOKEN THEO TEMPLATE "backend"
  const { getToken } = await auth();
  const token = await getToken({ template: "backend" });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "[UsersPage] Failed to fetch users:",
        res.status,
        res.statusText
      );
      return { data: [], totalCount: 0 };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[UsersPage] Network error while fetching users:", err);
    return { data: [], totalCount: 0 };
  }
};

const UsersPage = async () => {
  const res = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={res.data} />
    </div>
  );
};

export default UsersPage;
