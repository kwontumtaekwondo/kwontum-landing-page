"use client";

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Briefcase,
    Calendar,
    CreditCard,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    Plus,
    Filter,
    Search,
    AlertCircle,
    X
} from 'lucide-react'

interface Job {
    id: string
    title: string
    details: string
    job_date: string
    credits: number
    status: 'open' | 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'incomplete'
    created_by?: {
        id: string
        name: string
        email: string
    }
    accepted_by?: {
        id: string
        name: string
        email: string
    }
    created_at: string
}

interface AppUser {
    id: string
    name: string
    email: string
    isAdmin?: boolean
    // Add other user properties you expect
    [key: string]: unknown // Use unknown instead of any
}

export default function JobsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authChecked, setAuthChecked] = useState(false)
    const [jobs, setJobs] = useState<Job[]>([])
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
    const [user, setUser] = useState<AppUser | null>(null)
    const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [showUpdateToast, setShowUpdateToast] = useState(false)
    const [updatedJobsCount, setUpdatedJobsCount] = useState(0)

    // Check auth
    useEffect(() => {
        const checkAuth = () => {
            if (typeof window === 'undefined') return

            const token = localStorage.getItem('token')
            const userStr = localStorage.getItem('user')

            if (!token || !userStr) {
                router.push('/')
                return
            }

            try {
                const userData = JSON.parse(userStr)
                setUser(userData)
                setAuthChecked(true)
            } catch (err) {
                console.error('Error parsing user data:', err)
                router.push('/')
            }
        }

        checkAuth()
    }, [router])

    // Function to update expired booked jobs in database
    const updateExpiredBookedJobs = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/jobs/update-statuses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })

            if (!response.ok) {
                throw new Error('Failed to update job statuses')
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error updating expired jobs:', error)
            return { updatedCount: 0 }
        }
    }, [])

    // Load jobs after auth is checked
    useEffect(() => {
        const loadJobs = async () => {
            if (!authChecked) return

            try {
                setLoading(true)
                const token = localStorage.getItem('token')

                // FIRST: Update expired jobs for all users
                const updateResult = await updateExpiredBookedJobs()

                if (updateResult.updatedCount > 0) {
                    setUpdatedJobsCount(updateResult.updatedCount)
                    setShowUpdateToast(true)

                    // Auto-hide toast after 5 seconds
                    setTimeout(() => {
                        setShowUpdateToast(false)
                    }, 5000)
                }

                // THEN: Load jobs
                const response = await fetch('/api/jobs', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                    },
                    cache: 'no-store'
                })

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        router.push('/')
                        return
                    }
                    throw new Error('Failed to load jobs')
                }

                const data = await response.json()
                const loadedJobs = data.jobs || []

                setJobs(loadedJobs)
                setFilteredJobs(loadedJobs)
            } catch (err) {
                console.error('Error loading jobs:', err)
            } finally {
                setLoading(false)
            }
        }

        loadJobs()
    }, [authChecked, router, updateExpiredBookedJobs])

    // Filter jobs based on active tab and filters
    useEffect(() => {
        if (!authChecked) return

        let filtered = jobs

        // Filter by active/archive tab
        if (activeTab === 'active') {
            filtered = filtered.filter(job =>
                job.status === 'open' ||
                job.status === 'booked' ||
                job.status === 'in_progress'
            )
        } else {
            filtered = filtered.filter(job =>
                job.status === 'completed' ||
                job.status === 'cancelled' ||
                job.status === 'incomplete'
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => job.status === statusFilter)
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(term) ||
                job.details.toLowerCase().includes(term) ||
                job.created_by?.name?.toLowerCase().includes(term) ||
                job.accepted_by?.name?.toLowerCase().includes(term)
            )
        }

        setFilteredJobs(filtered)
    }, [jobs, activeTab, statusFilter, searchTerm, authChecked])

    const handleAcceptJob = async (jobId: string) => {
        if (!user) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${jobId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to accept job')
            }

            // Reload jobs
            const jobsResponse = await fetch('/api/jobs', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })
            const jobsData = await jobsResponse.json()
            setJobs(jobsData.jobs || [])
        } catch (err) {
            console.error('Error accepting job:', err)
            alert(err instanceof Error ? err.message : 'Failed to accept job')
        }
    }

    // Handle cancel job - calls the release endpoint
    const handleCancelJob = async (jobId: string, jobTitle: string) => {
        if (!confirm(`Are you sure you want to cancel "${jobTitle}"? This will release the job back to open status for others to accept.`)) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${jobId}/release`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to cancel job')
            }

            alert('Job cancelled successfully! It is now available for others to accept.')

            // Reload jobs
            const jobsResponse = await fetch('/api/jobs', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })
            const jobsData = await jobsResponse.json()
            setJobs(jobsData.jobs || [])
        } catch (err) {
            console.error('Error cancelling job:', err)
            alert(err instanceof Error ? err.message : 'Failed to cancel job')
        }
    }

    const handleMarkComplete = async (jobId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${jobId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
                body: JSON.stringify({ status: 'completed' })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to mark job as complete')
            }

            const result = await response.json()

            // Reload jobs
            const jobsResponse = await fetch('/api/jobs', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })
            const jobsData = await jobsResponse.json()
            setJobs(jobsData.jobs || [])

            // Refresh user data if credits were awarded
            if (result.creditsAwarded) {
                const userResponse = await fetch('/api/auth/me', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                    },
                    cache: 'no-store'
                })
                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    localStorage.setItem('user', JSON.stringify(userData.user))
                    setUser(userData.user)
                }

                alert(`✓ Job marked as complete!\n✓ ${result.creditsAwarded.amount} credits awarded to the user.`)
            }
        } catch (err) {
            console.error('Error marking job complete:', err)
            alert(err instanceof Error ? err.message : 'Failed to update job status')
        }
    }

    const handleMarkIncomplete = async (jobId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${jobId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
                body: JSON.stringify({ status: 'incomplete' })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to mark job as incomplete')
            }

            // Reload jobs
            const jobsResponse = await fetch('/api/jobs', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })
            const jobsData = await jobsResponse.json()
            setJobs(jobsData.jobs || [])
        } catch (err) {
            console.error('Error marking job incomplete:', err)
            alert(err instanceof Error ? err.message : 'Failed to update job status')
        }
    }

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete job')
            }

            setJobs(prev => prev.filter(job => job.id !== jobId))
        } catch (err) {
            console.error('Error deleting job:', err)
            alert(err instanceof Error ? err.message : 'Failed to delete job')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800'
            case 'booked': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-purple-100 text-purple-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'incomplete': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <CheckCircle className="h-4 w-4" />
            case 'booked': return <User className="h-4 w-4" />
            case 'in_progress': return <Clock className="h-4 w-4" />
            case 'completed': return <CheckCircle className="h-4 w-4" />
            case 'cancelled': return <XCircle className="h-4 w-4" />
            case 'incomplete': return <XCircle className="h-4 w-4" />
            default: return <CheckCircle className="h-4 w-4" />
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const isPast = date <= now

        return (
            <span className={isPast ? 'text-red-600 font-medium' : ''}>
                {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                {isPast && ' (Past due)'}
            </span>
        )
    }

    // Show loading while checking auth
    if (loading || !authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kwontum-darkRed mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Update Toast Notification */}
            {showUpdateToast && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-800">
                                    Job Statuses Updated
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    {updatedJobsCount} job(s) automatically moved from &quot;booked&quot; to &quot;in progress&quot;.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUpdateToast(false)}
                                className="ml-4 text-green-600 hover:text-green-800"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Jobs Dashboard</h1>
                            <p className="mt-2 text-gray-600">
                                Welcome back, {user?.name}!
                            </p>
                        </div>

                        <div className="flex items-center gap-4">

                            {/* Create Job Button (Admin only) */}
                            {user?.isAdmin && (
                                <Link
                                    href="/admin/jobs/create"
                                    className="flex items-center gap-2 px-4 py-2 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create Job
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'active'
                                ? 'border-kwontum-darkRed text-kwontum-darkRed'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Briefcase className="h-4 w-4 inline mr-2" />
                            Active Jobs ({jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled' && j.status !== 'incomplete').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('archive')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'archive'
                                ? 'border-kwontum-darkRed text-kwontum-darkRed'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                            Archive ({jobs.filter(j => j.status === 'completed' || j.status === 'cancelled' || j.status === 'incomplete').length})
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs by title, details, or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-auto">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kwontum-darkRed focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="all">All Statuses</option>
                                    {activeTab === 'active' ? (
                                        <>
                                            <option value="open">Open</option>
                                            <option value="booked">Booked</option>
                                            <option value="in_progress">In Progress</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="incomplete">Incomplete</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Jobs Count */}
                    <div className="text-sm text-gray-600 mb-4">
                        Showing {filteredJobs.length} of {jobs.length} jobs
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => {
                        return (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Job Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                                                    {getStatusIcon(job.status)}
                                                    {job.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(job.job_date)}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-600">
                                                    <CreditCard className="h-4 w-4" />
                                                    {job.credits} credits
                                                </span>
                                            </div>
                                        </div>

                                        {/* Admin Actions */}
                                        {user?.isAdmin && (
                                            <button
                                                onClick={() => handleDeleteJob(job.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete job"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Job Details */}
                                    <p className="text-gray-700 mb-4 whitespace-pre-line">{job.details}</p>

                                    {/* Job Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Posted by</p>
                                            <p className="font-medium">{job.created_by?.name || 'System'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Accepted by</p>
                                            <p className="font-medium">
                                                {job.accepted_by?.name ||
                                                    (job.status === 'open' ? 'Not accepted yet' : 'Not assigned')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Actions */}
                                <div className="p-6 bg-gray-50">
                                    <div className="flex flex-wrap gap-3">
                                        {/* Accept Job Button (for open jobs) */}
                                        {job.status === 'open' && !user?.isAdmin && (
                                            <button
                                                onClick={() => handleAcceptJob(job.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                            >
                                                Accept Job
                                            </button>
                                        )}

                                        {/* Cancel Job Button (for booked/in_progress jobs by acceptor) */}
                                        {(job.status === 'booked' || job.status.toLowerCase() === 'in_progress') &&
                                            job.accepted_by?.id === user?.id && (
                                                <div className="flex flex-wrap gap-3">
                                                    {/* Cancel Job Button */}
                                                    <button
                                                        onClick={() => handleCancelJob(job.id, job.title)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancel Job
                                                    </button>
                                                </div>
                                            )}

                                        {/* Admin Actions for in_progress jobs */}
                                        {user?.isAdmin && job.status === 'in_progress' && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkComplete(job.id)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                                                >
                                                    Mark Complete
                                                </button>
                                                <button
                                                    onClick={() => handleMarkIncomplete(job.id)}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                                                >
                                                    Mark Incomplete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {filteredJobs.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === 'active'
                                ? 'There are currently no active jobs available.'
                                : 'There are no archived jobs yet.'}
                        </p>
                        {user?.isAdmin && activeTab === 'active' && (
                            <Link
                                href="/admin/jobs/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium"
                            >
                                <Plus className="h-5 w-5" />
                                Create Your First Job
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Add CSS for slide-in animation */}
            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}