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

    // Check if user account is active
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, status')
      .eq('id', decoded.sub)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account is locked or inactive. Please contact support.' },
        { status: 403 }
      )
    }

    const jobId = params.id
    
    // Get the job first
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'Job is not available for acceptance' },
        { status: 400 }
      )
    }

    if (job.accepted_by) {
      return NextResponse.json(
        { error: 'Job already accepted' },
        { status: 400 }
      )
    }

    // Determine status based on job date
    const jobDate = new Date(job.job_date)
    const now = new Date()
    let status = 'booked'
    
    // If job date has already passed, set directly to in_progress
    if (jobDate <= now) {
      status = 'in_progress'
    }

    // Accept the job
    const { error: updateError } = await supabaseServer
      .from('jobs')
      .update({
        status: status,
        accepted_by: decoded.sub,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Error accepting job:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Job accepted and marked as ${status}`,
      status: status
    })

  } catch (error) {
    console.error('Accept job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}