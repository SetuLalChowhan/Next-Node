import { Request, Response } from "express";
import prisma from "../../config/db.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Get list of all registered users (Admin-only).
 */
export const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

/**
 * Delete a user account (Admin-only).
 */
export const deleteUser = catchAsync(async (req: Request, res: Response, next) => {
  const id = req.params.id as string;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent admin from deleting themselves
  if (user.id === (req as any).user?.id) {
    return next(new AppError("You cannot delete your own administrative account.", 400));
  }

  await prisma.user.delete({ where: { id } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
