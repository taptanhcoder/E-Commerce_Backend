import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const shouldBeUser = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const { userId } = auth;

  if (!auth || !userId) {
    return res.status(401).json({ message: "you are not logged in !" });
  }


  req.userId = userId;

  return next();
};
