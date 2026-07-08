import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import prisma from "../../config/db.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Fetch active profile data of currently authenticated user.
 */
export const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next) => {
  if (!req.user) {
    return next(new AppError("User profile context not found.", 401));
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      role: true,
      displayName: true,
      slug: true,
      createdAt: true,
    },
  });

  if (!userProfile) {
    return next(new AppError("User account no longer exists in database.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: userProfile,
    },
  });
});

/**
 * Update authenticated user's profile details.
 */
export const updateMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next) => {
  if (!req.user) {
    return next(new AppError("User profile context not found.", 401));
  }

  const { firstName, lastName, displayName, slug } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      displayName,
      slug,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully.",
    data: {
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        displayName: updatedUser.displayName,
        slug: updatedUser.slug,
      },
    },
  });
});
