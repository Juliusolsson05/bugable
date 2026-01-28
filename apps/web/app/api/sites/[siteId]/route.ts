import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifySiteOwnership,
  errorResponse,
  normalizeDomain,
} from '@/lib/api-helpers';

// GET /api/sites/:siteId - Get a single site
export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { site, error: siteError } = await verifySiteOwnership(siteId, user!.id);
    if (siteError) return siteError;

    return NextResponse.json({ site });
  } catch (error) {
    console.error('GET /api/sites/:siteId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// PATCH /api/sites/:siteId - Update site metadata
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { site: existingSite, error: siteError } = await verifySiteOwnership(siteId, user!.id);
    if (siteError) return siteError;

    const body = await request.json();
    const { name, baseUrl } = body;

    const updateData: { name?: string; baseUrl?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return errorResponse('INVALID_INPUT', 'Name must be a non-empty string', 400);
      }
      updateData.name = name.trim();
    }

    if (baseUrl !== undefined) {
      if (typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
        return errorResponse('INVALID_INPUT', 'Base URL must be a non-empty string', 400);
      }
      updateData.baseUrl = normalizeDomain(baseUrl);
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('INVALID_INPUT', 'No valid fields to update', 400);
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data: updateData,
    });

    return NextResponse.json({ site });
  } catch (error) {
    console.error('PATCH /api/sites/:siteId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// DELETE /api/sites/:siteId - Delete a site (cascades to pages, jobs, findings, logs)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { site, error: siteError } = await verifySiteOwnership(siteId, user!.id);
    if (siteError) return siteError;

    await prisma.site.delete({
      where: { id: siteId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/sites/:siteId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
