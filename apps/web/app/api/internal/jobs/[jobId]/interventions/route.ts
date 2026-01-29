import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { validateInternalRequest, errorResponse } from '@/lib/api-helpers';

// POST /api/internal/jobs/:jobId/interventions - Create interventions from n8n
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
    const body = await request.json();

    // Validate job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return errorResponse('NOT_FOUND', 'Job not found', 404);
    }

    // Validate request body
    const { interventions } = body;
    if (!Array.isArray(interventions)) {
      return errorResponse('BAD_REQUEST', 'interventions must be an array', 400);
    }

    // Create interventions
    const created = await prisma.$transaction(
      interventions.map((intervention: {
        findingRef: string;
        type: 'text_input' | 'yes_no_other';
        prompt: string;
        placeholder?: string;
        yesLabel?: string;
        noLabel?: string;
        otherLabel?: string;
      }) =>
        prisma.intervention.upsert({
          where: {
            jobId_findingRef: {
              jobId,
              findingRef: intervention.findingRef,
            },
          },
          create: {
            jobId,
            findingRef: intervention.findingRef,
            type: intervention.type,
            prompt: intervention.prompt,
            placeholder: intervention.placeholder,
            yesLabel: intervention.yesLabel,
            noLabel: intervention.noLabel,
            otherLabel: intervention.otherLabel,
          },
          update: {
            type: intervention.type,
            prompt: intervention.prompt,
            placeholder: intervention.placeholder,
            yesLabel: intervention.yesLabel,
            noLabel: intervention.noLabel,
            otherLabel: intervention.otherLabel,
            // Don't reset status if already responded
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      created: created.length,
      interventions: created.map((i) => ({
        id: i.id,
        findingRef: i.findingRef,
        type: i.type,
        status: i.status,
      })),
    });
  } catch (error) {
    console.error('POST /api/internal/jobs/:jobId/interventions error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// GET /api/internal/jobs/:jobId/interventions - Get all interventions for a job
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Validate internal request
    if (!validateInternalRequest(request)) {
      return errorResponse('UNAUTHORIZED', 'Invalid internal secret', 401);
    }

    const { jobId } = await params;

    const interventions = await prisma.intervention.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ interventions });
  } catch (error) {
    console.error('GET /api/internal/jobs/:jobId/interventions error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
