"use client";

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    CreditCard,
    Lock,
    Unlock,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Clock,
    Shield,
} from 'lucide-react'

interface User {
    id: string
    name: string
    email: string
    is_admin: boolean
    status: 'active' | 'locked'
    credit: number
    created_at: string
    stats?: {
        activeJobs: number
        completedJobs: number
        totalJobs: number
    }
}

interface Pagination {
    currentPage: number
    totalPages: number
    totalUsers: number
    limit: number
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 20
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dropdownPosition, setDropdownPosition] = useState<{x: number, y: number, userId: string} | null>(null)
    const [showAdjustCreditsModal, setShowAdjustCreditsModal] = useState(false)
    const [showLockModal, setShowLockModal] = useState(false)
    const [showUnlockModal, setShowUnlockModal] = useState(false)
    const [creditsAmount, setCreditsAmount] = useState('')
    const [actionReason, setActionReason] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownPosition) {
                const portalElement = document.getElementById('dropdown-portal')
                if (portalElement && !portalElement.contains(event.target as Node)) {
                    setDropdownPosition(null)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [dropdownPosition])

    // Close dropdown when modals open
    useEffect(() => {
        if (showAdjustCreditsModal || showLockModal || showUnlockModal) {
            setDropdownPosition(null)
        }
    }, [showAdjustCreditsModal, showLockModal, showUnlockModal])

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // Build query parameters
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.limit.toString()
            })

            if (searchTerm) params.append('search', searchTerm)
            if (statusFilter !== 'all') params.append('status', statusFilter)

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/')
                    return
                }
                throw new Error('Failed to load users')
            }

            const data = await response.json()
            setUsers(data.users || [])
            setPagination(prev => ({
                ...prev,
                ...(data.pagination || {})
            }))
        } catch (error) {
            console.error('Error loading users:', error)
            setErrorMessage('Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [pagination.currentPage, pagination.limit, searchTerm, statusFilter, router])

    // Load users on component mount
    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return
        setPagination(prev => ({ ...prev, currentPage: page }))
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, currentPage: 1 }))
    }

    const handleAdjustCredits = async () => {
        if (!selectedUser || !creditsAmount || !actionReason) return

        try {
            setActionLoading(true)
            const token = localStorage.getItem('token')
            const amount = parseInt(creditsAmount)

            const response = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    reason: actionReason
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to adjust credits')
            }

            setSuccessMessage(`Successfully adjusted ${amount} credits for ${selectedUser.name}`)
            setShowAdjustCreditsModal(false)
            setCreditsAmount('')
            setActionReason('')
            loadUsers() // Refresh user list
        } catch (error) {
            console.error('Error adjusting credits:', error)
            setErrorMessage(error instanceof Error ? error.message : 'Failed to adjust credits')
        } finally {
            setActionLoading(false)
        }
    }

    const handleLockAccount = async () => {
        if (!selectedUser || !actionReason) return

        try {
            setActionLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/admin/users/${selectedUser.id}/lock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: actionReason })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to lock account')
            }

            setSuccessMessage(`Account locked for ${selectedUser.name}`)
            setShowLockModal(false)
            setActionReason('')
            loadUsers() // Refresh user list
        } catch (error) {
            console.error('Error locking account:', error)
            setErrorMessage(error instanceof Error ? error.message : 'Failed to lock account')
        } finally {
            setActionLoading(false)
        }
    }

    const handleUnlockAccount = async () => {
        if (!selectedUser || !actionReason) return

        try {
            setActionLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/admin/users/${selectedUser.id}/unlock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: actionReason })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unlock account')
            }

            setSuccessMessage(`Account unlocked for ${selectedUser.name}`)
            setShowUnlockModal(false)
            setActionReason('')
            loadUsers() // Refresh user list
        } catch (error) {
            console.error('Error unlocking account:', error)
            setErrorMessage(error instanceof Error ? error.message : 'Failed to unlock account')
        } finally {
            setActionLoading(false)
        }
    }

    const viewUserTransactions = (userId: string) => {
        router.push(`/admin/users/${userId}/transactions`)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'locked': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-3 w-3" />
            case 'locked': return <XCircle className="h-3 w-3" />
            default: return <AlertCircle className="h-3 w-3" />
        }
    }

    // Clear messages after 5 seconds
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('')
                setErrorMessage('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage, errorMessage])

    // Get the current user for the dropdown
    const currentDropdownUser = dropdownPosition ? users.find(u => u.id === dropdownPosition.userId) : null

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-800">Success</p>
                                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                            </div>
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="ml-4 text-green-600 hover:text-green-800"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage('')}
                                className="ml-4 text-red-600 hover:text-red-800"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAdjustCreditsModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Adjust Credits for {selectedUser.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Current balance: <span className="font-bold">{selectedUser.credit} credits</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (positive to add, negative to deduct)
                                    </label>
                                    <input
                                        type="number"
                                        value={creditsAmount}
                                        onChange={(e) => setCreditsAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 10 or -5"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason (required)
                                    </label>
                                    <textarea
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter reason for credit adjustment..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowAdjustCreditsModal(false)
                                        setCreditsAmount('')
                                        setActionReason('')
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdjustCredits}
                                    disabled={actionLoading || !creditsAmount || !actionReason}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Adjust Credits'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLockModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    Lock Account: {selectedUser.name}
                                </h3>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-700">
                                    <strong>Warning:</strong> Locking this account will:
                                </p>
                                <ul className="text-sm text-red-700 mt-2 space-y-1">
                                    <li>• Change account status to &quot;locked&quot;</li>
                                    <li>• Release all their booked/in-progress jobs</li>
                                    <li>• Prevent them from accepting new jobs</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for locking (required)
                                </label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Enter reason for locking account..."
                                    rows={3}
                                    autoFocus
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowLockModal(false)
                                        setActionReason('')
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLockAccount}
                                    disabled={actionLoading || !actionReason}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Locking...' : 'Lock Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUnlockModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Unlock className="h-6 w-6 text-green-600" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    Unlock Account: {selectedUser.name}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Unlocking will restore this user&apos;s ability to accept and work on jobs.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for unlocking (required)
                                </label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter reason for unlocking account..."
                                    rows={3}
                                    autoFocus
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowUnlockModal(false)
                                        setActionReason('')
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUnlockAccount}
                                    disabled={actionLoading || !actionReason}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Unlocking...' : 'Unlock Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                                <p className="text-gray-600 mt-1">Manage user accounts, credits, and status</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadUsers}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold">{pagination.totalUsers}</p>
                                </div>
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {users.filter(u => u.status === 'active' && !u.is_admin).length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Locked Accounts</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {users.filter(u => u.status === 'locked').length}
                                    </p>
                                </div>
                                <Lock className="h-8 w-8 text-red-400" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Admin Users</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {users.filter(u => u.is_admin).length}
                                    </p>
                                </div>
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search users by name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active Only</option>
                                    <option value="locked">Locked Only</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search filters'
                                    : 'No users in the system yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Credits
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Job Stats
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Member Since
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {user.name}
                                                                </p>
                                                                {user.is_admin && (
                                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                        {getStatusIcon(user.status)}
                                                        {user.status.toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                                        <span className="font-bold">{user.credit}</span>
                                                        <span className="text-sm text-gray-500">credits</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {user.stats ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                                                <span>{user.stats.completedJobs} completed</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-3 w-3 text-blue-500" />
                                                                <span>{user.stats.activeJobs} active</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">No jobs</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                const rect = e.currentTarget.getBoundingClientRect()
                                                                if (dropdownPosition?.userId === user.id) {
                                                                    setDropdownPosition(null)
                                                                } else {
                                                                    setDropdownPosition({
                                                                        x: rect.right,
                                                                        y: rect.bottom,
                                                                        userId: user.id
                                                                    })
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                                        >
                                                            <MoreVertical className="h-5 w-5 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                                            <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}</span> of{' '}
                                            <span className="font-medium">{pagination.totalUsers}</span> users
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                        pageNum = pagination.totalPages - 4 + i;
                                                    } else {
                                                        pageNum = pagination.currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-10 h-10 rounded-lg ${pagination.currentPage === pageNum
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Dropdown Portal */}
            {dropdownPosition && typeof document !== 'undefined' && createPortal(
                <div 
                    id="dropdown-portal"
                    className="fixed z-[9999] w-48 bg-white rounded-lg shadow-xl border max-h-64 overflow-y-auto"
                    style={{
                        top: `${Math.min(dropdownPosition.y, window.innerHeight - 200)}px`,
                        left: `${Math.max(dropdownPosition.x - 192, 10)}px`,
                    }}
                >
                    <div className="py-1">
                        {currentDropdownUser && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        viewUserTransactions(currentDropdownUser.id)
                                        setDropdownPosition(null)
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Transactions
                                </button>

                                {!currentDropdownUser.is_admin && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedUser(currentDropdownUser)
                                                setShowAdjustCreditsModal(true)
                                                setDropdownPosition(null)
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Adjust Credits
                                        </button>

                                        {currentDropdownUser.status === 'active' ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedUser(currentDropdownUser)
                                                    setShowLockModal(true)
                                                    setDropdownPosition(null)
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                                            >
                                                <Lock className="h-4 w-4" />
                                                Lock Account
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedUser(currentDropdownUser)
                                                    setShowUnlockModal(true)
                                                    setDropdownPosition(null)
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100 text-left"
                                            >
                                                <Unlock className="h-4 w-4" />
                                                Unlock Account
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Animation style */}
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