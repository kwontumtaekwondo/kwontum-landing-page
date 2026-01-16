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

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    
    // Calculate next deduction date (1st of next month)
    const nextDeductionDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    // Get user's current credit balance from users table
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('credit')
      .eq('id', decoded.sub)
      .single()

    if (userError) {
      console.error('Error fetching user credit:', userError)
    }

    // Get lifetime credits earned
    const { data: lifetimeData, error: lifetimeError } = await supabaseServer
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', decoded.sub)
      .gt('amount', 0)

    if (lifetimeError) {
      console.error('Error fetching lifetime credits:', lifetimeError)
    }

    // Get current month credits earned
    const { data: monthData, error: monthError } = await supabaseServer
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', decoded.sub)
      .gt('amount', 0)
      .gte('created_at', startOfMonth)

    if (monthError) {
      console.error('Error fetching month credits:', monthError)
    }

    const currentBalance = userData?.credit || 0
    const lifetimeEarned = lifetimeData?.reduce((sum, t) => sum + t.amount, 0) || 0
    const monthlyEarned = monthData?.reduce((sum, t) => sum + t.amount, 0) || 0
    const requiredCredits = 8
    const creditsAfterDeduction = currentBalance - requiredCredits
    const isOnTrack = currentBalance >= requiredCredits

    return NextResponse.json({
      currentBalance,
      lifetimeEarned,
      monthlyEarned,
      requiredCredits,
      creditsAfterDeduction,
      nextDeductionDate: nextDeductionDate.toISOString(),
      isOnTrack,
      currentMonth,
      message: isOnTrack 
        ? `You have enough credits for this month's deduction.`
        : `You need ${requiredCredits - currentBalance} more credits before the next deduction.`
    })

  } catch (error) {
    console.error('Get credit status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}