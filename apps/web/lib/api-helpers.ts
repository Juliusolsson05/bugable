import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@bugable/db';

// Standard error response
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status }
  );
}

// Get authenticated user or return 401
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: errorResponse('UNAUTHORIZED', 'Unauthorized', 401) };
  }

  return { user, error: null };
}

// Verify site ownership
export async function verifySiteOwnership(siteId: string, userId: string) {
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId },
  });

  if (!site) {
    return { site: null, error: errorResponse('NOT_FOUND', 'Site not found', 404) };
  }

  return { site, error: null };
}

// Verify job ownership (through site)
export async function verifyJobOwnership(jobId: string, userId: string) {
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

  if (!job || job.page.site.userId !== userId) {
    return { job: null, error: errorResponse('NOT_FOUND', 'Job not found', 404) };
  }

  return { job, error: null };
}

// Verify page ownership (through site)
export async function verifyPageOwnership(pageId: string, userId: string) {
  const page = await prisma.page.findFirst({
    where: { id: pageId },
    include: {
      site: true,
    },
  });

  if (!page || page.site.userId !== userId) {
    return { page: null, error: errorResponse('NOT_FOUND', 'Page not found', 404) };
  }

  return { page, error: null };
}

// Normalize URL domain
export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
}

// Normalize page path
export function normalizePath(path: string): string {
  let normalized = path.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  // Remove trailing slash except for root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

// Build full URL from site and page
export function buildFullUrl(baseUrl: string, path: string): string {
  return `https://${baseUrl}${path}`;
}

// Validate internal service request
export function validateInternalRequest(request: Request): boolean {
  const secret = request.headers.get('X-Bugable-Internal-Secret');
  const expectedSecret = process.env.BUGABLE_INTERNAL_SECRET;

  if (!expectedSecret) {
    console.warn('BUGABLE_INTERNAL_SECRET not configured');
    return false;
  }

  return secret === expectedSecret;
}

export type NormalizedSeverity = 'critical' | 'high' | 'medium' | 'low';

export function normalizeSeverity(input: unknown): NormalizedSeverity | null {
  if (typeof input !== 'string') return null;
  const severity = input.toLowerCase().trim();

  if (severity === 'critical' || severity === 'high' || severity === 'medium' || severity === 'low') {
    return severity;
  }

  if (severity === 'warning' || severity === 'warn' || severity === 'major') return 'high';
  if (severity === 'info' || severity === 'minor') return 'low';
  if (severity === 'blocker') return 'critical';

  return null;
}

// Count findings by severity for a job
export function countFindingsBySeverity(findings: { severity: unknown }[]) {
  return findings.reduce(
    (acc, f) => {
      const normalized = normalizeSeverity(f.severity);
      if (!normalized) return acc;
      acc[normalized] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

// Invoke worker to process a job (fire-and-forget)
export async function invokeWorker(jobId: string): Promise<void> {
  const workerUrl = process.env.WORKER_URL;
  const internalSecret = process.env.BUGABLE_INTERNAL_SECRET;

  if (!workerUrl || !internalSecret) {
    console.error('Worker configuration missing: WORKER_URL or BUGABLE_INTERNAL_SECRET');
    throw new Error('Worker not configured');
  }

  // Fire-and-forget: just trigger the worker, don't wait for response
  // The worker will update the job status as it runs
  fetch(`${workerUrl}/api/jobs/${jobId}/run`, {
    method: 'POST',
    headers: {
      'X-Bugable-Internal-Secret': internalSecret,
      'Content-Type': 'application/json',
    },
  }).catch((error) => {
    // Log error but don't fail - let the job remain in 'pending' state
    // so user can see it wasn't picked up by worker
    console.error(`Failed to invoke worker for job ${jobId}:`, error);
  });
}
