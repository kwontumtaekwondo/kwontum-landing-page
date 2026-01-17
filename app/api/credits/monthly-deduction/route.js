import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request) {
  try {
    // Verify the request is from Vercel Cron (or has the correct secret)
    const authHeader = request.headers.get('authorization')
    
    // Option 1: Check for Vercel Cron signature (recommended)
    const cronSignature = request.headers.get('x-vercel-cron')
    const isFromVercelCron = cronSignature === 'true'
    
    // Option 2: Check for secret token
    const hasValidAuth = authHeader === `Bearer ${CRON_SECRET}`
    
    // Allow either Vercel Cron or valid auth token
    if (!isFromVercelCron && !hasValidAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Log the execution (for monitoring)
    console.log('🚀 Monthly deduction cron job started at:', new Date().toISOString())
    
    // Execute the deduction
    const { data, error } = await supabaseServer
      .rpc('deduct_monthly_credits', {
        secret_key: CRON_SECRET
      })

    if (error) {
      console.error('❌ Error executing monthly deduction:', error)
      return NextResponse.json(
        { error: 'Failed to process monthly deductions', details: error.message },
        { status: 500 }
      )
    }

    // Check if the RPC function returned an error
    if (data?.error) {
      console.error('❌ RPC function error:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: 500 }
      )
    }

    const response = {
      success: true,
      message: 'Monthly deductions processed successfully',
      timestamp: new Date().toISOString(),
      execution_time: new Date().toISOString(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      ...data
    }

    console.log('✅ Monthly deduction completed:', response)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Monthly deduction unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Also allow GET requests for testing
export async function GET(request) {
  // Check for secret token in query params for testing
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  
  if (secret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. Use ?secret=YOUR_CRON_SECRET' },
      { status: 401 }
    )
  }
  
  // Call the POST handler
  return POST(request)
}