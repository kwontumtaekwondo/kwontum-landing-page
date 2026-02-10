import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    const noCacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'X-Cache-Bust': Date.now().toString()
    }

    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: noCacheHeaders }
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
        { status: 403, headers: noCacheHeaders }
      )
    }

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Call RPC function to get users with stats with no cache
    const { data: usersWithStats, error: rpcError } = await supabaseServer
      .rpc(
        'get_users_with_stats',
        {
          search_text: search || null,
          user_status: status || null,
          page_num: page,
          page_size: limit
        },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        }
      )

    if (rpcError) {
      console.error('RPC Error:', rpcError)

      // Fallback to original method if RPC fails
      console.log('Falling back to original method...')
      return await fallbackMethod(request, search, status, page, limit, noCacheHeaders)
    }

    // Get total count for pagination
    let query = supabaseServer
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { count, error: countError } = await query

    if (countError) {
      console.error('Count error:', countError)
    }

    // Map RPC result to expected format (ensure stats object exists)
    const formattedUsers = (usersWithStats || []).map(user => ({
      ...user,
      stats: {
        activeJobs: user.active_jobs || user.activeJobs || 0,
        completedJobs: user.completed_jobs || user.completedJobs || 0,
        totalJobs: user.total_jobs || user.totalJobs || 0
      }
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalUsers: count || formattedUsers.length || 0,
        limit
      },
      timestamp: new Date().toISOString(),
      cacheBusted: true,
      method: 'rpc'
    }, { headers: noCacheHeaders })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
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

// Fallback method using original approach
async function fallbackMethod(request, search, status, page, limit, headers) {
  const offset = (page - 1) * limit

  // Build base query for users
  let query = supabaseServer
    .from('users')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Apply status filter
  if (status) {
    query = query.eq('status', status)
  }

  // Apply pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: users, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      {
        status: 500,
        headers
      }
    )
  }

  // Get job statistics for all users in one query
  const userIds = users.map(user => user.id)

  let jobStats = {}
  if (userIds.length > 0) {
    const { data: statsData, error: statsError } = await supabaseServer
      .from('jobs')
      .select('accepted_by, status')
      .in('accepted_by', userIds)

    if (!statsError && statsData) {
      // Process stats
      statsData.forEach(job => {
        if (!jobStats[job.accepted_by]) {
          jobStats[job.accepted_by] = {
            activeJobs: 0,
            completedJobs: 0,
            totalJobs: 0
          }
        }

        jobStats[job.accepted_by].totalJobs++

        if (job.status === 'booked' || job.status === 'in_progress') {
          jobStats[job.accepted_by].activeJobs++
        } else if (job.status === 'completed') {
          jobStats[job.accepted_by].completedJobs++
        }
      })
    }
  }

  // Combine user data with stats
  const usersWithStats = users.map(user => ({
    ...user,
    stats: jobStats[user.id] || {
      activeJobs: 0,
      completedJobs: 0,
      totalJobs: 0
    }
  }))

  return NextResponse.json({
    success: true,
    users: usersWithStats,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      totalUsers: count || 0,
      limit
    },
    timestamp: new Date().toISOString(),
    method: 'fallback'
  }, { headers })
}