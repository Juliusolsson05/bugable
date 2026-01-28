import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifyJobOwnership,
  errorResponse,
} from '@/lib/api-helpers';

// POST /api/jobs/:jobId/cancel - Cancel a running/pending job
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { job: existingJob, error: jobError } = await verifyJobOwnership(jobId, user!.id);
    if (jobError) return jobError;

    // Check if job can be cancelled
    if (!['pending', 'running'].includes(existingJob!.status)) {
      return errorResponse(
        'CONFLICT',
        `Cannot cancel job with status: ${existingJob!.status}`,
        409
      );
    }

    // Update job status to cancelled
    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        completedAt: job.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/jobs/:jobId/cancel error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
