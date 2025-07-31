import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { ApiResponseBuilder } from './response-standards';

// Re-export response standards
export { ApiResponseBuilder, HttpStatus, ErrorCode } from './response-standards';
export type { ApiResponse } from './response-standards';

// Create a typed API handler that automatically uses response standards
export function createApiHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse | T>
) {
  return withErrorHandler(async (request: NextRequest, context?: any) => {
    const result = await handler(request, context);
    
    // If already a NextResponse, return as is
    if (result instanceof NextResponse) {
      return result;
    }
    
    // Otherwise, wrap in success response
    return ApiResponseBuilder.success(result);
  });
}

// Helper to extract pagination params
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
    offset
  };
}

// Helper to extract sort params
export function getSortParams(request: NextRequest, allowedFields: string[]) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase() as 'asc' | 'desc';

  // Validate sort field
  if (!allowedFields.includes(sortBy)) {
    return {
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
  }

  return {
    sortBy,
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc' as const
  };
}

// Helper to extract filter params
export function getFilterParams(request: NextRequest, allowedFilters: string[]) {
  const { searchParams } = new URL(request.url);
  const filters: Record<string, string> = {};

  allowedFilters.forEach(filter => {
    const value = searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  });

  return filters;
}

// Deprecated - use ApiResponseBuilder instead
export function createSuccessResponse<T>(
  data: T,
  metadata?: any
): any {
  console.warn('createSuccessResponse is deprecated. Use ApiResponseBuilder.success() instead.');
  return {
    status: 'success',
    data,
    ...(metadata && { metadata })
  };
}

// Deprecated - use ApiResponseBuilder instead  
export function createErrorResponse(
  error: string,
  code?: string
): any {
  console.warn('createErrorResponse is deprecated. Use ApiResponseBuilder.error() instead.');
  return {
    status: 'error',
    error,
    ...(code && { code })
  };
}