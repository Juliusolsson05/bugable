'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, ExternalLink, RefreshCw, Filter, Eye, EyeOff, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, FindingCounts } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import { useSite } from '@/components/site-provider';
import {
  createJob,
  getJobs,
  formatRelativeTime,
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

interface JobWithPage {
  id: string;
  status: JobStatus;
  progress: number;
  currentStep: string | null;
  createdAt: string;
  completedAt: string | null;
  counts: FindingCountsType;
  page: {
    id: string;
    path: string;
    fullUrl: string;
  };
}

// Helper to categorize jobs by time
function categorizeByTime(dateStr: string): 'today' | 'yesterday' | 'this_week' | 'older' {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'today';
  if (date >= startOfYesterday) return 'yesterday';
  if (date >= startOfWeek) return 'this_week';
  return 'older';
}

// Check if a failed job is old (more than 1 hour)
function isOldFailedJob(job: JobWithPage): boolean {
  if (job.status !== 'failed') return false;
  const hourAgo = Date.now() - 60 * 60 * 1000;
  return new Date(job.createdAt).getTime() < hourAgo;
}

function JobRow({ job }: { job: JobWithPage }) {
  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors group rounded-lg border bg-card"
    >
      <StatusBadge status={job.status} size="sm" />

      <code className="text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded shrink-0">
        {job.page.path}
      </code>

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
          <span className="text-muted-foreground">Cancelled</span>
        )}
        {job.status === 'pending' && (
          <span className="text-muted-foreground">Queued...</span>
        )}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatRelativeTime(job.createdAt)}
      </span>

      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function TimeSection({ title, jobs, showFailed }: { title: string; jobs: JobWithPage[]; showFailed: boolean }) {
  const filteredJobs = useMemo(() => {
    if (showFailed) return jobs;
    return jobs.filter(job => !isOldFailedJob(job));
  }, [jobs, showFailed]);

  const hiddenCount = jobs.length - filteredJobs.length;

  if (filteredJobs.length === 0 && hiddenCount === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        {hiddenCount > 0 && (
          <span className="text-xs text-muted-foreground/60">
            ({hiddenCount} failed hidden)
          </span>
        )}
      </div>
      <div className="space-y-2">
        {filteredJobs.map(job => (
          <JobRow key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function StatsCard({ label, value, valueColor, icon: Icon }: { label: string; value: number | string; valueColor?: string; icon?: React.ElementType }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums", valueColor)}>{value}</div>
    </div>
  );
}

type StatusFilter = 'all' | 'running' | 'completed' | 'failed';

export default function DashboardPage() {
  const { activeSite, isLoading: siteLoading } = useSite();
  const [jobs, setJobs] = useState<JobWithPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFailed, setShowFailed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchJobs = useCallback(async () => {
    if (!activeSite) return;
    setIsLoading(true);
    try {
      const data = await getJobs({ siteId: activeSite.id, limit: 100, sort: 'createdAt:desc' });
      setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSite]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Apply filters and group by time
  const { todayJobs, yesterdayJobs, weekJobs, olderJobs, stats } = useMemo(() => {
    // Filter by status
    let filtered = jobs;
    if (statusFilter !== 'all') {
      filtered = jobs.filter(j => j.status === statusFilter);
    }

    // Group by time
    const today: JobWithPage[] = [];
    const yesterday: JobWithPage[] = [];
    const week: JobWithPage[] = [];
    const older: JobWithPage[] = [];

    filtered.forEach(job => {
      const category = categorizeByTime(job.createdAt);
      switch (category) {
        case 'today': today.push(job); break;
        case 'yesterday': yesterday.push(job); break;
        case 'this_week': week.push(job); break;
        case 'older': older.push(job); break;
      }
    });

    // Compute stats from all jobs (not filtered)
    const runningJobs = jobs.filter(j => j.status === 'running').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;

    let totalCritical = 0, totalHigh = 0, totalMedium = 0, totalLow = 0;
    jobs.forEach(job => {
      if (job.status === 'completed' && job.counts) {
        totalCritical += job.counts.critical || 0;
        totalHigh += job.counts.high || 0;
        totalMedium += job.counts.medium || 0;
        totalLow += job.counts.low || 0;
      }
    });

    return {
      todayJobs: today,
      yesterdayJobs: yesterday,
      weekJobs: week,
      olderJobs: older,
      stats: {
        total: jobs.length,
        running: runningJobs,
        completed: completedJobs,
        failed: failedJobs,
        issues: { critical: totalCritical, high: totalHigh, medium: totalMedium, low: totalLow }
      }
    };
  }, [jobs, statusFilter]);

  if (siteLoading || !activeSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const domain = activeSite.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const totalIssues = stats.issues.critical + stats.issues.high + stats.issues.medium + stats.issues.low;
  const hiddenFailedCount = jobs.filter(isOldFailedJob).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">Jobs</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{domain}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
          <NewAnalysisInput siteId={activeSite.id} domain={domain} onJobCreated={fetchJobs} />
        </div>
      </header>

      {/* Stats */}
      <div className="border-b bg-card">
        <div className="flex divide-x">
          <StatsCard label="Total Jobs" value={stats.total} />
          <StatsCard label="Running" value={stats.running} valueColor={stats.running > 0 ? "text-primary" : undefined} />
          <StatsCard label="Completed" value={stats.completed} valueColor="text-success" />
          <StatsCard
            label="Open Issues"
            value={totalIssues}
            valueColor={stats.issues.critical > 0 ? "text-destructive" : stats.issues.high > 0 ? "text-warning" : totalIssues > 0 ? "text-info" : undefined}
          />
          {stats.failed > 0 && (
            <StatsCard label="Failed" value={stats.failed} valueColor="text-destructive" icon={AlertTriangle} />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-muted/30 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
            {(['all', 'running', 'completed', 'failed'] as StatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Show failed toggle */}
          {hiddenFailedCount > 0 && (
            <button
              onClick={() => setShowFailed(!showFailed)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                showFailed
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {showFailed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {showFailed ? 'Showing' : 'Show'} {hiddenFailedCount} old failed
            </button>
          )}

          <Button variant="ghost" size="sm" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Jobs list grouped by time */}
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="py-12 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No jobs yet</p>
            <p className="text-sm text-muted-foreground">Enter a path above to start your first analysis</p>
          </div>
        ) : (
          <>
            <TimeSection title="Today" jobs={todayJobs} showFailed={showFailed} />
            <TimeSection title="Yesterday" jobs={yesterdayJobs} showFailed={showFailed} />
            <TimeSection title="This Week" jobs={weekJobs} showFailed={showFailed} />
            <TimeSection title="Older" jobs={olderJobs} showFailed={showFailed} />

            {todayJobs.length === 0 && yesterdayJobs.length === 0 && weekJobs.length === 0 && olderJobs.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No jobs match the current filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
