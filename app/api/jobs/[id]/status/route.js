import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('is_admin')
      .eq('id', decoded.sub)
      .single()

    if (userError || !user?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const jobId = params.id
    const { status, reason } = await request.json()

    // Add 'incomplete' to the allowed statuses
    if (!['in_progress', 'completed', 'cancelled', 'incomplete'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the job details first to check current status and get credits
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError) {
      console.error('Error fetching job:', jobError)
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // If marking as completed, check if we need to award credits
    let creditTransaction = null
    if (status === 'completed' && job.status !== 'completed' && job.accepted_by) {
      // Check if credits were already awarded (prevent double awarding)
      const { data: existingTransaction } = await supabaseServer
        .from('credit_transactions')
        .select('id')
        .eq('job_id', jobId)
        .eq('reason', 'LIKE', '%Job Completed:%')
        .single()

      if (!existingTransaction) {
        // Determine the reason text
        let reasonText = '';
        
        if (reason && reason.trim() !== '') {
          // If admin provided a reason, use it
          reasonText = `Job Completed: ${reason.trim()}`;
        } else {
          // Auto-generated system reason with job details
          reasonText = `Job Completed: "${job.title}" (${formatDate(job.job_date)}) - ${job.details.substring(0, 100)}${job.details.length > 100 ? '...' : ''}`;
        }

        // Award credits to the user who accepted the job
        const { data: transaction, error: transactionError } = await supabaseServer
          .from('credit_transactions')
          .insert({
            user_id: job.accepted_by,
            job_id: jobId,
            amount: job.credits,
            reason: reasonText
          })
          .select()
          .single()

        if (transactionError) {
          console.error('Error creating credit transaction:', transactionError)
          return NextResponse.json(
            { error: 'Failed to award credits' },
            { status: 500 }
          )
        }

        creditTransaction = transaction

        // Also update user's total credits
        const { error: updateUserError } = await supabaseServer
          .rpc('increment_user_credits', {
            user_id: job.accepted_by,
            amount: job.credits
          })

        if (updateUserError) {
          console.error('Error updating user credits:', updateUserError)
          // Continue with job update even if user credit update fails
        }
      }
    }

    // If marking as incomplete, create a transaction record without awarding credits
    if (status === 'incomplete' && job.accepted_by) {
      // Create a transaction record to track that job was marked incomplete
      const { error: transactionError } = await supabaseServer
        .from('credit_transactions')
        .insert({
          user_id: job.accepted_by,
          job_id: jobId,
          amount: 0,
          reason: `Job Marked Incomplete: "${job.title}" (${formatDate(job.job_date)})`
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating incomplete transaction:', transactionError)
        // Continue with job update even if transaction creation fails
      }
    }

    // Update job status
    const { error: updateError } = await supabaseServer
      .from('jobs')
      .update({
        status,
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Error updating job status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      )
    }

    const response = {
      success: true,
      message: 'Job status updated successfully'
    }

    // Include credit award info if applicable
    if (creditTransaction) {
      response.creditsAwarded = {
        amount: job.credits,
        userId: job.accepted_by,
        transactionId: creditTransaction.id,
        reason: creditTransaction.reason
      }
      
      if (reason && reason.trim() !== '') {
        response.message = `Job marked as completed and ${job.credits} credits awarded with custom reason`;
      } else {
        response.message = `Job marked as completed and ${job.credits} credits awarded`;
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Update job status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}