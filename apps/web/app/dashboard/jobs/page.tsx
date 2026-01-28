'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StatusBadge, FindingCounts } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import {
  mockSite,
  formatRelativeTime,
  type Job,
  type Page,
} from '@/lib/mock-data';

function getAllJobs(): { job: Job; page: Page }[] {
  const jobs: { job: Job; page: Page }[] = [];
  for (const page of mockSite.pages) {
    for (const job of page.jobs) {
      jobs.push({ job, page });
    }
  }
  return jobs.sort((a, b) => b.job.createdAt.getTime() - a.job.createdAt.getTime());
}

function JobRow({ job, page }: { job: Job; page: Page }) {
  const findingCounts = job.findings.reduce(
    (acc, f) => {
      acc[f.severity]++;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 }
  );

  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="flex items-center gap-4 px-6 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors group"
    >
      <StatusBadge status={job.status} size="sm" />

      <code className="text-sm font-medium bg-muted px-2 py-0.5 rounded min-w-[100px]">
        {page.path}
      </code>

      <div className="flex-1 min-w-0 text-sm">
        {job.status === 'running' && (
          <span className="text-muted-foreground">
            {job.currentStep} <span className="text-primary font-medium">{job.progress}%</span>
          </span>
        )}
        {job.status === 'completed' && <FindingCounts {...findingCounts} />}
        {job.status === 'failed' && (
          <span className="text-destructive">Analysis failed</span>
        )}
        {job.status === 'pending' && (
          <span className="text-muted-foreground">Waiting in queue...</span>
        )}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums">
        {formatRelativeTime(job.createdAt)}
      </span>

      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export default function AllJobsPage() {
  const allJobs = getAllJobs();
  const runningCount = allJobs.filter(({ job }) => job.status === 'running').length;
  const completedCount = allJobs.filter(({ job }) => job.status === 'completed').length;
  const failedCount = allJobs.filter(({ job }) => job.status === 'failed').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">All Jobs</h1>
            <p className="text-xs text-muted-foreground">
              {allJobs.length} total &middot; {runningCount} running &middot; {completedCount} completed &middot; {failedCount} failed
            </p>
          </div>
        </div>
      </header>

      {/* Jobs list */}
      <div className="bg-card">
        {allJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No jobs yet</p>
          </div>
        ) : (
          allJobs.map(({ job, page }) => (
            <JobRow key={job.id} job={job} page={page} />
          ))
        )}
      </div>
    </div>
  );
}
