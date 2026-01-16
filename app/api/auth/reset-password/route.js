// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/auth-utils'
import { isOTPExpired } from '@/lib/otp-utils'

export async function POST(request) {
  try {
    const { email, otpCode, newPassword } = await request.json()

    // Validation
    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP code, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find user
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, name, email, status')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP code' },
        { status: 400 }
      )
    }

    // Check if account is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is locked. Please contact support.' },
        { status: 403 }
      )
    }

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabaseServer
      .from('password_reset_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('otp_code', otpCode)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expires_at)) {
      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    const { error: markUsedError } = await supabaseServer
      .from('password_reset_otps')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    if (markUsedError) {
      console.error('Error marking OTP as used:', markUsedError)
      return NextResponse.json(
        { error: 'Failed to process reset request' },
        { status: 500 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update user's password
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        password_hash: newPasswordHash,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    // Optional: Invalidate all user sessions here if needed

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}