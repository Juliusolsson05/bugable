export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type Severity = 'critical' | 'warning' | 'info';
export type Category = 'security' | 'ux' | 'ui' | 'performance' | 'accessibility';

export interface Finding {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  screenshotUrl?: string;
  createdAt: Date;
}

export interface ReasoningLog {
  id: string;
  timestamp: Date;
  message: string;
  step: string;
  screenshotUrl?: string;
}

export interface Job {
  id: string;
  pageId: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  createdAt: Date;
  completedAt?: Date;
  findings: Finding[];
  reasoningLogs: ReasoningLog[];
}

export interface Page {
  id: string;
  path: string;
  fullUrl: string;
  createdAt: Date;
  jobs: Job[];
}

export interface Site {
  id: string;
  domain: string;
  createdAt: Date;
  pages: Page[];
}

// Mock Data
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const mockSite: Site = {
  id: 'site_1',
  domain: 'acme-startup.com',
  createdAt: daysAgo(14),
  pages: [
    {
      id: 'page_1',
      path: '/',
      fullUrl: 'https://acme-startup.com/',
      createdAt: daysAgo(14),
      jobs: [
        {
          id: 'job_1',
          pageId: 'page_1',
          status: 'running',
          progress: 65,
          currentStep: 'UI Testing',
          createdAt: minutesAgo(3),
          findings: [
            {
              id: 'finding_1',
              severity: 'warning',
              category: 'ux',
              title: 'Missing loading state on CTA button',
              description: 'The primary call-to-action button does not show a loading indicator when clicked, leaving users uncertain if their action was registered.',
              location: 'section.hero button.cta-primary',
              recommendation: 'Add a spinner or disable state with visual feedback when the button is clicked.',
              createdAt: minutesAgo(2),
            },
          ],
          reasoningLogs: [
            {
              id: 'log_1',
              timestamp: minutesAgo(3),
              message: 'Starting analysis of https://acme-startup.com/',
              step: 'Initialize',
            },
            {
              id: 'log_2',
              timestamp: minutesAgo(3),
              message: 'Page loaded successfully. Viewport: 1920x1080',
              step: 'Page Load',
            },
            {
              id: 'log_3',
              timestamp: minutesAgo(2),
              message: 'Detected 12 interactive elements: 5 buttons, 4 links, 2 forms, 1 dropdown',
              step: 'Structure Analysis',
            },
            {
              id: 'log_4',
              timestamp: minutesAgo(2),
              message: 'Testing button click handlers...',
              step: 'UI Testing',
            },
            {
              id: 'log_5',
              timestamp: minutesAgo(1),
              message: 'Warning: CTA button lacks loading state feedback',
              step: 'UI Testing',
            },
            {
              id: 'log_6',
              timestamp: minutesAgo(0),
              message: 'Checking form validation patterns...',
              step: 'UI Testing',
            },
          ],
        },
        {
          id: 'job_2',
          pageId: 'page_1',
          status: 'completed',
          progress: 100,
          currentStep: 'Complete',
          createdAt: hoursAgo(6),
          completedAt: hoursAgo(6),
          findings: [
            {
              id: 'finding_2',
              severity: 'critical',
              category: 'security',
              title: 'Form submits data over HTTP',
              description: 'The newsletter signup form submits data to an HTTP endpoint instead of HTTPS, potentially exposing user email addresses.',
              location: 'form#newsletter action attribute',
              recommendation: 'Change the form action URL to use HTTPS protocol.',
              createdAt: hoursAgo(6),
            },
            {
              id: 'finding_3',
              severity: 'warning',
              category: 'accessibility',
              title: 'Images missing alt text',
              description: '3 images on the page are missing alt attributes, making them inaccessible to screen readers.',
              location: 'img.feature-icon (3 instances)',
              recommendation: 'Add descriptive alt text to all images.',
              createdAt: hoursAgo(6),
            },
            {
              id: 'finding_4',
              severity: 'info',
              category: 'performance',
              title: 'Large hero image not optimized',
              description: 'The hero image is 2.4MB and could be compressed without visible quality loss.',
              location: 'img.hero-background',
              recommendation: 'Compress image and consider using WebP format.',
              createdAt: hoursAgo(6),
            },
          ],
          reasoningLogs: [],
        },
        {
          id: 'job_3',
          pageId: 'page_1',
          status: 'completed',
          progress: 100,
          currentStep: 'Complete',
          createdAt: daysAgo(3),
          completedAt: daysAgo(3),
          findings: [],
          reasoningLogs: [],
        },
      ],
    },
    {
      id: 'page_2',
      path: '/pricing',
      fullUrl: 'https://acme-startup.com/pricing',
      createdAt: daysAgo(10),
      jobs: [
        {
          id: 'job_4',
          pageId: 'page_2',
          status: 'completed',
          progress: 100,
          currentStep: 'Complete',
          createdAt: daysAgo(1),
          completedAt: daysAgo(1),
          findings: [
            {
              id: 'finding_5',
              severity: 'warning',
              category: 'ux',
              title: 'Pricing toggle confusing',
              description: 'The monthly/yearly toggle does not clearly indicate which option is currently selected.',
              location: 'div.pricing-toggle',
              recommendation: 'Add clearer visual distinction for the active state.',
              createdAt: daysAgo(1),
            },
          ],
          reasoningLogs: [],
        },
        {
          id: 'job_5',
          pageId: 'page_2',
          status: 'completed',
          progress: 100,
          currentStep: 'Complete',
          createdAt: daysAgo(5),
          completedAt: daysAgo(5),
          findings: [],
          reasoningLogs: [],
        },
      ],
    },
    {
      id: 'page_3',
      path: '/about',
      fullUrl: 'https://acme-startup.com/about',
      createdAt: daysAgo(7),
      jobs: [
        {
          id: 'job_6',
          pageId: 'page_3',
          status: 'failed',
          progress: 23,
          currentStep: 'Page Load',
          createdAt: hoursAgo(2),
          findings: [],
          reasoningLogs: [
            {
              id: 'log_7',
              timestamp: hoursAgo(2),
              message: 'Starting analysis of https://acme-startup.com/about',
              step: 'Initialize',
            },
            {
              id: 'log_8',
              timestamp: hoursAgo(2),
              message: 'Error: Page returned 503 Service Unavailable',
              step: 'Page Load',
            },
          ],
        },
      ],
    },
    {
      id: 'page_4',
      path: '/contact',
      fullUrl: 'https://acme-startup.com/contact',
      createdAt: daysAgo(7),
      jobs: [],
    },
    {
      id: 'page_5',
      path: '/blog',
      fullUrl: 'https://acme-startup.com/blog',
      createdAt: daysAgo(2),
      jobs: [
        {
          id: 'job_7',
          pageId: 'page_5',
          status: 'pending',
          progress: 0,
          currentStep: 'Queued',
          createdAt: minutesAgo(1),
          findings: [],
          reasoningLogs: [],
        },
      ],
    },
  ],
};

// Helper functions
export function getJobById(jobId: string): Job | undefined {
  for (const page of mockSite.pages) {
    const job = page.jobs.find((j) => j.id === jobId);
    if (job) return job;
  }
  return undefined;
}

export function getPageByJobId(jobId: string): Page | undefined {
  for (const page of mockSite.pages) {
    if (page.jobs.some((j) => j.id === jobId)) {
      return page;
    }
  }
  return undefined;
}

export function getPageById(pageId: string): Page | undefined {
  return mockSite.pages.find((p) => p.id === pageId);
}

export function getTotalFindings(): { critical: number; warning: number; info: number } {
  let critical = 0;
  let warning = 0;
  let info = 0;

  for (const page of mockSite.pages) {
    for (const job of page.jobs) {
      for (const finding of job.findings) {
        if (finding.severity === 'critical') critical++;
        else if (finding.severity === 'warning') warning++;
        else info++;
      }
    }
  }

  return { critical, warning, info };
}

export function getLatestJobForPage(page: Page): Job | undefined {
  if (page.jobs.length === 0) return undefined;
  return page.jobs.reduce((latest, job) =>
    job.createdAt > latest.createdAt ? job : latest
  );
}

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
