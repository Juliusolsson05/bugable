import { NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { getAuthenticatedUser, errorResponse } from '@/lib/api-helpers';

// GET /api/findings - Get all findings from latest completed job per page
// Optional query params: siteId (filter by specific site)
export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    // Get all pages for user's sites with their latest completed job
    const sites = await prisma.site.findMany({
      where: {
        userId: user!.id,
        ...(siteId ? { id: siteId } : {}),
      },
      include: {
        pages: {
          include: {
            jobs: {
              where: { status: 'completed' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                events: {
                  where: { type: 'bugs_detected' },
                },
                resolvedFindings: true,
              },
            },
          },
        },
      },
    });

    // Create a map of resolved findings for quick lookup
    const resolvedMap = new Map<string, { resolvedAt: Date; resolvedBy: string | null }>();

    // Flatten findings from all sites/pages/jobs
    const findings: any[] = [];

    for (const site of sites) {
      for (const page of site.pages) {
        const latestJob = page.jobs[0];
        if (!latestJob) continue;

        // Build resolved findings map for this job
        for (const rf of latestJob.resolvedFindings) {
          resolvedMap.set(`${latestJob.id}-${rf.findingRef}`, {
            resolvedAt: rf.resolvedAt,
            resolvedBy: rf.resolvedBy,
          });
        }

        // Extract findings from bugs_detected events
        for (const event of latestJob.events) {
          const bugs = (event.findings as any[]) || [];
          bugs.forEach((bug, index) => {
            const findingRef = `finding-${event.turn}-${index}`;
            const globalId = `${latestJob.id}-${findingRef}`;
            const resolved = resolvedMap.get(globalId);

            findings.push({
              id: globalId,
              findingRef,
              jobId: latestJob.id,
              pageId: page.id,
              siteId: site.id,
              pagePath: page.path,
              pageTitle: page.title,
              siteBaseUrl: site.baseUrl,
              siteName: site.name,
              severity: bug.severity,
              category: bug.category,
              description: bug.description,
              location: bug.location,
              turn: event.turn,
              detectedAt: event.timestamp.toISOString(),
              resolved: !!resolved,
              resolvedAt: resolved?.resolvedAt?.toISOString() || null,
              resolvedBy: resolved?.resolvedBy || null,
            });
          });
        }
      }
    }

    // Sort by severity (critical first) then by detectedAt
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort((a, b) => {
      const severityDiff =
        (severityOrder[a.severity as keyof typeof severityOrder] ?? 4) -
        (severityOrder[b.severity as keyof typeof severityOrder] ?? 4);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    return NextResponse.json({ findings });
  } catch (error) {
    console.error('GET /api/findings error:', error);
    return errorResponse('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
