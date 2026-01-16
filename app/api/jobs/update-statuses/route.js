import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // REMOVED: Admin check - now all authenticated users can trigger updates

    // Run the update function
    const { data, error } = await supabaseServer
      .rpc('update_expired_booked_jobs')

    if (error) {
      console.error('Error updating job statuses:', error)
      return NextResponse.json(
        { error: 'Failed to update job statuses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${data} jobs from booked to in_progress`,
      updatedCount: data
    })

  } catch (error) {
    console.error('Update statuses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}