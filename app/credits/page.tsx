"use client";

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CreditCard,
    History,
    Calendar,
    Briefcase,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Info,
    Shield,
    Award,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

interface CreditTransaction {
    id: string
    amount: number
    reason: string
    created_at: string
    job_id: string | null
    job?: {
        id: string
        title: string
        job_date: string
    }
}

interface CreditStatus {
    currentBalance: number
    lifetimeEarned: number
    monthlyEarned: number
    requiredCredits: number
    creditsAfterDeduction: number
    nextDeductionDate: string
    isOnTrack: boolean
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export default function CreditsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<CreditTransaction[]>([])
    const [creditStatus, setCreditStatus] = useState<CreditStatus>({
        currentBalance: 0,
        lifetimeEarned: 0,
        monthlyEarned: 0,
        requiredCredits: 8,
        creditsAfterDeduction: 0,
        nextDeductionDate: '',
        isOnTrack: false
    })
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    })

    const loadCreditStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/credits/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCreditStatus(data)
            }
        } catch (error) {
            console.error('Error loading credit status:', error)
        }
    }, []) // Add dependencies if needed

    const loadTransactions = useCallback(async (page: number) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/credits/transactions?page=${page}&limit=${pagination.limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions || [])

                // Update pagination info
                setPagination({
                    page: data.page || 1,
                    limit: data.limit || 10,
                    total: data.total || 0,
                    totalPages: data.totalPages || 1,
                    hasNext: data.hasNext || false,
                    hasPrev: data.hasPrev || false
                })
            }
        } catch (error) {
            console.error('Error loading transactions:', error)
        }
    }, [pagination.limit]) // Add pagination.limit as dependency

    // Update useEffect dependencies
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token')
                const userStr = localStorage.getItem('user')

                if (!token || !userStr) {
                    router.push('/login')
                    return
                }

                // Load credit status
                await loadCreditStatus()

                // Load transactions for page 1
                await loadTransactions(1)

            } catch (error) {
                console.error('Error loading credits data:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [router, loadCreditStatus, loadTransactions]) // Add both functions to dependencies

    const handleNextPage = () => {
        if (pagination.hasNext) {
            loadTransactions(pagination.page + 1)
        }
    }

    const handlePrevPage = () => {
        if (pagination.hasPrev) {
            loadTransactions(pagination.page - 1)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatFutureDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(date.getTime() - now.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (in ${diffDays} day${diffDays !== 1 ? 's' : ''})`
    }

    const getStatusColor = (balance: number, required: number) => {
        if (balance >= required * 2) return 'text-green-600 bg-green-50 border-green-200'
        if (balance >= required) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (balance >= required / 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    const getStatusIcon = (balance: number, required: number) => {
        if (balance >= required * 2) return <Award className="h-5 w-5 text-green-600" />
        if (balance >= required) return <Shield className="h-5 w-5 text-blue-600" />
        if (balance >= required / 2) return <Clock className="h-5 w-5 text-yellow-600" />
        return <Clock className="h-5 w-5 text-red-600" />
    }

    const getStatusMessage = (balance: number, required: number, afterDeduction: number) => {
        if (balance >= required * 2) {
            return `Excellent! You have enough credits for ${Math.floor(balance / required)} months ahead.`
        }
        if (balance >= required) {
            return `Good! You&apos;re on track for this month&apos;s deduction.`
        }
        if (balance >= required / 2) {
            return `You're getting there. Keep earning to reach ${required} credits.`
        }
        if (afterDeduction < 0) {
            return `Warning! You'll be at -${Math.abs(afterDeduction)} credits after next deduction.`
        }
        return `You need more credits to maintain your account status.`
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kwontum-darkRed mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading credits...</p>
                </div>
            </div>
        )
    }

    const statusColor = getStatusColor(creditStatus.currentBalance, creditStatus.requiredCredits)

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-kwontum-darkRed" />
                            My Credits
                        </h1>
                        <Link
                            href="/jobs"
                            className="flex items-center gap-2 px-4 py-2 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] font-medium transition-colors"
                        >
                            <Briefcase className="h-4 w-4" />
                            View Jobs
                        </Link>
                    </div>
                    <p className="text-gray-600">
                        Track your credits balance and maintain your account status
                    </p>
                </div>

                {/* Main Credit Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Left Column - Current Balance */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {getStatusIcon(creditStatus.currentBalance, creditStatus.requiredCredits)}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Current Balance</h2>
                                    <p className="text-gray-600 text-sm">Available credits</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {creditStatus.currentBalance}
                                </div>
                                <div className={`text-sm px-3 py-1 rounded-full inline-flex items-center gap-2 ${statusColor}`}>
                                    {creditStatus.currentBalance >= creditStatus.requiredCredits ? (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            Account Active
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-4 w-4" />
                                            Needs Attention
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Monthly Requirement */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Monthly Requirement</span>
                                    </div>
                                    <span className="font-bold">{creditStatus.requiredCredits} credits</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700">Next Deduction</span>
                                    </div>
                                    <span className="font-bold text-blue-900">
                                        {formatFutureDate(creditStatus.nextDeductionDate)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Projection */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Status & Projection</h3>

                            {/* After Next Deduction */}
                            <div className="mb-6 p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">After next deduction:</span>
                                    <span className={`font-bold ${creditStatus.creditsAfterDeduction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {creditStatus.creditsAfterDeduction >= 0 ? '+' : ''}{creditStatus.creditsAfterDeduction} credits
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${creditStatus.creditsAfterDeduction >= 0 ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(Math.abs(creditStatus.creditsAfterDeduction) * 10, 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Status Message */}
                            <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium mb-1">
                                            {getStatusMessage(
                                                creditStatus.currentBalance,
                                                creditStatus.requiredCredits,
                                                creditStatus.creditsAfterDeduction
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Maintain at least {creditStatus.requiredCredits} credits to keep your account active.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm text-gray-700">Lifetime Earned</span>
                                    </div>
                                    <span className="font-bold">{creditStatus.lifetimeEarned}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-gray-700">This Month Earned</span>
                                    </div>
                                    <span className="font-bold text-green-600">+{creditStatus.monthlyEarned}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="h-6 w-6 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-3 mb-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No transactions yet</p>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${transaction.amount > 0
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                }`}>
                                                {transaction.amount > 0 ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                                                </p>
                                                <p className="text-sm text-gray-600">{transaction.reason}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {transactions.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={!pagination.hasPrev}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${pagination.hasPrev
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    <span className="px-3 py-1 text-sm text-gray-700">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNext}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${pagination.hasNext
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-r from-kwontum-darkRed to-[#8a1c24] rounded-xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How the Credit System Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">Earn credits by completing jobs</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">{creditStatus.requiredCredits} credits deducted monthly</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">Unused credits roll over to next month</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">Maintain positive balance for active status</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">Negative balance may affect job eligibility</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-300">✓</span>
                                <span className="text-sm">Next deduction: {formatFutureDate(creditStatus.nextDeductionDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}