// lib/api-helpers.js
// Helper functions and constants for API routes
import { NextResponse } from 'next/server'

export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

export function createNoCacheResponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: NO_CACHE_HEADERS
  })
}
