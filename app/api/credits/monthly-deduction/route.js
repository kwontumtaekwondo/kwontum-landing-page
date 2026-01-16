// app/api/cron/monthly-deduction/route.js
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST() {
  try {
    // Execute with secret parameter
    const { data, error } = await supabaseServer
      .rpc('deduct_monthly_credits', {
        secret_key: CRON_SECRET
      })

    if (error) {
      console.error('Error executing monthly deduction:', error)
      return NextResponse.json(
        { error: 'Failed to process monthly deductions' },
        { status: 500 }
      )
    }

    // Check if the RPC function returned an error
    if (data?.error) {
      console.error('RPC function error:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly deductions processed successfully',
      timestamp: new Date().toISOString(),
      ...data
    })

  } catch (error) {
    console.error('Monthly deduction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}