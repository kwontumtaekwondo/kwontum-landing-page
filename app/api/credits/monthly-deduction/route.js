import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const CRON_SECRET = process.env.CRON_SECRET

// Main handler for GET requests (used by Vercel cron)
export async function GET(request) {
  try {
    // Log incoming request for debugging
    console.log('📥 Monthly deduction called via GET')
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

// Keep POST for manual testing or other integrations
export async function POST(request) {
  // You can keep the same logic as GET or handle it differently
  // For consistency, you can reuse the GET logic:
  try {
    console.log('📥 Monthly deduction called via POST')
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No Bearer token' },
        { status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    if (token !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('✅ POST Authorization successful')
    // ... rest of the deduction logic same as GET
    const { data, error } = await supabaseServer
      .rpc('deduct_monthly_credits')

    if (error) {
      console.error('❌ Supabase RPC error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Monthly deduction completed via POST:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Monthly deductions processed via POST',
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