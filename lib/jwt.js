import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRES_IN = '1d'

// Generate JWT token
export function generateToken(userId, isAdmin = false) {
  return jwt.sign(
    {
      sub: userId,
      admin: isAdmin,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Create auth response
export async function createAuthResponse(userId, supabaseServer) {
  // Get user data
  const { data: user, error } = await supabaseServer
    .from('users')
    .select('id, name, email, is_admin, status, created_at')
    .eq('id', userId)
    .single()
  
  if (error || !user) throw new Error('User not found')
  
  // Generate JWT
  const token = generateToken(user.id, user.is_admin)
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
      status: user.status,
      createdAt: user.created_at
    },
    token,
    expiresIn: JWT_EXPIRES_IN
  }
}