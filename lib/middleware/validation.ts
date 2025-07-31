import { NextRequest } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './error-handler';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export async function validateRequest(
  request: NextRequest,
  schemas: ValidationSchemas,
  params?: any
): Promise<{
  body?: any;
  query?: any;
  params?: any;
}> {
  const results: any = {};

  // Validate body
  if (schemas.body) {
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await request.json();
        results.body = await schemas.body.parseAsync(body);
      } else {
        throw new ValidationError('Content-Type must be application/json');
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(formatZodError(error));
      }
      throw error;
    }
  }

  // Validate query parameters
  if (schemas.query) {
    try {
      const url = new URL(request.url);
      const query: Record<string, any> = {};
      
      url.searchParams.forEach((value, key) => {
        // Handle array parameters (e.g., ?ids=1&ids=2)
        if (query[key]) {
          if (Array.isArray(query[key])) {
            query[key].push(value);
          } else {
            query[key] = [query[key], value];
          }
        } else {
          query[key] = value;
        }
      });

      results.query = await schemas.query.parseAsync(query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(formatZodError(error));
      }
      throw error;
    }
  }

  // Validate route params
  if (schemas.params && params) {
    try {
      results.params = await schemas.params.parseAsync(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(formatZodError(error));
      }
      throw error;
    }
  }

  return results;
}

// Format Zod errors for better readability
export function formatZodError(error: ZodError): string {
  const errors = error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return errors.join(', ');
}

// Create validation middleware
export function withValidation<T extends any[], R>(
  schemas: ValidationSchemas,
  handler: (request: NextRequest, context: any, validated: any) => Promise<R>
) {
  return async (request: NextRequest, context?: any): Promise<R> => {
    const validated = await validateRequest(request, schemas, context?.params);
    return handler(request, context, validated);
  };
}

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: z.string().min(1, 'ID is required'),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  }),

  // Sorting
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
    }
  ),
};

// Project validation schemas
export const projectSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    status: z.enum(['active', 'archived', 'draft']).default('active'),
    ownerId: z.string().optional(),
    teamId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['active', 'archived', 'draft']).optional(),
    ownerId: z.string().optional(),
    teamId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),

  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    status: z.enum(['active', 'archived', 'draft']).optional(),
    ownerId: z.string().optional(),
    teamId: z.string().optional(),
    search: z.string().optional(),
  }),
};

// User validation schemas
export const userSchemas = {
  create: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(255),
    password: z.string().min(8).max(100),
    role: z.enum(['admin', 'user', 'viewer']).default('user'),
  }),

  update: z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).max(255).optional(),
    password: z.string().min(8).max(100).optional(),
    role: z.enum(['admin', 'user', 'viewer']).optional(),
  }),

  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    role: z.enum(['admin', 'user', 'viewer']).optional(),
    search: z.string().optional(),
  }),
};

// Team validation schemas
export const teamSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    members: z.array(z.string()).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
  }),

  addMember: z.object({
    userId: z.string().min(1),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
  }),

  query: z.object({
    ...commonSchemas.pagination.shape,
    ...commonSchemas.sort.shape,
    search: z.string().optional(),
  }),
};