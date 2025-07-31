# API Response Standards

This document outlines the standard response format and conventions for all API endpoints in the Sentra Portal.

## Response Format

All API responses follow a consistent JSON structure:

```typescript
{
  "status": "success" | "error",
  "data": { ... } | null,
  "error": "Error message" | null,
  "code": "ERROR_CODE" | null,
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456",
    "duration": 150,
    // Pagination (if applicable)
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  },
  "errors": [ // Validation errors (if applicable)
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

## Success Responses

### Basic Success Response
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasMore": true
    }
  },
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Created Response (201)
```json
{
  "status": "success",
  "data": {
    "id": "new-123",
    "name": "New Resource"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
Response includes `Location` header with the URI of the new resource.

### No Content Response (204)
Returns no body, just status code 204.

## Error Responses

### Validation Error (400)
```json
{
  "status": "error",
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Authentication Error (401)
```json
{
  "status": "error",
  "error": "Authentication required",
  "code": "AUTHENTICATION_REQUIRED",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Authorization Error (403)
```json
{
  "status": "error",
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Not Found Error (404)
```json
{
  "status": "error",
  "error": "Project with id 'abc123' not found",
  "code": "RESOURCE_NOT_FOUND",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Rate Limit Error (429)
```json
{
  "status": "error",
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
Response includes `Retry-After` header indicating when to retry.

### Server Error (500)
```json
{
  "status": "error",
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456"
  }
}
```

## HTTP Status Codes

| Status Code | Usage |
|------------|-------|
| 200 | OK - Successful GET, PUT |
| 201 | Created - Successful POST |
| 204 | No Content - Successful DELETE |
| 400 | Bad Request - Validation errors |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Error Codes

Standard error codes for programmatic error handling:

- `VALIDATION_ERROR` - Request validation failed
- `INVALID_INPUT` - Invalid input data
- `MISSING_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid data format
- `AUTHENTICATION_REQUIRED` - Authentication needed
- `INVALID_CREDENTIALS` - Invalid login credentials
- `TOKEN_EXPIRED` - Authentication token expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `RESOURCE_CONFLICT` - Resource state conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Internal server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service failed

## Usage Examples

### Using the Response Builder

```typescript
import { ApiResponseBuilder } from '@/lib/api/response-standards';

// Success response
return ApiResponseBuilder.success({ id: '123', name: 'Example' });

// Paginated response
return ApiResponseBuilder.paginated(items, page, limit, total);

// Error response
return ApiResponseBuilder.error('Something went wrong', 'INTERNAL_ERROR', 500);

// Validation error
return ApiResponseBuilder.validationError('Validation failed', [
  { field: 'email', message: 'Invalid email format' }
]);

// Not found
return ApiResponseBuilder.notFound('Project', projectId);

// Created
return ApiResponseBuilder.created(newProject, `/api/projects/${newProject.id}`);
```

## Best Practices

1. **Always use the standard format** - Consistency is key for API consumers
2. **Include meaningful error messages** - Help developers understand what went wrong
3. **Use appropriate HTTP status codes** - Follow REST conventions
4. **Include metadata** - Timestamp, request ID, and pagination info when applicable
5. **Handle errors gracefully** - Never expose internal implementation details
6. **Document error codes** - Make it easy for clients to handle errors programmatically
7. **Version your API** - Include version in URL or headers for future changes