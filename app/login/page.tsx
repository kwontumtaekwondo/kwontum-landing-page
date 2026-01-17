// app/login/page.tsx
"use client";
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthClient from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store auth data
      AuthClient.setAuthData(data)

      // Force full page reload to update navbar
      window.location.href = '/jobs'

      // Redirect to jobs page
      router.push('/jobs')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        // User is already logged in, redirect to jobs
        router.push('/jobs')
      }
    }

    checkAuth()
  }, [router])
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-kwontum-darkRed text-white py-6 px-4 text-center">
          <h1 className="text-3xl font-bold font-dolceVita">Welcome Back</h1>
          <p className="mt-2 font-nanum opacity-90">Sign in to your Kwontum account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-nanum">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-nanum">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kwontum-darkRed text-white py-3 px-4 rounded-lg font-bold font-nanum hover:bg-[#5a1219] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <Link
              href="/forgot-password"
              className="text-kwontum-darkRed font-nanum hover:text-[#5a1219] transition-colors text-sm"
            >
              Forgot your password?
            </Link>
          </div>
          <p className="text-gray-600 font-nanum text-center">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-kwontum-darkRed font-bold hover:text-[#5a1219] transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-nanum text-gray-600 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}