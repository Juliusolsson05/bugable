import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifyJobOwnership,
  errorResponse,
  buildFullUrl,
} from '@/lib/api-helpers';

// POST /api/jobs/:jobId/rerun - Create a new job for the same page
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

    // Check for rate limiting
    const runningJobsCount = await prisma.job.count({
      where: {
        page: {
          site: { userId: user!.id },
        },
        status: { in: ['pending', 'running'] },
      },
    });

    if (runningJobsCount >= 5) {
      return errorResponse(
        'RATE_LIMITED',
        'Maximum concurrent jobs reached. Please wait for existing jobs to complete.',
        429
      );
    }

    // Create new job for the same page
    const newJob = await prisma.job.create({
      data: {
        pageId: existingJob!.pageId,
        status: 'pending',
        progress: 0,
        currentStep: 'Queued',
      },
      include: {
        page: {
          include: {
            site: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        job: {
          id: newJob.id,
          pageId: newJob.pageId,
          status: newJob.status,
          progress: newJob.progress,
          currentStep: newJob.currentStep,
          createdAt: newJob.createdAt.toISOString(),
          updatedAt: newJob.updatedAt.toISOString(),
        },
        page: {
          id: newJob.page.id,
          path: newJob.page.path,
          fullUrl: buildFullUrl(newJob.page.site.baseUrl, newJob.page.path),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/jobs/:jobId/rerun error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
