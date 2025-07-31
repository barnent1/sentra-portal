import { NextRequest } from 'next/server';

export interface LogContext {
  requestId: string;
  method: string;
  path: string;
  query?: Record<string, string>;
  userId?: string;
  duration?: number;
  statusCode?: number;
  error?: any;
}

export class ApiLogger {
  private static instance: ApiLogger;

  private constructor() {}

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  private formatLog(level: string, message: string, context?: Partial<LogContext>) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      level,
      message,
      ...context
    };

    return JSON.stringify(log);
  }

  info(message: string, context?: Partial<LogContext>) {
    console.log(this.formatLog('INFO', message, context));
  }

  warn(message: string, context?: Partial<LogContext>) {
    console.warn(this.formatLog('WARN', message, context));
  }

  error(message: string, context?: Partial<LogContext>) {
    console.error(this.formatLog('ERROR', message, context));
  }

  debug(message: string, context?: Partial<LogContext>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('DEBUG', message, context));
    }
  }
}

export const logger = ApiLogger.getInstance();

// Generate a unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log request middleware
export function logRequest(request: NextRequest): LogContext {
  const requestId = generateRequestId();
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const context: LogContext = {
    requestId,
    method: request.method,
    path: url.pathname,
    query: Object.keys(query).length > 0 ? query : undefined
  };

  logger.info('Incoming request', context);

  return context;
}

// Log response
export function logResponse(context: LogContext, statusCode: number, duration: number) {
  const responseContext = {
    ...context,
    statusCode,
    duration
  };

  if (statusCode >= 400) {
    logger.warn('Request failed', responseContext);
  } else {
    logger.info('Request completed', responseContext);
  }
}

// Create a middleware wrapper with logging
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    const request = args[0] as NextRequest;
    const context = logRequest(request);

    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      
      // Try to extract status code from NextResponse
      let statusCode = 200;
      if (result && typeof result === 'object' && 'status' in result) {
        statusCode = (result as any).status;
      }

      logResponse(context, statusCode, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Request error', {
        ...context,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };
}