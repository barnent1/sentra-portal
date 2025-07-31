import { NextRequest, NextResponse } from 'next/server';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements ApiError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements ApiError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  code = 'CONFLICT';

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error implements ApiError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known API errors
  if (error instanceof Error && 'statusCode' in error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      {
        status: 'error',
        error: apiError.message,
        code: apiError.code,
        data: null
      },
      { status: apiError.statusCode || 500 }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        data: {
          issues: (error as any).issues
        }
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        status: 'error',
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        code: 'INTERNAL_ERROR',
        data: null
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      status: 'error',
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      data: null
    },
    { status: 500 }
  );
}

// Wrapper function for API route handlers
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse | R>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const result = await handler(...args);
      return result instanceof NextResponse ? result : NextResponse.json(result);
    } catch (error) {
      return handleError(error);
    }
  };
}