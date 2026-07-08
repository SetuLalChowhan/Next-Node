import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

const handleDuplicateFieldsDB = () => {
  return new AppError("Duplicate field value entered. Please use another value.", 400);
};

const handleJWTError = () => new AppError("Invalid signature. Please login again.", 401);

const handleJWTExpiredError = () => new AppError("Your session token has expired. Please login again.", 401);

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong on the server.",
    });
  }
};

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.isOperational = err.isOperational;

    // Prisma / DB Duplicate Entry
    if (err.code === "P2002") {
      error = handleDuplicateFieldsDB();
    }
    // Prisma / DB Record Not Found
    if (err.code === "P2025") {
      error = new AppError("Requested resource not found.", 404);
    }
    // JWT signature verification fail
    if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    // JWT expiration
    if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

export default errorMiddleware;
