import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { CustomJwtSessionClaims } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}


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

export const shouldBeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  req.userId = userId;

  return next();
};

export const shouldBeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims | undefined;
  const role = extractRoleFromClaims(claims);

  if (role !== "admin") {
    return res.status(403).json({ message: "Unauthorized!" });
  }

  req.userId = userId;

  return next();
};
