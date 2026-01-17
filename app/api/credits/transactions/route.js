// app/api/credits/transactions/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be ≥ 1, limit must be 1-100' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    // Call the RPC function
    const { data, error } = await supabaseServer
      .rpc('get_current_user_transactions', {
        p_user_id: userId,
        p_page: page,
        p_limit: limit
      })

    if (error) {
      console.error('RPC function error:', error)
      
      // Handle specific error messages
      if (error.message.includes('Page must be greater than 0')) {
        return NextResponse.json(
          { error: 'Page must be greater than 0' },
          { status: 400, headers: noCacheHeaders }
        )
      } else if (error.message.includes('Limit must be between')) {
        return NextResponse.json(
          { error: 'Limit must be between 1 and 100' },
          { status: 400, headers: noCacheHeaders }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // Check if we got results
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

    // Extract metadata from first row
    const firstRow = data[0]
    const total = Number(firstRow.total_count) || 0
    const totalPages = Number(firstRow.total_pages) || 0
    const hasNext = firstRow.has_next || false
    const hasPrev = firstRow.has_prev || false

    // Format transactions for response
    const formattedTransactions = data.map(t => ({
      id: t.id,
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
    console.error('GET transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCacheHeaders }
    )
  }
}