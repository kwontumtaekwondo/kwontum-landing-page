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
        { error: 'Lock reason is required' },
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

    // Prevent locking admin users
    if (user.is_admin) {
      return NextResponse.json(
        { error: 'Cannot lock admin user' },
        { status: 403 }
      )
    }

    // Check if already locked
    if (user.status === 'locked') {
      return NextResponse.json(
        { error: 'User account is already locked' },
        { status: 400 }
      )
    }

    // Lock account using the database function
    const { data: result, error: lockError } = await supabaseServer
      .rpc('lock_user_account', {
        user_id: userId,
        lock_reason: reason.trim()
      })

    if (lockError) {
      console.error('Error locking account:', lockError)
      return NextResponse.json(
        { error: 'Failed to lock user account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Account locked successfully for ${user.name}`,
      data: result
    })

  } catch (error) {
    console.error('Lock account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}