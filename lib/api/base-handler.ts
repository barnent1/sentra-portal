import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/middleware/error-handler';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  code?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export function createSuccessResponse<T>(
  data: T,
  metadata?: ApiResponse['metadata']
): ApiResponse<T> {
  return {
    status: 'success',
    data,
    ...(metadata && { metadata })
  };
}

export function createErrorResponse(
  error: string,
  code?: string
): ApiResponse {
  return {
    status: 'error',
    error,
    ...(code && { code })
  };
}

// Create a typed API handler
export function createApiHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<ApiResponse<T>>
) {
  return withErrorHandler(async (request: NextRequest, context?: any) => {
    const response = await handler(request, context);
    return NextResponse.json(response);
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