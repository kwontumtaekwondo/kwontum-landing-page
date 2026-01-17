// app/api/admin/users/[id]/credits/transactions/route.js
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    // Call the RPC function
    // Note: Route segment config (dynamic, fetchCache, revalidate) handles caching
    const { data, error } = await supabaseServer
      .rpc('get_user_credit_transactions', {
        p_user_id: userId,
        p_page: page,
        p_limit: limit,
        p_admin_user_id: decoded.sub
      })

    if (error) {
      console.error('RPC function error:', error)

      // Handle specific error messages
      if (error.message.includes('Admin access required')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403, headers: noCacheHeaders }
        )
      } else if (error.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: noCacheHeaders }
        )
      }

      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // If no data returned (but no error), return empty array
    if (!data || data.length === 0) {
      return NextResponse.json({
        transactions: [],
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }, { headers: noCacheHeaders })
    }

    // Extract metadata from first row (all rows have same pagination info)
    const firstRow = data[0]
    const total = Number(firstRow.total_count) || 0
    const totalPages = Number(firstRow.total_pages) || 0
    const hasNext = firstRow.has_next || false
    const hasPrev = firstRow.has_prev || false

    // Format transactions for response
    const formattedTransactions = data.map(t => ({
      id: t.id,
      user_id: t.user_id,
      job_id: t.job_id,
      amount: t.amount,
      reason: t.reason,
      created_at: t.created_at,
      transaction_type: t.transaction_type,
      is_account_action: t.is_account_action,
      job: t.job_id ? {
        id: t.job_id,
        title: t.job_title,
        job_date: t.job_date
      } : undefined
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    }, { headers: noCacheHeaders })

  } catch (error) {
    console.error('GET user transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCacheHeaders }
    )
  }
}