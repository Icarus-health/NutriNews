import { NextResponse } from 'next/server';

// This value changes on each new deployment (Vercel sets unique BUILD_ID per deploy)
const BUILD_ID = process.env.NEXT_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();

export async function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
