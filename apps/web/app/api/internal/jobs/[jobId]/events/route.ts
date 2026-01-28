import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { validateInternalRequest, errorResponse } from '@/lib/api-helpers';

type EventType = 'progress' | 'log' | 'finding' | 'status';

interface ProgressEventData {
  progress: number;
  currentStep: string;
}

interface LogEventData {
  step: string;
  message: string;
  location?: string | null;
  screenshotUrl?: string | null;
}

interface FindingEventData {
  severity: 'critical' | 'warning' | 'info';
  category: 'ux' | 'ui' | 'security' | 'performance' | 'accessibility' | 'seo';
  title: string;
  description: string;
  location?: string | null;
  recommendation?: string | null;
  screenshotUrl?: string | null;
}

interface StatusEventData {
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string;
  screenshotUrl?: string;
}

interface JobEvent {
  type: EventType;
  timestamp: string;
  data: ProgressEventData | LogEventData | FindingEventData | StatusEventData;
}

// POST /api/internal/jobs/:jobId/events - Receive events from the QA runner
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Validate internal request
    if (!validateInternalRequest(request)) {
      return errorResponse('UNAUTHORIZED', 'Invalid internal secret', 401);
    }

    const { jobId } = await params;

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return errorResponse('NOT_FOUND', 'Job not found', 404);
    }

    let jobStatus = job.status;
    let jobStartedAt = job.startedAt;
    const terminalStatuses = new Set(['completed', 'failed', 'cancelled']);

    const body = await request.json();
    const { events } = body as { events: JobEvent[] };

    if (!Array.isArray(events)) {
      return errorResponse('INVALID_INPUT', 'events must be an array', 400);
    }

    let accepted = 0;
    let ignored = 0;

    for (const event of events) {
      try {
        if (terminalStatuses.has(jobStatus)) {
          ignored++;
          continue;
        }

        const timestamp = new Date(event.timestamp);

        switch (event.type) {
          case 'progress': {
            const data = event.data as ProgressEventData;
            const clampedProgress = Math.max(0, Math.min(100, data.progress));
            const updateData: Record<string, unknown> = {
              progress: clampedProgress,
              currentStep: data.currentStep,
            };

            if (jobStatus === 'pending') {
              updateData.status = 'running';
              updateData.startedAt = jobStartedAt ?? timestamp;
              jobStatus = 'running';
              jobStartedAt = updateData.startedAt as Date;
            }

            await prisma.job.update({ where: { id: jobId }, data: updateData });
            accepted++;
            break;
          }

          case 'log': {
            const data = event.data as LogEventData;
            await prisma.reasoningLog.create({
              data: {
                jobId,
                timestamp,
                action: data.step,
                reasoning: data.message,
                elementSelector: data.location || null,
                screenshotUrl: data.screenshotUrl || null,
              },
            });
            accepted++;
            break;
          }

          case 'finding': {
            const data = event.data as FindingEventData;
            await prisma.finding.create({
              data: {
                jobId,
                severity: data.severity,
                category: data.category,
                title: data.title,
                description: data.description,
                elementSelector: data.location || null,
                screenshotUrl: data.screenshotUrl || null,
              },
            });
            accepted++;
            break;
          }

          case 'status': {
            const data = event.data as StatusEventData;
            const updateData: Record<string, unknown> = {};

            if (data.status === 'running') {
              if (jobStatus === 'pending') {
                updateData.status = 'running';
                updateData.startedAt = jobStartedAt ?? timestamp;
                jobStatus = 'running';
                jobStartedAt = updateData.startedAt as Date;
              } else {
                ignored++;
                break;
              }
            }

            if (data.status === 'completed') {
              updateData.status = 'completed';
              updateData.progress = 100;
              updateData.currentStep = 'Complete';
              updateData.completedAt = timestamp;
              jobStatus = 'completed';
            }

            if (data.status === 'failed') {
              updateData.status = 'failed';
              updateData.errorMessage = data.errorMessage || 'Job failed';
              updateData.completedAt = timestamp;
              jobStatus = 'failed';
            }

            if (data.screenshotUrl) {
              updateData.screenshotUrl = data.screenshotUrl;
            }

            if (Object.keys(updateData).length === 0) {
              ignored++;
              break;
            }

            await prisma.job.update({ where: { id: jobId }, data: updateData });
            accepted++;
            break;
          }

          default:
            console.warn(`Unknown event type: ${event.type}`);
        }
      } catch (eventError) {
        console.error(`Error processing event:`, eventError);
        // Continue processing other events
      }
    }

    return NextResponse.json({ accepted, ignored });
  } catch (error) {
    console.error('POST /api/internal/jobs/:jobId/events error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
