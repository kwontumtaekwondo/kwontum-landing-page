"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/')
    }
  }, [router])

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user types
    if (error) setError('')
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status >= 500) {
            setError((data.error ? data.error : 'Failed to send reset code') + ' (internal)')
        } else {
            setError(data.error || 'Failed to send reset code')
        }
        return
      }

      setSuccess(data.message || 'Reset code sent to your email')
      setStep('otp')
      setCountdown(300) // 5 minutes countdown

      // For development only - show OTP in console
      if (process.env.NODE_ENV === 'development' && data.debug?.otpCode) {
        console.log('OTP Code (dev only):', data.debug.otpCode)
      }

    } catch (err) {
      console.error('Error sending OTP:', err)
      setError('An unexpected error occurred (internal). Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otpCode: formData.otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status >= 500) {
            setError((data.error ? data.error : 'Invalid or expired code') + ' (internal)')
        } else {
            setError(data.error || 'Invalid or expired code')
        }
        return
      }

      setSuccess('Code verified successfully!')
      setStep('reset')
      setCountdown(0) // Stop countdown

    } catch (err) {
      console.error('Error verifying OTP:', err)
      setError('An unexpected error occurred (internal). Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.newPassword) {
      setError('Please enter a new password')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otpCode: formData.otp,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status >= 500) {
            setError((data.error ? data.error : 'Failed to reset password') + ' (internal)')
        } else {
            setError(data.error || 'Failed to reset password')
        }
        return
      }

      setSuccess(data.message || 'Password reset successfully!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      console.error('Error resetting password:', err)
      setError('An unexpected error occurred (internal). Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before requesting a new code`)
      return
    }

    // Create a proper form event
    const fakeEvent = {
      preventDefault: () => { },
      target: {},
      currentTarget: {}
    } as React.FormEvent

    await handleSendOTP(fakeEvent)
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll send a 6-digit code to your email to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Code sent to {formData.email}
                  </span>
                </div>
              </div>

              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength={6}
                pattern="\d{6}"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
                placeholder="000000"
                disabled={loading}
                required
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Code expires in: <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-sm text-kwontum-darkRed hover:text-[#5a1219] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend Code
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError('')
                  setSuccess('')
                  setCountdown(0)
                }}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Email verified: {formData.email}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
                  placeholder="Enter new password"
                  disabled={loading}
                  minLength={6}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
                  placeholder="Confirm new password"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg">
            <Lock className="h-12 w-12 text-kwontum-darkRed" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Reset Your Password
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' && 'Enter your email to receive a reset code'}
          {step === 'otp' && 'Enter the 6-digit code sent to your email'}
          {step === 'reset' && 'Enter your new password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-lg sm:px-10">

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['email', 'otp', 'reset'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s ? 'bg-kwontum-darkRed text-white' :
                    step === 'email' && s === 'email' ? 'bg-kwontum-darkRed text-white' :
                      step === 'otp' && (s === 'email' || s === 'otp') ? 'bg-kwontum-darkRed text-white' :
                        step === 'reset' ? 'bg-kwontum-darkRed text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 ${(step === 'otp' && index === 0) || step === 'reset'
                      ? 'bg-kwontum-darkRed'
                      : 'bg-gray-200'
                      }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Enter Email</span>
              <span>Verify Code</span>
              <span>New Password</span>
            </div>
          </div>

          {/* Form */}
          {renderStep()}

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-kwontum-darkRed hover:text-[#5a1219] font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Development Note */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              💡 Development Mode: Check browser console for OTP code
            </p>
          </div>
        )}
      </div>
    </div>
  )
}