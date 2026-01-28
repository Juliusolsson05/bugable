// API Types based on the API reference

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category =
  | 'error'              // Console errors, crashes, 404s
  | 'layout_broken'      // Overlapping content, broken layouts
  | 'image_broken'       // Broken image links
  | 'form_validation'    // Form/input issues
  | 'accessibility'      // Contrast, click targets, screen readers
  | 'visual_overflow'    // Content extending beyond containers
  | 'responsive_break'   // Mobile/tablet layout issues
  | 'typography'         // Text truncation, readability
  | 'interactive_fail'   // Buttons, links not working
  | 'contrast';          // Low contrast issues

export interface Site {
  id: string;
  userId: string;
  name: string;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  siteId: string;
  path: string;
  title: string | null;
  fullUrl: string;
  createdAt: string;
  updatedAt: string;
  latestJob?: {
    id: string;
    status: JobStatus;
    progress: number;
    currentStep: string | null;
    createdAt: string;
    completedAt: string | null;
    counts?: FindingCounts;
  };
}

export interface Job {
  id: string;
  pageId: string;
  status: JobStatus;
  progress: number;
  currentStep: string | null;
  screenshotUrl: string | null;
  completionReason: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  jobId: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  location: string | null;
  recommendation: string | null;
  screenshotUrl: string | null;
  createdAt: string;
}

export interface ReasoningLog {
  id: string;
  jobId: string;
  timestamp: string;
  step: string;
  message: string;
  location: string | null;
  screenshotUrl: string | null;
}

export interface FindingCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

// API Response types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// API Functions

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.error || 'Request failed');
  }

  return data;
}

// Sites API
export async function getSites(): Promise<{ sites: Site[] }> {
  return fetchApi('/api/sites');
}

export async function createSite(domain: string): Promise<{ site: Site }> {
  return fetchApi('/api/sites', {
    method: 'POST',
    body: JSON.stringify({ domain }),
  });
}

export async function getSite(siteId: string): Promise<{ site: Site }> {
  return fetchApi(`/api/sites/${siteId}`);
}

export async function updateSite(
  siteId: string,
  data: { name?: string; baseUrl?: string }
): Promise<{ site: Site }> {
  return fetchApi(`/api/sites/${siteId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSite(siteId: string): Promise<void> {
  await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
}

// Pages API
export async function getPages(
  siteId: string,
  options?: {
    search?: string;
    includeLatestJob?: boolean;
    includeStats?: boolean;
    limit?: number;
    cursor?: string;
  }
): Promise<{ pages: Page[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.includeLatestJob === false) params.set('includeLatestJob', 'false');
  if (options?.includeStats === false) params.set('includeStats', 'false');
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.cursor) params.set('cursor', options.cursor);

  const query = params.toString();
  return fetchApi(`/api/sites/${siteId}/pages${query ? `?${query}` : ''}`);
}

export async function createPage(
  siteId: string,
  data: { path: string; title?: string }
): Promise<{ page: Page }> {
  return fetchApi(`/api/sites/${siteId}/pages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPage(pageId: string): Promise<{ page: Page }> {
  return fetchApi(`/api/pages/${pageId}`);
}

export async function deletePage(pageId: string): Promise<void> {
  await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
}

// Jobs API
export async function createJob(
  siteId: string,
  path: string,
  options?: Record<string, unknown>
): Promise<{ job: Job; page: { id: string; path: string; fullUrl: string } }> {
  return fetchApi('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ siteId, path, options }),
  });
}

export async function getJobs(options?: {
  siteId?: string;
  pageId?: string;
  status?: JobStatus;
  limit?: number;
  cursor?: string;
  sort?: string;
}): Promise<{
  jobs: Array<Job & { page: { id: string; path: string; fullUrl: string }; counts: FindingCounts }>;
  nextCursor: string | null;
}> {
  const params = new URLSearchParams();
  if (options?.siteId) params.set('siteId', options.siteId);
  if (options?.pageId) params.set('pageId', options.pageId);
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.cursor) params.set('cursor', options.cursor);
  if (options?.sort) params.set('sort', options.sort);

  const query = params.toString();
  return fetchApi(`/api/jobs${query ? `?${query}` : ''}`);
}

export async function getJob(
  jobId: string,
  options?: {
    includeFindings?: boolean;
    includeLogs?: boolean;
    findingsLimit?: number;
    logsLimit?: number;
  }
): Promise<{
  job: Job;
  page: Page;
  site: { id: string; name: string; baseUrl: string };
  findings?: Finding[];
  logs?: ReasoningLog[];
}> {
  const params = new URLSearchParams();
  if (options?.includeFindings === false) params.set('includeFindings', 'false');
  if (options?.includeLogs === false) params.set('includeLogs', 'false');
  if (options?.findingsLimit) params.set('findingsLimit', options.findingsLimit.toString());
  if (options?.logsLimit) params.set('logsLimit', options.logsLimit.toString());

  const query = params.toString();
  return fetchApi(`/api/jobs/${jobId}${query ? `?${query}` : ''}`);
}

export async function rerunJob(
  jobId: string
): Promise<{ job: Job; page: { id: string; path: string; fullUrl: string } }> {
  return fetchApi(`/api/jobs/${jobId}/rerun`, { method: 'POST' });
}

export async function cancelJob(jobId: string): Promise<{ job: Partial<Job> }> {
  return fetchApi(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
}

// User API
export async function getCurrentUser(): Promise<{ user: User }> {
  return fetchApi('/api/me');
}

export async function updateCurrentUser(data: { fullName?: string }): Promise<{ user: User }> {
  return fetchApi('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCurrentUser(): Promise<void> {
  await fetch('/api/me', { method: 'DELETE' });
}

// Helper to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
