// app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { generateOTP, generateExpirationTime, cleanupExpiredOTPs } from '@/lib/otp-utils'
import { sendPasswordResetEmail } from '@/lib/email-service'

export async function POST(request) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Clean up expired OTPs
    await cleanupExpiredOTPs(supabaseServer)

    // Find user by email
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('id, name, email, status')
      .eq('email', email.toLowerCase())
      .single()

    // Security: Always return same response whether user exists or not
    if (userError || !user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      })
    }

    // Check account status
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'This account is currently locked. Please contact support.'
      }, { status: 403 })
    }

    // Rate limiting: Check recent OTP requests
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    
    const { data: recentOTPs } = await supabaseServer
      .from('password_reset_otps')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', twoMinutesAgo)
      .eq('is_used', false)

    if (recentOTPs && recentOTPs.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Please wait 2 minutes before requesting another code.'
      }, { status: 429 })
    }

    // Generate OTP
    const otpCode = generateOTP()
    const expiresAt = generateExpirationTime()

    // Store OTP in database
    const { error: otpError } = await supabaseServer
      .from('password_reset_otps')
      .insert({
        user_id: user.id,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false
      })

    if (otpError) {
      console.error('Database error storing OTP:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate reset code' },
        { status: 500 }
      )
    }

    // Send email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      otpCode,
      user.name || 'User'
    )

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error)
      
      // Rollback: Delete the OTP since email failed
      await supabaseServer
        .from('password_reset_otps')
        .delete()
        .eq('user_id', user.id)
        .eq('otp_code', otpCode)

      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      )
    }

    // Log successful attempt (without OTP)
    console.log('Password reset requested:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      messageId: emailResult.messageId
    })

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email.',
      // For development/testing only
      ...(process.env.NODE_ENV === 'development' && { debug: { otpCode } })
    })

  } catch (error) {
    console.error('Forgot password endpoint error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}