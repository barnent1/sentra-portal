# API Route Structure

This directory contains all API routes for the Sentra Portal application.

## Available Endpoints

### Authentication
- `/api/auth/[...nextauth]` - NextAuth.js authentication endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get a specific project
- `PUT /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PUT /api/users/[id]` - Update a user
- `DELETE /api/users/[id]` - Delete a user

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create a new team

### Health
- `GET /api/health` - Health check endpoint

## Response Format

All API responses follow this standard format:

```json
{
  "status": "success" | "error",
  "data": { ... } | null,
  "error": "Error message" | null
}
```