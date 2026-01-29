import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { getAuthenticatedUser, errorResponse } from '@/lib/api-helpers';

// PATCH /api/findings/:findingId/resolve - Toggle resolved status
// findingId format: {jobId}-finding-{turn}-{index}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ findingId: string }> }
) {
  try {
    const { findingId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    // Parse the findingId: {jobId}-finding-{turn}-{index}
    const match = findingId.match(/^([a-f0-9-]+)-(finding-\d+-\d+)$/);
    if (!match) {
      return errorResponse('INVALID_PARAMS', 'Invalid finding ID format', 400);
    }

    const [, jobId, findingRef] = match;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId },
      include: {
        page: {
          include: {
            site: true,
          },
        },
      },
    });

    if (!job || job.page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Finding not found', 404);
    }

    // Parse body to get resolved state
    const body = await request.json().catch(() => ({}));
    const shouldResolve = body.resolved !== false; // Default to true

    if (shouldResolve) {
      // Mark as resolved - upsert to handle duplicate calls
      await prisma.resolvedFinding.upsert({
        where: {
          jobId_findingRef: {
            jobId,
            findingRef,
          },
        },
        create: {
          jobId,
          findingRef,
          resolvedBy: user!.id,
        },
        update: {
          resolvedAt: new Date(),
          resolvedBy: user!.id,
        },
      });

      return NextResponse.json({
        id: findingId,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: user!.id,
      });
    } else {
      // Mark as unresolved - delete the record
      await prisma.resolvedFinding.deleteMany({
        where: {
          jobId,
          findingRef,
        },
      });

      return NextResponse.json({
        id: findingId,
        resolved: false,
        resolvedAt: null,
        resolvedBy: null,
      });
    }
  } catch (error) {
    console.error('PATCH /api/findings/:findingId/resolve error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
