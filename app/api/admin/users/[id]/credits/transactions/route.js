// app/api/admin/users/[id]/credits/transactions/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
        { status: 403 }
      )
    }

    const userId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // First, get total count
    const { count, error: countError } = await supabaseServer
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transError) {
      console.error('Error fetching transactions:', transError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Format transactions to show the actual reason field
    const formattedTransactions = transactions?.map(t => ({
      id: t.id,
      amount: t.amount,
      // Use the actual reason/description from database
      reason: t.reason || t.description || getDefaultReason(t.transaction_type, t.amount),
      created_at: t.created_at,
      job_id: t.job_id,
      job: t.job ? {
        id: t.job.id,
        title: t.job.title,
        job_date: t.job.job_date
      } : undefined
    })) || []

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      transactions: formattedTransactions,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    })

  } catch (error) {
    console.error('GET user transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate default reason if none exists
function getDefaultReason(transactionType, amount) {
  const amountText = `${amount > 0 ? '+' : ''}${amount} credits`
  
  switch (transactionType) {
    case 'earning':
      return `Job completion: ${amountText}`
    case 'deduction':
      return `Monthly deduction: ${amountText}`
    case 'adjustment':
      return `Credit adjustment: ${amountText}`
    case 'transfer':
      return `Credit transfer: ${amountText}`
    case 'admin_add':
      return `Admin added credits: ${amountText}`
    case 'admin_remove':
      return `Admin removed credits: ${amountText}`
    default:
      return `${transactionType}: ${amountText}`
  }
}