import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifyPageOwnership,
  errorResponse,
  buildFullUrl,
} from '@/lib/api-helpers';

// GET /api/pages/:pageId - Get a single page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const page = await prisma.page.findFirst({
      where: { id: pageId },
      include: {
        site: true,
      },
    });

    if (!page || page.site.userId !== user!.id) {
      return errorResponse('NOT_FOUND', 'Page not found', 404);
    }

    return NextResponse.json({
      page: {
        id: page.id,
        siteId: page.siteId,
        path: page.path,
        title: page.title,
        fullUrl: buildFullUrl(page.site.baseUrl, page.path),
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/pages/:pageId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// DELETE /api/pages/:pageId - Delete a page (cascades to jobs, findings, logs)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { page, error: pageError } = await verifyPageOwnership(pageId, user!.id);
    if (pageError) return pageError;

    await prisma.page.delete({
      where: { id: pageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/pages/:pageId error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
