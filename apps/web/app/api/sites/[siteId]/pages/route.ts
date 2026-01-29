import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import {
  getAuthenticatedUser,
  verifySiteOwnership,
  errorResponse,
  buildFullUrl,
  normalizePath,
} from '@/lib/api-helpers';

// GET /api/sites/:siteId/pages - List pages with optional latestJob and stats
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const includeLatestJob = searchParams.get('includeLatestJob') !== 'false';
    const includeStats = searchParams.get('includeStats') !== 'false';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    const cursor = searchParams.get('cursor');

    // Build where clause
    const where: { siteId: string; path?: { contains: string } } = { siteId };
    if (search) {
      where.path = { contains: search };
    }

    // Fetch pages with jobs if needed
    const pages = await prisma.page.findMany({
      where,
      include:
        includeLatestJob || includeStats
          ? {
              jobs: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                  id: true,
                  status: true,
                  progress: true,
                  currentStep: true,
                  createdAt: true,
                  completedAt: true,
                  findingsCritical: true,
                  findingsHigh: true,
                  findingsMedium: true,
                  findingsLow: true,
                },
              },
            }
          : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Check if there's a next page
    let nextCursor: string | null = null;
    if (pages.length > limit) {
      const nextItem = pages.pop();
      nextCursor = nextItem!.id;
    }

    // Transform response - type assertion needed due to conditional include
    type PageWithJobs = (typeof pages)[number] & {
      jobs?: Array<{
        id: string;
        status: string;
        progress: number;
        currentStep: string | null;
        createdAt: Date;
        completedAt: Date | null;
        findingsCritical: number | null;
        findingsHigh: number | null;
        findingsMedium: number | null;
        findingsLow: number | null;
      }>;
    };

    const transformedPages = (pages as PageWithJobs[]).map((page) => {
      const latestJob = page.jobs?.[0];

      return {
        id: page.id,
        siteId: page.siteId,
        path: page.path,
        title: page.title,
        fullUrl: buildFullUrl(site!.baseUrl, page.path),
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
        ...(includeLatestJob && latestJob
          ? {
              latestJob: {
                id: latestJob.id,
                status: latestJob.status,
                progress: latestJob.progress,
                currentStep: latestJob.currentStep,
                createdAt: latestJob.createdAt.toISOString(),
                completedAt: latestJob.completedAt?.toISOString() || null,
                ...(includeStats
                  ? {
                      counts: {
                        critical: latestJob.findingsCritical ?? 0,
                        high: latestJob.findingsHigh ?? 0,
                        medium: latestJob.findingsMedium ?? 0,
                        low: latestJob.findingsLow ?? 0,
                      },
                    }
                  : {}),
              },
            }
          : {}),
      };
    });

    return NextResponse.json({
      pages: transformedPages,
      nextCursor,
    });
  } catch (error) {
    console.error('GET /api/sites/:siteId/pages error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}

// POST /api/sites/:siteId/pages - Create or upsert a page
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { site, error: siteError } = await verifySiteOwnership(siteId, user!.id);
    if (siteError) return siteError;

    const body = await request.json();
    const { path, title } = body;

    if (!path || typeof path !== 'string') {
      return errorResponse('INVALID_INPUT', 'Path is required', 400);
    }

    const normalizedPath = normalizePath(path);

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
        title: title || null,
      },
      update: {
        title: title !== undefined ? title : undefined,
      },
    });

    return NextResponse.json(
      {
        page: {
          ...page,
          fullUrl: buildFullUrl(site!.baseUrl, page.path),
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/sites/:siteId/pages error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
