'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Square, Shield, MousePointer, Palette, Zap, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import {
  getJob,
  rerunJob,
  cancelJob,
  formatRelativeTime,
  type Finding,
  type ReasoningLog,
  type Job,
  type Page,
  type JobStatus,
  type Severity,
  type Category,
} from '@/lib/api';

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function LiveViewPanel({ status, screenshotUrl }: { status: JobStatus; screenshotUrl?: string | null }) {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-medium">Live View</h3>
        <p className="text-xs text-muted-foreground">What the AI sees</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-sm aspect-[16/10] bg-card border flex items-center justify-center overflow-hidden">
          {screenshotUrl ? (
            <img src={screenshotUrl} alt="Screenshot" className="w-full h-full object-cover" />
          ) : status === 'running' ? (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Capturing...</p>
            </div>
          ) : status === 'completed' ? (
            <div className="text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No screenshot</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No preview</p>
          )}
        </div>
      </div>
      <div className="px-4 py-2 border-t bg-muted/30 text-[11px] text-muted-foreground font-mono">
        Viewport: 1920 x 1080
      </div>
    </div>
  );
}

function ReasoningPanel({ logs, status }: { logs: ReasoningLog[]; status: JobStatus }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-medium">AI Reasoning</h3>
        <p className="text-xs text-muted-foreground">Analysis log</p>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">
            {status === 'pending' ? 'Waiting to start...' : 'No logs'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-primary font-medium shrink-0">[{log.step}]</span>
                <span className={cn(
                  log.message.toLowerCase().includes('warning') || log.message.toLowerCase().includes('error')
                    ? 'text-warning'
                    : 'text-foreground'
                )}>
                  {log.message}
                </span>
              </div>
            ))}
            {status === 'running' && (
              <div className="flex gap-3 items-center text-muted-foreground">
                <span className="tabular-nums">
                  {new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:300ms]" />
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const categoryIcons: Record<Category, React.ReactNode> = {
  security: <Shield className="h-4 w-4" />,
  ux: <MousePointer className="h-4 w-4" />,
  ui: <Palette className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  accessibility: <Eye className="h-4 w-4" />,
  seo: <Eye className="h-4 w-4" />,
};

function FindingCard({ finding }: { finding: Finding }) {
  const borderColor = {
    critical: 'border-l-destructive',
    warning: 'border-l-warning',
    info: 'border-l-info',
  }[finding.severity];

  return (
    <div className={cn("border bg-card overflow-hidden border-l-[3px]", borderColor)}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-muted-foreground">
            {categoryIcons[finding.category]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <SeverityBadge severity={finding.severity} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {finding.category}
              </span>
            </div>
            <h4 className="text-sm font-medium mb-1">{finding.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{finding.description}</p>
            {finding.location && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Location:</span>{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                  {finding.location}
                </code>
              </div>
            )}
          </div>
        </div>
        {finding.recommendation && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs">
              <span className="font-medium text-foreground">Recommendation:</span>{' '}
              <span className="text-muted-foreground">{finding.recommendation}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FindingsSection({ findings, status }: { findings: Finding[]; status: JobStatus }) {
  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity]++;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 } as Record<Severity, number>
  );

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div>
          <h3 className="text-sm font-medium">Findings</h3>
          <p className="text-xs text-muted-foreground">
            {status === 'running' ? 'Issues found so far' : 'Analysis results'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {counts.critical > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              {counts.critical} critical
            </span>
          )}
          {counts.warning > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              {counts.warning} warning
            </span>
          )}
          {counts.info > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-info" />
              {counts.info} info
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {findings.length === 0 ? (
          <div className="text-center py-12">
            {status === 'running' ? (
              <>
                <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Scanning for issues...</p>
              </>
            ) : status === 'completed' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-success-muted-foreground">No issues found</p>
                <p className="text-xs text-muted-foreground mt-1">This page passed all checks</p>
              </>
            ) : status === 'cancelled' ? (
              <>
                <p className="text-sm text-muted-foreground">This analysis was cancelled</p>
                <p className="text-xs text-muted-foreground mt-1">You can re-run it at any time</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No findings</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [site, setSite] = useState<{ id: string; name: string; baseUrl: string } | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<ReasoningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const data = await getJob(id, { includeFindings: true, includeLogs: true });
      setJob(data.job);
      setPage(data.page);
      setSite(data.site);
      setFindings(data.findings || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch job:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Poll for updates if job is running
  useEffect(() => {
    if (job?.status === 'running' || job?.status === 'pending') {
      const interval = setInterval(fetchJob, 3000);
      return () => clearInterval(interval);
    }
  }, [job?.status, fetchJob]);

  const handleRerun = async () => {
    setIsActioning(true);
    try {
      const data = await rerunJob(id);
      router.push(`/dashboard/jobs/${data.job.id}`);
    } catch (err) {
      console.error('Failed to rerun job:', err);
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancel = async () => {
    setIsActioning(true);
    try {
      await cancelJob(id);
      fetchJob();
    } catch (err) {
      console.error('Failed to cancel job:', err);
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pages
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-semibold">
                  <code className="bg-muted px-2 py-0.5 rounded text-base">{page.path}</code>
                </h1>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {page.fullUrl} &middot; {formatRelativeTime(job.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {job.status === 'running' && (
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActioning}>
                  <Square className="h-3 w-3" />
                  Cancel
                </Button>
              )}
              {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                <Button size="sm" onClick={handleRerun} disabled={isActioning}>
                  <RotateCcw className="h-3 w-3" />
                  Re-run
                </Button>
              )}
            </div>
          </div>

          {job.status === 'running' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{job.currentStep}</span>
                <span className="font-medium tabular-nums">{job.progress}%</span>
              </div>
              <ProgressBar progress={job.progress} />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Live view + reasoning (only for running jobs or jobs with logs) */}
        {(job.status === 'running' || logs.length > 0) && (
          <div className="grid grid-cols-2 h-72 border-b">
            <LiveViewPanel status={job.status} screenshotUrl={job.screenshotUrl} />
            <ReasoningPanel logs={logs} status={job.status} />
          </div>
        )}

        {/* Findings */}
        <FindingsSection findings={findings} status={job.status} />
      </div>
    </div>
  );
}
