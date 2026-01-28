'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, FindingCounts } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import {
  mockSite,
  getLatestJobForPage,
  formatRelativeTime,
  type Page,
  type Job,
} from '@/lib/mock-data';

function NewAnalysisInput() {
  const [path, setPath] = useState('');

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm text-muted-foreground select-none">
          {mockSite.domain}
        </span>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/page-path"
          className="w-72 pl-[145px] pr-3 h-9 text-sm bg-background border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
      </div>
      <Button size="default">
        <Plus className="h-4 w-4" />
        Analyze
      </Button>
    </div>
  );
}

function JobRow({ job, isLast }: { job: Job; isLast: boolean }) {
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
      className={cn(
        "flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors group",
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

function PageCard({ page }: { page: Page }) {
  const [expanded, setExpanded] = useState(
    page.jobs.some((j) => j.status === 'running') || page.jobs.length <= 2
  );
  const latestJob = getLatestJobForPage(page);

  const latestFindingCounts = latestJob
    ? latestJob.findings.reduce(
        (acc, f) => {
          acc[f.severity]++;
          return acc;
        },
        { critical: 0, warning: 0, info: 0 }
      )
    : { critical: 0, warning: 0, info: 0 };

  return (
    <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          expanded && "rotate-90"
        )} />

        <code className="text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
          {page.path}
        </code>

        {latestJob && <StatusBadge status={latestJob.status} size="sm" />}

        <div className="flex-1" />

        {latestJob && latestJob.status === 'completed' && (
          <FindingCounts {...latestFindingCounts} />
        )}

        <span className="text-xs text-muted-foreground">
          {page.jobs.length} {page.jobs.length === 1 ? 'run' : 'runs'}
        </span>
      </div>

      {expanded && (
        <div className="border-t bg-background">
          {page.jobs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">No analyses yet</p>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
                Run first analysis
              </Button>
            </div>
          ) : (
            page.jobs.map((job, i) => (
              <JobRow key={job.id} job={job} isLast={i === page.jobs.length - 1} />
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
  const totalPages = mockSite.pages.length;
  const totalJobs = mockSite.pages.reduce((acc, p) => acc + p.jobs.length, 0);
  const runningJobs = mockSite.pages.reduce(
    (acc, p) => acc + p.jobs.filter((j) => j.status === 'running').length,
    0
  );

  let totalCritical = 0;
  let totalWarning = 0;

  mockSite.pages.forEach((page) => {
    const latest = getLatestJobForPage(page);
    if (latest && latest.status === 'completed') {
      latest.findings.forEach((f) => {
        if (f.severity === 'critical') totalCritical++;
        else if (f.severity === 'warning') totalWarning++;
      });
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">Pages</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{mockSite.domain}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
          <NewAnalysisInput />
        </div>
      </header>

      {/* Stats */}
      <div className="border-b bg-card">
        <div className="flex divide-x">
          <StatsCard label="Pages" value={totalPages} />
          <StatsCard label="Total Runs" value={totalJobs} />
          <StatsCard label="Running" value={runningJobs} valueColor={runningJobs > 0 ? "text-primary" : undefined} />
          <StatsCard
            label="Open Issues"
            value={totalCritical + totalWarning}
            valueColor={totalCritical > 0 ? "text-destructive" : totalWarning > 0 ? "text-warning" : "text-success"}
          />
        </div>
      </div>

      {/* Pages list */}
      <div className="p-6">
        <div className="max-w-3xl space-y-3">
          {mockSite.pages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      </div>
    </div>
  );
}
