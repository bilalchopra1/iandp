import { NextResponse } from "next/server";

// Define rate limits for different subscription plans
const RATE_LIMITS_BY_PLAN = {
  free: {
    "/api/generate-prompt": { maxRequests: 5, timeWindow: 60 * 60 }, // 5 per hour
    "/api/rate-prompt": { maxRequests: 30, timeWindow: 60 },
    "/api/favorite": { maxRequests: 30, timeWindow: 60 },
  },
  premium: {
    "/api/generate-prompt": { maxRequests: 50, timeWindow: 60 * 60 }, // 50 per hour
    "/api/rate-prompt": { maxRequests: 100, timeWindow: 60 },
    "/api/favorite": { maxRequests: 100, timeWindow: 60 },
  },
};

export async function middleware(req) {
  // Temporarily disable middleware to fix loading issues
  // TODO: Re-implement rate limiting with proper Supabase client
  return NextResponse.next();
}