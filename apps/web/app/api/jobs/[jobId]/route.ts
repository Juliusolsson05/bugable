import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  errorResponse,
  buildFullUrl,
} from '@/lib/api-helpers';

// GET /api/jobs/:jobId - Get job detail with findings and events
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const includeEvents = searchParams.get('includeEvents') !== 'false';
    const eventsLimit = Math.min(
      parseInt(searchParams.get('eventsLimit') || '1000'),
      5000
    );

    // Fetch job with events
    const job = await prisma.job.findFirst({
      where: { id: jobId },
      include: {
        page: {
          include: {
            site: true,
          },
        },
        ...(includeEvents
          ? {
              events: {
                orderBy: { timestamp: 'asc' },
                take: eventsLimit,
              },
            }
          : {}),
      },
    });

    if (!job || job.page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Job not found', 404);
    }

    // Extract test result from test_completed event (for totalTurns)
    const completedEvent = job.events?.find(e => e.type === 'test_completed');
    const testResult = completedEvent?.result as any;

    // Get all findings from bugs_detected events
    const findings = job.events
      ?.filter(e => e.type === 'bugs_detected')
      .flatMap(e => {
        const bugs = (e.findings as any[]) || [];
        return bugs.map(bug => ({
          ...bug,
          turn: e.turn,
          timestamp: e.timestamp.toISOString()
        }));
      }) || [];

    // Get turn summaries (combined data from multiple event types)
    const turns: any[] = [];
    if (job.events) {
      const turnNumbers = [...new Set(job.events.map(e => e.turn))].filter(t => t > 0);

      for (const turnNum of turnNumbers) {
        const turnEvents = job.events.filter(e => e.turn === turnNum);
        const screenshotEvent = turnEvents.find(e => e.type === 'screenshot_taken');
        const actionPlannedEvent = turnEvents.find(e => e.type === 'action_planned');
        const actionExecutedEvent = turnEvents.find(e => e.type === 'action_executed');

        turns.push({
          number: turnNum,
          screenshotUrl: screenshotEvent?.screenshotUrl,
          action: actionPlannedEvent?.action,
          reasoning: actionPlannedEvent?.reasoning,
          success: actionExecutedEvent?.success,
          error: actionExecutedEvent?.error,
        });
      }
    }

    // Extract screenshots from turns for easy slider access
    const screenshots = turns
      .filter(t => t.screenshotUrl)
      .map(t => ({
        url: t.screenshotUrl,
        turn: t.number,
      }));

    // Get current turn from latest turn_started event
    const currentTurn = Math.max(0, ...turns.map(t => t.number));

    // Transform response
    const response = {
      job: {
        id: job.id,
        pageId: job.pageId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        screenshotUrl: job.latestScreenshotUrl,
        errorMessage: job.errorMessage,
        completionReason: job.completionReason,
        startedAt: job.startedAt?.toISOString() || null,
        completedAt: job.completedAt?.toISOString() || null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        // Add test result info from completed event
        totalTurns: testResult?.totalTurns,
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
      findings,
      screenshots,
      currentTurn,
      turns,
      ...(includeEvents ? { events: job.events } : {}),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/jobs/:jobId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
