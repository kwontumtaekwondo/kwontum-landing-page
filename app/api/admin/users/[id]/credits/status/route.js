import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

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

    // Get user info including credit balance
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, name, email, status, credit') // Added credit field
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Use user.credit field as source of truth
    const currentBalance = user?.credit || 0

    // Calculate lifetime earned (only positive amounts)
    const { data: positiveTransactions } = await supabaseServer
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gt('amount', 0)

    const lifetimeEarned = positiveTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0

    // Calculate this month earned
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonthISO = startOfMonth.toISOString()

    const { data: monthlyTransactions } = await supabaseServer
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', startOfMonthISO)
      .gt('amount', 0)

    const monthlyEarned = monthlyTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0

    // Settings
    const requiredCredits = 8 // Monthly requirement
    
    // Calculate next deduction date (1st of next month)
    let nextYear = now.getFullYear()
    let nextMonth = now.getMonth() + 1
    
    // Handle December -> January wrap
    if (nextMonth === 12) {
      nextMonth = 0 // January is 0 in JS
      nextYear += 1
    }
    
    const nextDeductionDate = new Date(nextYear, nextMonth, 1).toISOString()
    
    const creditsAfterDeduction = currentBalance - requiredCredits
    const isOnTrack = currentBalance >= requiredCredits

    return NextResponse.json({
      currentBalance,
      lifetimeEarned,
      monthlyEarned,
      requiredCredits,
      creditsAfterDeduction,
      nextDeductionDate,
      isOnTrack,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    })

  } catch (error) {
    console.error('GET user credits status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}