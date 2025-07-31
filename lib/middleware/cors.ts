import { NextRequest, NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | ((origin: string | undefined) => boolean | string);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400, // 24 hours
};

export function cors(options: CorsOptions = {}) {
  const corsOptions = { ...defaultOptions, ...options };

  return (request: NextRequest): Response | null => {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      setCorsHeaders(response, origin, corsOptions);
      return response;
    }

    return null;
  };
}

export function setCorsHeaders(
  response: Response | NextResponse,
  origin: string | null,
  options: CorsOptions
): void {
  // Handle origin
  if (options.origin === '*') {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (typeof options.origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', options.origin);
  } else if (Array.isArray(options.origin)) {
    if (origin && options.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
  } else if (typeof options.origin === 'function' && origin) {
    const result = options.origin(origin);
    if (result === true) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    } else if (typeof result === 'string') {
      response.headers.set('Access-Control-Allow-Origin', result);
    }
  }

  // Set other CORS headers
  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (options.methods && options.methods.length > 0) {
    response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '));
  }

  if (options.allowedHeaders && options.allowedHeaders.length > 0) {
    response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
  }

  if (options.exposedHeaders && options.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', options.exposedHeaders.join(', '));
  }

  if (options.maxAge !== undefined) {
    response.headers.set('Access-Control-Max-Age', options.maxAge.toString());
  }
}

// Middleware wrapper to add CORS headers to API responses
export function withCors<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse | R>,
  options: CorsOptions = {}
) {
  const corsOptions = { ...defaultOptions, ...options };

  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const origin = request.headers.get('origin');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      setCorsHeaders(response, origin, corsOptions);
      return response;
    }

    // Handle actual request
    const result = await handler(...args);
    const response = result instanceof NextResponse ? result : NextResponse.json(result);
    setCorsHeaders(response, origin, corsOptions);
    return response;
  };
}

// Get CORS configuration from environment variables
export function getCorsConfig(): CorsOptions {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    origin: isDevelopment ? '*' : allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400,
  };
}