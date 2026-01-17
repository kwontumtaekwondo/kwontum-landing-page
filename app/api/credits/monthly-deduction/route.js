import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request) {
  try {
    // Log incoming request for debugging
    console.log('📥 Monthly deduction called')
    console.log('🔐 Auth header:', request.headers.get('authorization') ? 'Present' : 'Missing')
    
    // Vercel Cron sends: Authorization: Bearer YOUR_CRON_SECRET
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ Invalid auth format')
      return NextResponse.json(
        { error: 'Unauthorized - No Bearer token' },
        { status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Vercel sets the CRON_SECRET as the token
    if (token !== CRON_SECRET) {
      console.log('❌ Token mismatch')
      console.log('Expected:', CRON_SECRET?.substring(0, 3) + '...')
      console.log('Received:', token.substring(0, 3) + '...')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('✅ Authorization successful')
    console.log('🚀 Starting monthly deduction at:', new Date().toISOString())
    
    // Execute the deduction
    const { data, error } = await supabaseServer
      .rpc('deduct_monthly_credits')

    if (error) {
      console.error('❌ Supabase RPC error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Monthly deduction completed:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Monthly deductions processed',
      timestamp: new Date().toISOString(),
      data: data
    })

  } catch (error) {
    console.error('❌ Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error.message },
      { status: 500 }
    )
  }
}

// Keep GET for manual testing
export async function GET(request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  
  if (secret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Add ?secret=YOUR_CRON_SECRET' },
      { status: 401 }
    )
  }
  
  console.log('🧪 Manual test via GET')
  return POST(request)
}