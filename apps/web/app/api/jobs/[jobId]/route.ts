import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifyJobOwnership,
  errorResponse,
  buildFullUrl,
} from '@/lib/api-helpers';

// GET /api/jobs/:jobId - Get job detail with findings and logs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const includeFindings = searchParams.get('includeFindings') !== 'false';
    const includeLogs = searchParams.get('includeLogs') !== 'false';
    const findingsLimit = Math.min(
      parseInt(searchParams.get('findingsLimit') || '200'),
      500
    );
    const logsLimit = Math.min(
      parseInt(searchParams.get('logsLimit') || '200'),
      500
    );

    // Fetch job with all related data
    const job = await prisma.job.findFirst({
      where: { id: jobId },
      include: {
        page: {
          include: {
            site: true,
          },
        },
        ...(includeFindings
          ? {
              findings: {
                orderBy: [
                  { severity: 'asc' }, // critical first
                  { createdAt: 'desc' },
                ],
                take: findingsLimit,
              },
            }
          : {}),
        ...(includeLogs
          ? {
              reasoningLogs: {
                orderBy: { timestamp: 'asc' },
                take: logsLimit,
              },
            }
          : {}),
      },
    });

    if (!job || job.page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Job not found', 404);
    }

    // Transform response
    const response: Record<string, unknown> = {
      job: {
        id: job.id,
        pageId: job.pageId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        screenshotUrl: job.screenshotUrl,
        startedAt: job.startedAt?.toISOString() || null,
        completedAt: job.completedAt?.toISOString() || null,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
      page: {
        id: job.page.id,
        siteId: job.page.siteId,
        path: job.page.path,
        title: job.page.title,
        fullUrl: buildFullUrl(job.page.site.baseUrl, job.page.path),
        createdAt: job.page.createdAt.toISOString(),
        updatedAt: job.page.updatedAt.toISOString(),
      },
      site: {
        id: job.page.site.id,
        name: job.page.site.name,
        baseUrl: job.page.site.baseUrl,
      },
    };

    if (includeFindings && job.findings) {
      response.findings = job.findings.map((f) => ({
        id: f.id,
        jobId: f.jobId,
        severity: f.severity,
        category: f.category,
        title: f.title,
        description: f.description,
        location: f.elementSelector,
        recommendation: null, // Add to DB if needed
        screenshotUrl: f.screenshotUrl,
        createdAt: f.createdAt.toISOString(),
      }));
    }

    if (includeLogs && job.reasoningLogs) {
      response.logs = job.reasoningLogs.map((log) => ({
        id: log.id,
        jobId: log.jobId,
        timestamp: log.timestamp.toISOString(),
        step: log.action,
        message: log.reasoning,
        location: log.elementSelector,
        screenshotUrl: log.screenshotUrl,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/jobs/:jobId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
