// app/api/auth/verify-otp/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { isOTPExpired } from '@/lib/otp-utils'

export async function POST(request) {
  try {
    const { email, otpCode } = await request.json()

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      )
    }

    // Find user
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP code' },
        { status: 400 }
      )
    }

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabaseServer
      .from('password_reset_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('otp_code', otpCode)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())  // Only get non-expired
      .order('created_at', { ascending: false })    // Get the latest
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expires_at)) {
      return NextResponse.json(
        { error: 'OTP code has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      expiresAt: otpRecord.expires_at
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}