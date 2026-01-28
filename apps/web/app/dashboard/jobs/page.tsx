'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { StatusBadge, FindingCounts } from '@/components/status-badge';
import { useSite } from '@/components/site-provider';
import { getJobs, formatRelativeTime, type JobStatus, type FindingCounts as FindingCountsType } from '@/lib/api';

interface JobWithPage {
  id: string;
  status: JobStatus;
  progress: number;
  currentStep: string | null;
  createdAt: string;
  completedAt: string | null;
  page: {
    id: string;
    path: string;
    fullUrl: string;
  };
  counts: FindingCountsType;
}

function JobRow({ job }: { job: JobWithPage }) {
  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="flex items-center gap-4 px-6 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors group"
    >
      <StatusBadge status={job.status} size="sm" />

      <code className="text-sm font-medium bg-muted px-2 py-0.5 rounded min-w-[100px]">
        {job.page.path}
      </code>

      <div className="flex-1 min-w-0 text-sm">
        {job.status === 'running' && (
          <span className="text-muted-foreground">
            {job.currentStep} <span className="text-primary font-medium">{job.progress}%</span>
          </span>
        )}
        {job.status === 'completed' && <FindingCounts {...job.counts} />}
        {job.status === 'failed' && (
          <span className="text-destructive">Analysis failed</span>
        )}
        {job.status === 'cancelled' && (
          <span className="text-muted-foreground">Analysis cancelled</span>
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
  const { activeSite, isLoading: siteLoading } = useSite();
  const [jobs, setJobs] = useState<JobWithPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!activeSite) return;
    setIsLoading(true);
    try {
      const data = await getJobs({ siteId: activeSite.id, limit: 50 });
      setJobs(data.jobs as JobWithPage[]);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSite]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const runningCount = jobs.filter((j) => j.status === 'running').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;
  const cancelledCount = jobs.filter((j) => j.status === 'cancelled').length;

  if (siteLoading || !activeSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">All Jobs</h1>
            <p className="text-xs text-muted-foreground">
              {jobs.length} total &middot; {runningCount} running &middot; {completedCount} completed &middot; {failedCount} failed &middot; {cancelledCount} cancelled
            </p>
          </div>
        </div>
      </header>

      {/* Jobs list */}
      <div className="bg-card">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No jobs yet</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}
