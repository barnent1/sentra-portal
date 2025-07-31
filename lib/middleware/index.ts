export * from './error-handler';
export * from './logger';

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from './error-handler';
import { withLogging } from './logger';

// Combine multiple middleware functions
export function combineMiddleware<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  // Apply middleware in order: logging -> error handling
  return withLogging(withErrorHandler(handler));
}