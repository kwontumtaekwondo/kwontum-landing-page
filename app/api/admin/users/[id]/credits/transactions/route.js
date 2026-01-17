// app/api/admin/users/[id]/credits/transactions/route.js
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get ALL transactions first to avoid count issues
    // Note: Supabase has a default limit of 1000, but we explicitly request all
    // First try without the join to see if that's causing issues
    const { data: allTransactions, error: allError } = await supabaseServer
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('Error fetching all transactions:', allError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // Debug logging - log raw data first
    console.log('Raw transactions from Supabase (before join):', {
      count: allTransactions?.length || 0,
      userId: userId,
      transactions: allTransactions?.map(t => ({
        id: t.id,
        amount: t.amount,
        reason: t.reason,
        created_at: t.created_at,
        job_id: t.job_id
      }))
    })

    // Now fetch job data separately for transactions that have job_id
    let transactionsWithJobs = []
    if (allTransactions && allTransactions.length > 0) {
      const jobIds = allTransactions
        .filter(t => t.job_id)
        .map(t => t.job_id)
        .filter((id, index, self) => self.indexOf(id) === index) // unique

      let jobsMap = {}
      if (jobIds.length > 0) {
        const { data: jobs, error: jobsError } = await supabaseServer
          .from('jobs')
          .select('id, title, job_date')
          .in('id', jobIds)

        if (!jobsError && jobs) {
          jobsMap = jobs.reduce((acc, job) => {
            acc[job.id] = job
            return acc
          }, {})
        }
      }

      // Combine transactions with job data
      transactionsWithJobs = allTransactions.map(t => ({
        ...t,
        job: t.job_id ? jobsMap[t.job_id] : undefined
      }))
    }

    // Manual pagination to avoid Supabase count bug
    const transactionsToPaginate = transactionsWithJobs.length > 0 ? transactionsWithJobs : (allTransactions || [])
    const total = transactionsToPaginate.length
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Manually slice for pagination
    const startIdx = offset
    const endIdx = Math.min(offset + limit, total)
    const paginatedTransactions = transactionsToPaginate.slice(startIdx, endIdx)

    // Format transactions - include ALL including amount = 0
    const formattedTransactions = paginatedTransactions.map(t => ({
      id: t.id,
      amount: t.amount,
      reason: t.reason || 'No reason provided',
      created_at: t.created_at,
      job_id: t.job_id,
      transaction_type: classifyTransactionType(t.reason, t.amount),
      is_account_action: t.reason?.includes('account locked') || t.reason?.includes('account unlocked'),
      job: t.job ? {
        id: t.job.id,
        title: t.job.title,
        job_date: t.job.job_date
      } : undefined
    }))

    console.log('Final response details:', {
      totalTransactions: total,
      paginatedCount: formattedTransactions.length,
      page: page,
      limit: limit,
      offset: offset,
      hasLockUnlock: formattedTransactions.some(t => 
        t.reason?.includes('lock') || t.reason?.includes('unlock')
      ),
      transactionIds: formattedTransactions.map(t => t.id),
      transactionAmounts: formattedTransactions.map(t => t.amount),
      transactionReasons: formattedTransactions.map(t => t.reason)
    })

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

// Helper function to classify transaction type based on reason
function classifyTransactionType(reason, amount) {
  if (!reason) return 'unknown';
  
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('job completed') || lowerReason.includes('job:')) {
    return 'job_earning';
  } else if (lowerReason.includes('monthly subscription') || lowerReason.includes('subscription deduction')) {
    return 'subscription';
  } else if (lowerReason.includes('admin adjustment')) {
    return 'admin_adjustment';
  } else if (lowerReason.includes('account locked by admin')) {
    return 'account_lock';
  } else if (lowerReason.includes('account unlocked by admin')) {
    return 'account_unlock';
  } else if (lowerReason.includes('account locked due')) {
    return 'account_lock_auto';
  } else if (amount === 0) {
    return 'account_action';
  } else if (amount > 0) {
    return 'credit_addition';
  } else if (amount < 0) {
    return 'credit_deduction';
  }
  
  return 'other';
}