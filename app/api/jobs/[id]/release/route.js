// app/api/jobs/[id]/release/route.js
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

    const jobId = params.id
    
    // Check job status and acceptor
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .select('status, accepted_by')
      .eq('id', jobId)
      .single()

    if (jobError) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.accepted_by !== decoded.sub) {
      return NextResponse.json(
        { error: 'You did not accept this job' },
        { status: 403 }
      )
    }

    if (!['booked', 'in_progress'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Job cannot be released in current status' },
        { status: 400 }
      )
    }

    // Release the job
    const { error: updateError } = await supabaseServer
      .from('jobs')
      .update({
        status: 'open',
        accepted_by: null,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Error releasing job:', updateError)
      return NextResponse.json(
        { error: 'Failed to release job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job released successfully'
    })

  } catch (error) {
    console.error('Release job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}