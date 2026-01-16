// app/api/jobs/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

// GET: Get all jobs (for jobs page)
export async function GET(request) {
  try {
    // Verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    
    // Build query
    let query = supabaseServer
      .from('jobs')
      .select(`
        *,
        created_by:users!jobs_created_by_fkey(id, name, email),
        accepted_by:users!jobs_accepted_by_fkey(id, name, email)
      `)
      .order('job_date', { ascending: true })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (userId) {
      query = query.or(`created_by.eq.${userId},accepted_by.eq.${userId}`)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ jobs })
    
  } catch (error) {
    console.error('GET jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new job (admin only)
export async function POST(request) {
  try {
    // Verify token
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

    const { title, details, jobDate, credits, status = 'open' } = await request.json()

    // Validation
    if (!title || !details || !jobDate || !credits) {
      return NextResponse.json(
        { error: 'Title, details, job date, and credits are required' },
        { status: 400 }
      )
    }

    if (credits < 1) {
      return NextResponse.json(
        { error: 'Credits must be at least 1' },
        { status: 400 }
      )
    }

    const jobDateObj = new Date(jobDate)
    if (isNaN(jobDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid job date' },
        { status: 400 }
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
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      job
    }, { status: 201 })

  } catch (error) {
    console.error('POST jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}