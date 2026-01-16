// app/api/credits/transactions/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // First, get total count
    const { count, error: countError } = await supabaseServer
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', decoded.sub)

    if (countError) {
      console.error('Error counting transactions:', countError)
      return NextResponse.json(
        { error: 'Failed to count transactions' },
        { status: 500 }
      )
    }

    // Then, get paginated data
    const { data: transactions, error: transError } = await supabaseServer
      .from('credit_transactions')
      .select(`
        *,
        job:jobs(id, title, job_date)
      `)
      .eq('user_id', decoded.sub)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transError) {
      console.error('Error fetching transactions:', transError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      transactions,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    })

  } catch (error) {
    console.error('GET transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}