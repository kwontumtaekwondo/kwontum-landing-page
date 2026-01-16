import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function GET(request) {
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

    // Get search parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
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
        { status: 500 }
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
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}