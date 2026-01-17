// app/api/admin/users/[id]/credits/status/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: noCacheHeaders }
      )
    }

    // Check if user is admin
    const { data: adminUser } = await supabaseServer
      .from('users')
      .select('is_admin')
      .eq('id', decoded.sub)
      .single()

    if (!adminUser?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403, headers: noCacheHeaders }
      )
    }

    const userId = params.id
    
    // Validate user ID format
    if (!userId || typeof userId !== 'string' || userId.length < 36) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    // Call the RPC function
    const { data, error } = await supabaseServer
      .rpc('get_user_credits_status', {
        p_user_id: userId,
        p_admin_user_id: decoded.sub
      })

    if (error) {
      console.error('RPC function error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user credits status' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // Check if we got results
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch user credits status' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    const result = data[0]

    // Check admin verification
    if (!result.admin_verified) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403, headers: noCacheHeaders }
      )
    }

    // Check if user exists
    if (!result.user_exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: noCacheHeaders }
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
      user: {
        id: result.user_id,
        name: result.user_name,
        email: result.user_email,
        status: result.user_status
      }
    }

    return NextResponse.json(response, { headers: noCacheHeaders })

  } catch (error) {
    console.error('GET user credits status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCacheHeaders }
    )
  }
}