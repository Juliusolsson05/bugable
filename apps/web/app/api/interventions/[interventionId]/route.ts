import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { getAuthenticatedUser, errorResponse } from '@/lib/api-helpers';

// PATCH /api/interventions/:interventionId - User responds to intervention
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ interventionId: string }> }
) {
  try {
    const { interventionId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    // Get intervention with job ownership check
    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: {
        job: {
          include: {
            page: {
              include: {
                site: true,
              },
            },
          },
        },
      },
    });

    if (!intervention) {
      return errorResponse('NOT_FOUND', 'Intervention not found', 404);
    }

    // Verify ownership
    if (intervention.job.page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Intervention not found', 404);
    }

    // Check if already responded
    if (intervention.status === 'responded') {
      return errorResponse('BAD_REQUEST', 'Intervention already responded', 400);
    }

    const body = await request.json();
    const { response, skip } = body;

    // Handle skip
    if (skip === true) {
      const updated = await prisma.intervention.update({
        where: { id: interventionId },
        data: {
          status: 'skipped',
          respondedAt: new Date(),
        },
      });

      return NextResponse.json({ intervention: updated });
    }

    // Validate response
    if (!response || typeof response !== 'string') {
      return errorResponse('BAD_REQUEST', 'response is required', 400);
    }

    // Update intervention
    const updated = await prisma.intervention.update({
      where: { id: interventionId },
      data: {
        status: 'responded',
        response,
        respondedAt: new Date(),
      },
    });

    // Optionally trigger n8n webhook (if configured)
    const webhookUrl = process.env.N8N_INTERVENTION_WEBHOOK_URL;
    if (webhookUrl) {
      // Fire-and-forget webhook to n8n
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interventionId: updated.id,
          jobId: updated.jobId,
          findingRef: updated.findingRef,
          type: updated.type,
          response: updated.response,
        }),
      }).catch((err) => {
        console.error('Failed to notify n8n of intervention response:', err);
      });
    }

    return NextResponse.json({ intervention: updated });
  } catch (error) {
    console.error('PATCH /api/interventions/:interventionId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// GET /api/interventions/:interventionId - Get intervention details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ interventionId: string }> }
) {
  try {
    const { interventionId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: {
        job: {
          include: {
            page: {
              include: {
                site: true,
              },
            },
          },
        },
      },
    });

    if (!intervention) {
      return errorResponse('NOT_FOUND', 'Intervention not found', 404);
    }

    // Verify ownership
    if (intervention.job.page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Intervention not found', 404);
    }

    return NextResponse.json({
      intervention: {
        id: intervention.id,
        jobId: intervention.jobId,
        findingRef: intervention.findingRef,
        type: intervention.type,
        status: intervention.status,
        prompt: intervention.prompt,
        placeholder: intervention.placeholder,
        yesLabel: intervention.yesLabel,
        noLabel: intervention.noLabel,
        otherLabel: intervention.otherLabel,
        response: intervention.response,
        createdAt: intervention.createdAt.toISOString(),
        respondedAt: intervention.respondedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('GET /api/interventions/:interventionId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
