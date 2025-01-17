import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      error: 'File upload error'
    });
  }

  // Handle known errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal server error'
  });
};