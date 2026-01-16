// app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase-server'
import { createAuthResponse } from '@/lib/jwt'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('id, password_hash, is_admin, status')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check account status
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account is not active' },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT response
    const authResponse = await createAuthResponse(user.id, supabaseServer)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      ...authResponse
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}