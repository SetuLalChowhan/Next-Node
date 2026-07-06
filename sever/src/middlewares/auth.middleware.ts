import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

/**
 * Protect middleware to ensure the request has a valid Bearer JWT.
 * Assures user identity is present on AuthenticatedRequest.
 */
export const protect = catchAsync(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please login to get access.", 401));
  }

  // Verify token
  let decoded: { userId: string; role: string };
  try {
    decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
  } catch (err) {
    return next(new AppError("Invalid or expired session token. Please login again.", 401));
  }

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  // Grant access
  req.user = user;
  next();
});

/**
 * Middleware guard to restrict access to specific user roles.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

/**
 * Helper admin guard shortcut.
 */
export const adminGuard = restrictTo("admin", "superadmin");
