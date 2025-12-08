// backend/apps/admin/app/(dashboard)/profile/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ProfilePage = async () => {
  const user = await currentUser();


  if (!user) {
    redirect("/sign-in");
  }

  const role =
    ((user.publicMetadata as any)?.role ??
      (user.privateMetadata as any)?.role ??
      "user") as string;

  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user.username ?? "Unknown user";

  const email = user.emailAddresses[0]?.emailAddress ?? "No email";
  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-US")
    : "-";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">My Profile</h1>
      </div>

      {/* CARD INFO CHÍNH */}
      <div className="bg-primary-foreground p-6 rounded-lg flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.imageUrl ?? ""} />
          <AvatarFallback>
            {user.firstName?.[0] ?? user.username?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium">Role:</span>
            <Badge variant={role === "admin" ? "default" : "secondary"}>
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT */}
      <div className="bg-primary-foreground p-6 rounded-lg space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">User ID</span>
          <span className="font-mono text-xs">{user.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span>{user.banned ? "Banned" : "Active"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Joined</span>
          <span>{joinedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
