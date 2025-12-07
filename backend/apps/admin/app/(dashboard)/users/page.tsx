import { auth, type User } from "@clerk/nextjs/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";

type UsersApiResponse =
  | {
      data?: User[];
      totalCount?: number;
    }
  | User[];

/**
 * Luôn trả về một mảng User[], kể cả khi API shape thay đổi
 */
const getData = async (): Promise<User[]> => {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
      return [];
    }

    const json = (await res.json()) as UsersApiResponse;

    // Trường hợp API trả về mảng thuần User[]
    if (Array.isArray(json)) {
      return json;
    }

    // Trường hợp API dạng { data: User[], totalCount }
    if (Array.isArray(json.data)) {
      return json.data;
    }

    console.warn(
      "[UsersPage] Unexpected users response shape, fallback to empty array:",
      json
    );
    return [];
  } catch (err) {
    console.error("[UsersPage] Error fetching users:", err);
    return [];
  }
};

const UsersPage = async () => {
  const users = await getData();

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default UsersPage;
