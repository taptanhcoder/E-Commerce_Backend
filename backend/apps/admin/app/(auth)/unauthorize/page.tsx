// backend/apps/admin/app/(auth)/unauthorize/page.tsx
"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const Page = () => {

  const { signOut, redirectToSignIn } = useClerk();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-primary-foreground rounded-xl shadow-lg p-8 flex flex-col items-center text-center space-y-4">
        {/* Icon cảnh báo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-2">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-2xl font-semibold">Access denied</h1>

        {/* Mô tả ngắn */}
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to access this dashboard.
          Please sign in with an admin account or sign out.
        </p>

        {/* Hàng nút hành động */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {/* ✅ Nút mở màn hình Sign In để đăng nhập tài khoản khác */}
          <Button
            variant="outline"
            className="min-w-[180px]"
            onClick={() =>
              redirectToSignIn({
                redirectUrl: "/", // sau khi login thành công thì quay lại dashboard
              })
            }
          >
            Sign in with another account
          </Button>

          {/* ✅ Nút sign out tài khoản hiện tại */}
          <Button
            variant="destructive"
            className="min-w-[120px]"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
