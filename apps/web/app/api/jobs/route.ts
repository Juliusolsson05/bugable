import { NextResponse } from 'next/server';
import { prisma, JobStatus } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifySiteOwnership,
  errorResponse,
  normalizePath,
  buildFullUrl,
  countFindingsBySeverity,
  invokeWorker,
} from '@/lib/api-helpers';

// POST /api/jobs - Create a new job (analyze a page)
export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const body = await request.json();
    const { siteId, path, options } = body;

    if (!siteId || typeof siteId !== 'string') {
      return errorResponse('INVALID_INPUT', 'siteId is required', 400);
    }

    if (!path || typeof path !== 'string') {
      return errorResponse('INVALID_INPUT', 'path is required', 400);
    }

    // Verify site ownership
    const { site, error: siteError } = await verifySiteOwnership(siteId, user!.id);
    if (siteError) return siteError;

    const normalizedPath = normalizePath(path);

    // Check for rate limiting (max concurrent jobs)
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

    // Upsert page
    const page = await prisma.page.upsert({
      where: {
        siteId_path: {
          siteId,
          path: normalizedPath,
        },
      },
      create: {
        siteId,
        path: normalizedPath,
      },
      update: {},
    });

    // Create job
    const job = await prisma.job.create({
      data: {
        pageId: page.id,
        status: 'pending',
        progress: 0,
        currentStep: 'Queued',
      },
    });

    // Invoke worker asynchronously (fire-and-forget)
    invokeWorker(job.id).catch(error => {
      console.error(`Failed to invoke worker for job ${job.id}:`, error);
    });

    return NextResponse.json(
      {
        job: {
          id: job.id,
          pageId: job.pageId,
          status: job.status,
          progress: job.progress,
          currentStep: job.currentStep,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        },
        page: {
          id: page.id,
          path: page.path,
          fullUrl: buildFullUrl(site!.baseUrl, page.path),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// GET /api/jobs - List jobs (filtered by siteId, status, pageId)
export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const pageId = searchParams.get('pageId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');
    const sort = searchParams.get('sort') || 'createdAt_desc';

    // Build where clause
    const where: {
      page: {
        site: { userId: string; id?: string };
        id?: string;
      };
      status?: JobStatus;
    } = {
      page: {
        site: { userId: user!.id },
      },
    };

    if (siteId) {
      where.page.site.id = siteId;
    }

    if (pageId) {
      where.page.id = pageId;
    }

    if (status && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
      where.status = status as JobStatus;
    }

    // Parse sort
    const [sortField, sortDirection] = sort.split('_');
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortField === 'createdAt' ? 'createdAt' : 'createdAt'] =
      sortDirection === 'asc' ? 'asc' : 'desc';

    // Fetch jobs
    const jobs = await prisma.job.findMany({
      where,
      include: {
        page: {
          include: {
            site: true,
          },
        },
      },
      orderBy,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Check if there's a next page
    let nextCursor: string | null = null;
    if (jobs.length > limit) {
      const nextItem = jobs.pop();
      nextCursor = nextItem!.id;
    }

    // Transform response
    const transformedJobs = jobs.map((job) => {
      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString() || null,
        page: {
          id: job.page.id,
          path: job.page.path,
          fullUrl: buildFullUrl(job.page.site.baseUrl, job.page.path),
        },
        counts: {
          critical: job.findingsCritical,
          high: job.findingsHigh,
          medium: job.findingsMedium,
          low: job.findingsLow,
        },
      };
    });

    return NextResponse.json({
      jobs: transformedJobs,
      nextCursor,
    });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
