// app/api/jobs/[id]/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
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
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('is_admin')
      .eq('id', decoded.sub)
      .single()

    if (userError || !user?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const jobId = params.id

    // Delete the job
    const { error: deleteError } = await supabaseServer
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      console.error('Error deleting job:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    })

  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}