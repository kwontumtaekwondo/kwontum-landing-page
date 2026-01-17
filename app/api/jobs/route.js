// app/api/jobs/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

// Define cache control headers once to reuse
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Alternative: Non-paginated version using RPC
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: noCacheHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Call the non-paginated RPC function
    const { data, error } = await supabaseServer
      .rpc('get_filtered_jobs', {
        p_user_id: decoded.sub,
        p_status_filter: status,
        p_user_filter: userId
      })

    if (error) {
      console.error('RPC function error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    // Format jobs for response
    const formattedJobs = (data || []).map(job => ({
      id: job.id,
      title: job.title,
      details: job.details,
      job_date: job.job_date,
      created_at: job.created_at,
      status: job.status,
      credits: job.credits,
      created_by: job.created_by,
      accepted_by: job.accepted_by,
      created_by_user: job.created_by ? {
        id: job.creator_id,
        name: job.creator_name,
        email: job.creator_email
      } : undefined,
      accepted_by_user: job.accepted_by ? {
        id: job.accepter_id,
        name: job.accepter_name,
        email: job.accepter_email
      } : undefined
    }))

    return NextResponse.json({ 
      jobs: formattedJobs,
      total: formattedJobs.length
    }, { headers: noCacheHeaders })
    
  } catch (error) {
    console.error('GET jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCacheHeaders }
    )
  }
}

// POST: Create a new job (admin only)
export async function POST(request) {
  try {
    const noCacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }

    // Verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
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

    const { title, details, jobDate, credits, status = 'open' } = await request.json()

    // Validation
    if (!title || !details || !jobDate || !credits) {
      return NextResponse.json(
        { error: 'Title, details, job date, and credits are required' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    if (credits < 1) {
      return NextResponse.json(
        { error: 'Credits must be at least 1' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    const jobDateObj = new Date(jobDate)
    if (isNaN(jobDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid job date' },
        { status: 400, headers: noCacheHeaders }
      )
    }

    // Create job
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .insert({
        title: title.trim(),
        details: details.trim(),
        job_date: jobDateObj.toISOString(),
        credits: parseInt(credits),
        status: status,
        created_by: decoded.sub
      })
      .select(`
        *,
        created_by:users!jobs_created_by_fkey(name, email)
      `)
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500, headers: noCacheHeaders }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      job
    }, { status: 201, headers: noCacheHeaders })

  } catch (error) {
    console.error('POST jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}