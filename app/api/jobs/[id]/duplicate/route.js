
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    const noCacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: noCacheHeaders }
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
        { status: 403, headers: noCacheHeaders }
      )
    }

    // Fetch the original job
    const { data: originalJob, error: fetchError } = await supabaseServer
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !originalJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404, headers: noCacheHeaders }
      )
    }

    // Create the duplicate job
    const { data: newJob, error: createError } = await supabaseServer
      .from('jobs')
      .insert({
        title: originalJob.title,
        details: originalJob.details,
        job_date: originalJob.job_date, // Keep the same date/time
        credits: originalJob.credits,
        status: 'open', // Reset status to open
        created_by: decoded.sub, // Set creator to current admin
        accepted_by: null // Ensure no one is assigned
      })
      .select()
      .single()

    if (createError) {
      console.error('Error duplicating job:', createError)
      return NextResponse.json(
        { error: 'Failed to duplicate job' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job duplicated successfully',
      job: newJob
    }, { status: 201, headers: noCacheHeaders })

  } catch (error) {
    console.error('Job duplication error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
