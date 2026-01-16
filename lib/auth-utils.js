import bcrypt from 'bcryptjs'

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

// Validate email format
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
// lib/auth-utils.js (add this function)
export async function checkUserStatus(userId, supabase) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, status')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return { valid: false, error: 'User not found' }
  }

  if (user.status !== 'active') {
    return { valid: false, error: 'Account is locked or inactive' }
  }

  return { valid: true, user }
}

export function validatePassword(password) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return null
}

export function validateOTP(otp) {
  if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
    return 'OTP must be a 6-digit number'
  }
  return null
}