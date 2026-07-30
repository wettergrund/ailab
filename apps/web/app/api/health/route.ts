import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'web',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
