'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, FindingCounts } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import { useSite } from '@/components/site-provider';
import {
  getPages,
  createJob,
  formatRelativeTime,
  type Page,
  type JobStatus,
  type FindingCounts as FindingCountsType,
} from '@/lib/api';

function NewAnalysisInput({ siteId, domain, onJobCreated }: { siteId: string; domain: string; onJobCreated: () => void }) {
  const [path, setPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!path.trim()) return;
    setIsSubmitting(true);
    try {
      const normalizedPath = `/${path.trim().replace(/^\/+/, '')}`;
      await createJob(siteId, normalizedPath);
      setPath('');
      onJobCreated();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm text-muted-foreground select-none">
          {domain}/
        </span>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="page-path"
          className="w-72 pl-[152px] pr-3 h-9 text-sm bg-background border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
      </div>
      <Button size="default" onClick={handleSubmit} disabled={isSubmitting || !path.trim()}>
        <Plus className="h-4 w-4" />
        {isSubmitting ? 'Starting...' : 'Analyze'}
      </Button>
    </div>
  );
}

interface PageJob {
  id: string;
  status: JobStatus;
  progress: number;
  currentStep: string | null;
  createdAt: string;
  completedAt: string | null;
  counts?: FindingCountsType;
}

function JobRow({ job, isLast }: { job: PageJob; isLast: boolean }) {
  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className={cn(
        "flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors group",
        !isLast && "border-b"
      )}
    >
      <StatusBadge status={job.status} size="sm" />

      <div className="flex-1 min-w-0 text-sm">
        {job.status === 'running' && (
          <span className="text-muted-foreground">
            {job.currentStep} <span className="text-primary font-medium">{job.progress}%</span>
          </span>
        )}
        {job.status === 'completed' && job.counts && (
          <FindingCounts critical={job.counts.critical} high={job.counts.high} medium={job.counts.medium} low={job.counts.low} />
        )}
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

interface PageWithJobs extends Page {
  latestJob?: PageJob;
}

function PageCard({ page, siteId, onRefresh }: { page: PageWithJobs; siteId: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(page.latestJob?.status === 'running');
  const [jobs, setJobs] = useState<PageJob[]>(page.latestJob ? [page.latestJob] : []);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadAllJobs = async () => {
    if (jobs.length > 1) return; // Already loaded
    setLoadingJobs(true);
    try {
      const { getJobs } = await import('@/lib/api');
      const data = await getJobs({ siteId, pageId: page.id, limit: 10 });
      setJobs(data.jobs.map(j => ({
        id: j.id,
        status: j.status,
        progress: j.progress,
        currentStep: j.currentStep,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
        counts: j.counts,
      })));
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded) {
      loadAllJobs();
    }
  };

  return (
    <div className="bg-card overflow-hidden">
      <div
        className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={handleExpand}
      >
        <ChevronRight className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          expanded && "rotate-90"
        )} />

        <code className="text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
          {page.path}
        </code>

        {page.latestJob && <StatusBadge status={page.latestJob.status} size="sm" />}

        <div className="flex-1" />

        {page.latestJob && page.latestJob.status === 'completed' && page.latestJob.counts && (
          <FindingCounts {...page.latestJob.counts} />
        )}
      </div>

      {expanded && (
        <div className="border-t bg-background">
          {loadingJobs ? (
            <div className="px-6 py-8 text-center">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">No analyses yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await createJob(siteId, page.path);
                  onRefresh();
                }}
              >
                <Plus className="h-3 w-3" />
                Run first analysis
              </Button>
            </div>
          ) : (
            jobs.map((job, i) => (
              <JobRow key={job.id} job={job} isLast={i === jobs.length - 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value, valueColor }: { label: string; value: number | string; valueColor?: string }) {
  return (
    <div className="px-5 py-4">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className={cn("text-2xl font-semibold tabular-nums", valueColor)}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeSite, isLoading: siteLoading } = useSite();
  const [pages, setPages] = useState<PageWithJobs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    if (!activeSite) return;
    setIsLoading(true);
    try {
      const data = await getPages(activeSite.id, { includeLatestJob: true, includeStats: true });
      setPages(data.pages as PageWithJobs[]);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSite]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Compute stats
  const totalPages = pages.length;
  const runningJobs = pages.filter(p => p.latestJob?.status === 'running').length;

  let totalCritical = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;

  pages.forEach((page) => {
    if (page.latestJob?.status === 'completed' && page.latestJob.counts) {
      totalCritical += page.latestJob.counts.critical;
      totalHigh += page.latestJob.counts.high;
      totalMedium += page.latestJob.counts.medium;
      totalLow += page.latestJob.counts.low;
    }
  });

  if (siteLoading || !activeSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Extract domain from baseUrl
  const domain = activeSite.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">Pages</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{domain}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
          <NewAnalysisInput siteId={activeSite.id} domain={domain} onJobCreated={fetchPages} />
        </div>
      </header>

      {/* Stats */}
      <div className="border-b bg-card">
        <div className="flex divide-x">
          <StatsCard label="Pages" value={totalPages} />
          <StatsCard label="Running" value={runningJobs} valueColor={runningJobs > 0 ? "text-primary" : undefined} />
          <StatsCard
            label="Open Issues"
            value={totalCritical + totalHigh + totalMedium + totalLow}
            valueColor={totalCritical > 0 ? "text-destructive" : totalHigh > 0 ? "text-warning" : totalMedium > 0 ? "text-info" : "text-success"}
          />
        </div>
      </div>

      {/* Pages list */}
      {isLoading ? (
        <div className="py-12 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : pages.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No pages analyzed yet</p>
          <p className="text-sm text-muted-foreground">Enter a path above to start your first analysis</p>
        </div>
      ) : (
        <div className="divide-y">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} siteId={activeSite.id} onRefresh={fetchPages} />
          ))}
        </div>
      )}
    </div>
  );
}
