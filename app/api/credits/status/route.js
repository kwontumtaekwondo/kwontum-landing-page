// app/api/user/credits/status/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Vercel-Cache-Control': 'no-store'
};

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: noCacheHeaders }
      )
    }

    const userId = decoded.sub
    
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.length < 36) {
      return NextResponse.json(
        { error: 'Invalid user token' },
        { status: 401, headers: noCacheHeaders }
      )
    }

    // Call the RPC function
    const { data, error } = await supabaseServer
      .rpc('get_current_user_credits_status', {
        p_user_id: userId
      })

    if (error) {
      console.error('RPC function error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch credit status' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // Check if we got results
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'User not found or no credit data available' },
        { status: 404, headers: noCacheHeaders }
      )
    }

    const result = data[0]

    // Check if user exists
    if (!result.user_exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: noCacheHeaders }
      )
    }

    // Check if user is locked
    if (result.user_status === 'locked') {
      return NextResponse.json(
        { 
          error: 'Your account is locked. Please contact support.',
          currentBalance: result.current_balance,
          isLocked: true
        },
        { status: 403, headers: noCacheHeaders }
      )
    }

    // Format the response
    const response = {
      currentBalance: result.current_balance,
      lifetimeEarned: result.lifetime_earned,
      monthlyEarned: result.monthly_earned,
      requiredCredits: result.required_credits,
      creditsAfterDeduction: result.credits_after_deduction,
      nextDeductionDate: result.next_deduction_date,
      isOnTrack: result.is_on_track,
      currentMonth: result.current_month,
      message: result.status_message,
      userStatus: result.user_status
    }

    return NextResponse.json(response, { headers: noCacheHeaders })

  } catch (error) {
    console.error('Get credit status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCacheHeaders }
    )
  }
}