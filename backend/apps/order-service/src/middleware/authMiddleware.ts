import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuth } from "@clerk/fastify";
import type { CustomJwtSessionClaims } from "@repo/types";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

/**
 * Helper: lấy role từ sessionClaims theo nhiều khả năng.
 */
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

export const shouldBeUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = getAuth(request);

  if (!userId) {
    return reply.status(401).send({ message: "You are not logged in!" });
  }

  request.userId = userId;
};

export const shouldBeAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const auth = getAuth(request);

  if (!auth.userId) {
    return reply.status(401).send({ message: "You are not logged in!" });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims | undefined;
  const role = extractRoleFromClaims(claims);

  if (role !== "admin") {
    return reply.status(403).send({ message: "Unauthorized!" });
  }

  request.userId = auth.userId;
};
