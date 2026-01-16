// lib/otp-utils.js
import crypto from 'crypto'

// Generate secure 6-digit OTP
export function generateOTP() {
  // Using crypto for more secure random numbers
  const randomBytes = crypto.randomBytes(3) // 3 bytes = 6 hex characters
  const hex = randomBytes.toString('hex')
  const numbers = parseInt(hex, 16) % 1000000
  return numbers.toString().padStart(6, '0')
}

// Generate expiration time (5 minutes from now)
export function generateExpirationTime() {
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + 5)
  return expires.toISOString()
}

// Check if OTP is expired
export function isOTPExpired(expiresAt) {
  return new Date(expiresAt) < new Date()
}

// Clean expired OTPs from database
export async function cleanupExpiredOTPs(supabase) {
  try {
    const { error } = await supabase
      .from('password_reset_otps')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .eq('is_used', false)

    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error)
    return { success: false, error: error.message }
  }
}