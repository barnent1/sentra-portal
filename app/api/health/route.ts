import { NextRequest, NextResponse } from 'next/server';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'success',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'sentra-portal-api',
        version: process.env.npm_package_version || '0.1.0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed'
    }, { status: 503 });
  }
}