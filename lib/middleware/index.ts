export * from './error-handler';
export * from './logger';
export * from './cors';
export * from './rate-limit';

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from './error-handler';
import { withLogging } from './logger';
import { withCors, CorsOptions } from './cors';
import { withRateLimit, RateLimitConfig, RateLimitConfigs } from './rate-limit';

export interface MiddlewareOptions {
  cors?: CorsOptions;
  rateLimit?: RateLimitConfig | keyof typeof RateLimitConfigs;
  logging?: boolean;
}

// Combine multiple middleware functions
export function combineMiddleware<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options: MiddlewareOptions = {}
) {
  let wrappedHandler = withErrorHandler(handler);
  
  // Apply rate limiting
  if (options.rateLimit) {
    wrappedHandler = withRateLimit(options.rateLimit)(wrappedHandler) as any;
  }
  
  // Apply logging (default true)
  if (options.logging !== false) {
    wrappedHandler = withLogging(wrappedHandler) as any;
  }
  
  // Apply CORS
  if (options.cors) {
    wrappedHandler = withCors(wrappedHandler, options.cors) as any;
  }
  
  return wrappedHandler;
}