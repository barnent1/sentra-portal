export * from './error-handler';
export * from './logger';
export * from './cors';

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from './error-handler';
import { withLogging } from './logger';
import { withCors, CorsOptions } from './cors';

// Combine multiple middleware functions
export function combineMiddleware<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  corsOptions?: CorsOptions
) {
  // Apply middleware in order: CORS -> logging -> error handling
  if (corsOptions) {
    return withCors(withLogging(withErrorHandler(handler)), corsOptions);
  }
  return withLogging(withErrorHandler(handler));
}