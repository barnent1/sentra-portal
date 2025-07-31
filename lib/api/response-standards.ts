import { NextResponse } from 'next/server';

/**
 * Standard API Response Format
 * 
 * All API responses should follow this format for consistency
 */
export interface ApiResponse<T = any> {
  // Status of the request
  status: 'success' | 'error';
  
  // Data payload for successful responses
  data?: T;
  
  // Error message for error responses
  error?: string;
  
  // Error code for programmatic error handling
  code?: string;
  
  // Additional metadata
  metadata?: {
    // Pagination info
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    
    // Request info
    requestId?: string;
    timestamp?: string;
    
    // Performance metrics
    duration?: number;
    
    // Any additional metadata
    [key: string]: any;
  };
  
  // Validation errors
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Standard HTTP Status Codes used in the API
 */
export const HttpStatus = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Standard Error Codes
 */
export const ErrorCode = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Response builder utilities
 */
export class ApiResponseBuilder {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    metadata?: ApiResponse['metadata'],
    status: number = HttpStatus.OK
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      status: 'success',
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
    
    return NextResponse.json(response, { status });
  }
  
  /**
   * Create an error response
   */
  static error(
    error: string,
    code?: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: ApiResponse['errors']
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      status: 'error',
      error,
      code: code || ErrorCode.INTERNAL_ERROR,
      metadata: {
        timestamp: new Date().toISOString(),
      },
      ...(errors && { errors }),
    };
    
    return NextResponse.json(response, { status });
  }
  
  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    metadata?: Omit<ApiResponse['metadata'], 'page' | 'limit' | 'total' | 'hasMore'>
  ): NextResponse<ApiResponse<{ items: T[]; pagination: any }>> {
    const hasMore = page * limit < total;
    const totalPages = Math.ceil(total / limit);
    
    return this.success(
      {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
      {
        page,
        limit,
        total,
        hasMore,
        ...metadata,
      }
    );
  }
  
  /**
   * Create a no content response
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
  }
  
  /**
   * Create a created response
   */
  static created<T>(
    data: T,
    location?: string,
    metadata?: ApiResponse['metadata']
  ): NextResponse<ApiResponse<T>> {
    const response = this.success(data, metadata, HttpStatus.CREATED);
    
    if (location) {
      response.headers.set('Location', location);
    }
    
    return response;
  }
  
  /**
   * Create a validation error response
   */
  static validationError(
    message: string,
    errors: ApiResponse['errors']
  ): NextResponse<ApiResponse> {
    return this.error(
      message,
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      errors
    );
  }
  
  /**
   * Create a not found response
   */
  static notFound(resource: string, id?: string): NextResponse<ApiResponse> {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    
    return this.error(
      message,
      ErrorCode.RESOURCE_NOT_FOUND,
      HttpStatus.NOT_FOUND
    );
  }
  
  /**
   * Create an unauthorized response
   */
  static unauthorized(message: string = 'Authentication required'): NextResponse<ApiResponse> {
    return this.error(
      message,
      ErrorCode.AUTHENTICATION_REQUIRED,
      HttpStatus.UNAUTHORIZED
    );
  }
  
  /**
   * Create a forbidden response
   */
  static forbidden(message: string = 'Insufficient permissions'): NextResponse<ApiResponse> {
    return this.error(
      message,
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      HttpStatus.FORBIDDEN
    );
  }
  
  /**
   * Create a conflict response
   */
  static conflict(message: string, code?: string): NextResponse<ApiResponse> {
    return this.error(
      message,
      code || ErrorCode.RESOURCE_CONFLICT,
      HttpStatus.CONFLICT
    );
  }
  
  /**
   * Create a rate limit exceeded response
   */
  static rateLimitExceeded(
    retryAfter?: number,
    message: string = 'Too many requests'
  ): NextResponse<ApiResponse> {
    const response = this.error(
      message,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      HttpStatus.TOO_MANY_REQUESTS
    );
    
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }
    
    return response;
  }
}

/**
 * Type guards for API responses
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { status: 'success'; data: T } => {
  return response.status === 'success' && response.data !== undefined;
};

export const isErrorResponse = (
  response: ApiResponse
): response is ApiResponse & { status: 'error'; error: string } => {
  return response.status === 'error' && response.error !== undefined;
};