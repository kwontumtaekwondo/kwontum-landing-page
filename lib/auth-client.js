// lib/auth-client.js (for frontend)
class AuthClient {
  // Store auth data
  static setAuthData(data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  // Get token
  static getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Get user data
  static getUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // Check if user is logged in
  static isLoggedIn() {
    return this.getToken() !== null
  }

  // Logout
  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // Make authenticated requests
  static async fetchWithAuth(url, options = {}) {
    const token = this.getToken()
    
    return fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    })
  }
}

export default AuthClient