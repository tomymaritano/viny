import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this value already exists'
        })
      case 'P2025':
        return res.status(404).json({
          error: 'Not Found',
          message: 'Record not found'
        })
      default:
        return res.status(500).json({
          error: 'Database Error',
          message: 'An error occurred while processing your request'
        })
    }
  }

  // Custom app errors
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json({
      error: error.message
    })
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  })
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}