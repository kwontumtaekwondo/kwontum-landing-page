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
    const { reason } = await request.json()

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Unlock reason is required' },
        { status: 400 }
      )
    }

    // Get user info
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('name, email, is_admin, status')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent unlocking admin users (shouldn't be locked anyway)
    if (user.is_admin) {
      return NextResponse.json(
        { error: 'Cannot unlock admin user' },
        { status: 403 }
      )
    }

    // Check if already active
    if (user.status === 'active') {
      return NextResponse.json(
        { error: 'User account is already active' },
        { status: 400 }
      )
    }

    // Unlock account using the database function
    const { data: result, error: unlockError } = await supabaseServer
      .rpc('unlock_user_account', {
        user_id: userId,
        unlock_reason: reason.trim()
      })

    if (unlockError) {
      console.error('Error unlocking account:', unlockError)
      return NextResponse.json(
        { error: 'Failed to unlock user account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Account unlocked successfully for ${user.name}`,
      data: result
    })

  } catch (error) {
    console.error('Unlock account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}