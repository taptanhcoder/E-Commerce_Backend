import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import { CustomJwtSessionClaims } from "@repo/types";


const extractRoleFromClaims = (
  claims: CustomJwtSessionClaims | undefined
): string | undefined => {
  if (!claims) return undefined;
  const anyClaims = claims as any;

  return (
    anyClaims.metadata?.role ??
    anyClaims.publicMetadata?.role ??
    anyClaims.privateMetadata?.role ??
    anyClaims.orgRole ??
    anyClaims.org_role
  );
};

export const shouldBeUser = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json(
      {
        message: "You are not logged in.",
      },
      401
    );
  }

  c.set("userId", auth.userId);

  await next();
});

export const shouldBeAdmin = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json(
      {
        message: "You are not logged in.",
      },
      401
    );
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims | undefined;
  const role = extractRoleFromClaims(claims);

  if (role !== "admin") {
    return c.json({ message: "Unauthorized!" }, 403);
  }

  c.set("userId", auth.userId);

  await next();
});
