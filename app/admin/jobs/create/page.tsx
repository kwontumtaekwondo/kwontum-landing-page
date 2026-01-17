// app/admin/jobs/create/page.tsx
"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    details: '',
    jobDate: '',
    credits: '2'
  })

  // Add this useEffect at the top of your component
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userStr)

        if (!user.isAdmin) {
          // Not admin - redirect to jobs page or home
          router.push('/jobs')
          return
        }

        // User is admin, continue loading
        setLoading(false)

      } catch (err) {
        console.error('Error checking admin:', err)
        router.push('/login')
      }
    }

    checkAdmin()
  }, [router])
  // Simple form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!form.title.trim()) {
      setError('Job title is required')
      return
    }

    if (!form.details.trim()) {
      setError('Job details are required')
      return
    }

    if (!form.jobDate) {
      setError('Job date is required')
      return
    }

    const credits = parseInt(form.credits)
    if (isNaN(credits) || credits < 1) {
      setError('Credits must be at least 1')
      return
    }

    setLoading(true)

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login first')
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title.trim(),
          details: form.details.trim(),
          jobDate: new Date(form.jobDate).toISOString(),
          credits: credits,
          status: 'open'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job')
      }

      setSuccess('Job created successfully!')

      // Clear form
      setForm({
        title: '',
        details: '',
        jobDate: '',
        credits: '50'
      })

      // Optionally redirect after 0.1 seconds
      setTimeout(() => {
        router.push('/jobs')
      }, 100)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job</h1>
          <p className="text-gray-600">Post a job opportunity for students</p>
          <button
            onClick={() => router.push('/jobs')}
            className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            ← Back to Jobs
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job title"
                required
              />
            </div>

            {/* Details */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Job Details *</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the job"
                required
              />
            </div>

            {/* Date and Credits in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Job Date */}
              <div>
                <label className="block text-gray-700 mb-2">Job Date *</label>
                <input
                  type="datetime-local"
                  name="jobDate"
                  value={form.jobDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Credits */}
              <div>
                <label className="block text-gray-700 mb-2">Credits *</label>
                <input
                  type="number"
                  name="credits"
                  value={form.credits}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Job...' : 'Create Job'}
            </button>
          </form>
        </div>

        {/* Simple Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-bold text-blue-700 mb-2">Job Info</h3>
          <p className="text-sm text-blue-600">
            • Jobs will be marked as &quot;Open&quot; for students to accept<br />
            • Be clear about requirements
          </p>
        </div>
      </div>
    </div>
  )
}