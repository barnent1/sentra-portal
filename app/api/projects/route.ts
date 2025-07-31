import { NextRequest } from 'next/server';
import { createApiHandler, ApiResponseBuilder } from '@/lib/api/base-handler';
import { withValidation, projectSchemas } from '@/lib/middleware/validation';
import { combineMiddleware, withRateLimit } from '@/lib/middleware';

// GET /api/projects - Get all projects with rate limiting
export const GET = combineMiddleware(
  withValidation(
    { query: projectSchemas.query },
    createApiHandler(async (request: NextRequest, context: any, validated: any) => {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = validated.query;

      // TODO: Implement project fetching logic with pagination, sorting, and filtering
      const projects: any[] = [];
      const total = 0;

      return ApiResponseBuilder.paginated(
        projects,
        page,
        limit,
        total
      );
    })
  ),
  {
    rateLimit: 'read', // 200 requests per minute
    logging: true
  }
);

// POST /api/projects - Create a new project with stricter rate limiting
export const POST = combineMiddleware(
  withValidation(
    { body: projectSchemas.create },
    createApiHandler(async (request: NextRequest, context: any, validated: any) => {
      const projectData = validated.body;

      // TODO: Implement project creation logic
      const project = {
        id: Math.random().toString(36).substr(2, 9),
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Return created response with location header
      return ApiResponseBuilder.created(
        project,
        `/api/projects/${project.id}`
      );
    })
  ),
  {
    rateLimit: 'write', // 30 requests per minute
    logging: true
  }
);