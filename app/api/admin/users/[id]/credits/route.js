import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
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
    const { amount, reason } = await request.json()

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Get current user info
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('credit, name, email, is_admin')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent modifying admin users
    if (user.is_admin) {
      return NextResponse.json(
        { error: 'Cannot modify admin user credits' },
        { status: 403 }
      )
    }

    // Calculate new credit balance
    const currentBalance = user.credit || 0
    const newBalance = currentBalance + amount

    // Create credit transaction
    const { data: transaction, error: transactionError } = await supabaseServer
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount,
        reason: `Admin adjustment: ${reason.trim()}`
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      )
    }

    // Update user's credit balance
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ credit: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Credits updated successfully for ${user.name}`,
      data: {
        userId,
        userName: user.name,
        amount,
        previousBalance: currentBalance,
        newBalance,
        reason: transaction.reason,
        transactionId: transaction.id
      }
    })

  } catch (error) {
    console.error('Update credits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}