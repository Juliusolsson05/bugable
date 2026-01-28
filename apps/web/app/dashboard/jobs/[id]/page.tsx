'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Square, Shield, MousePointer, Palette, Eye, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge, SeverityBadge } from '@/components/status-badge';
import { cn } from '@/lib/utils';
import {
  getJob,
  rerunJob,
  cancelJob,
  formatRelativeTime,
  type Finding,
  type Job,
  type Page,
  type JobStatus,
  type Severity,
  type Category,
} from '@/lib/api';
import type { JobEvent } from '@bugable/db';

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

interface Screenshot {
  url: string;
  turn: number;
}

function LiveViewPanel({
  status,
  screenshots,
  currentTurn
}: {
  status: JobStatus;
  screenshots: Screenshot[];
  currentTurn: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState(screenshots.length > 0 ? screenshots.length - 1 : 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTallImage, setIsTallImage] = useState(false);

  // Auto-update to latest when new screenshots come in
  useEffect(() => {
    if (status === 'running' && screenshots.length > 0) {
      setSelectedIndex(screenshots.length - 1);
    }
  }, [screenshots.length, status]);

  const currentScreenshot = screenshots[selectedIndex];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < screenshots.length - 1;

  // Detect if image is very tall (aspect ratio < 0.8 means height is much larger than width)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setIsTallImage(aspectRatio < 0.8);
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Live View</h3>
          <p className="text-xs text-muted-foreground">
            {currentScreenshot ? 'Click to expand' : 'What the AI sees'}
          </p>
        </div>
        {screenshots.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIndex(i => i - 1)}
              disabled={!hasPrev}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-center">
              Turn {currentScreenshot?.turn || selectedIndex + 1} / {currentTurn || screenshots.length}
            </span>
            <button
              onClick={() => setSelectedIndex(i => i + 1)}
              disabled={!hasNext}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Screenshot container with fixed aspect ratio */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        {currentScreenshot ? (
          <div
            className="aspect-[16/10] w-full max-w-xl bg-card border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => setIsExpanded(true)}
          >
            <img
              src={currentScreenshot.url}
              alt={`Turn ${currentScreenshot.turn} screenshot`}
              onLoad={handleImageLoad}
              className={cn(
                "w-full h-full",
                isTallImage ? "object-cover object-top" : "object-contain"
              )}
            />
          </div>
        ) : status === 'running' ? (
          <div className="aspect-[16/10] w-full max-w-xl bg-card border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Capturing...</p>
            </div>
          </div>
        ) : status === 'completed' ? (
          <div className="aspect-[16/10] w-full max-w-xl bg-card border rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No screenshot available</p>
            </div>
          </div>
        ) : (
          <div className="aspect-[16/10] w-full max-w-xl bg-card border rounded-lg flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No preview available</p>
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
          <DialogTitle className="sr-only">Screenshot Turn {currentScreenshot?.turn}</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Navigation in dialog */}
            {screenshots.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 rounded-full px-4 py-2 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i - 1); }}
                  disabled={!hasPrev}
                  className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-white tabular-nums">
                  Turn {currentScreenshot?.turn} / {currentTurn || screenshots.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i + 1); }}
                  disabled={!hasNext}
                  className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            <img
              src={currentScreenshot?.url}
              alt={`Turn ${currentScreenshot?.turn} screenshot`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReasoningPanel({ events, status }: { events: JobEvent[]; status: JobStatus }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-medium">AI Reasoning</h3>
        <p className="text-xs text-muted-foreground">Analysis log</p>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {events.length === 0 ? (
          <p className="text-muted-foreground">
            {status === 'pending' ? 'Waiting to start...' : 'No events'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {events.map((event) => (
              <div key={event.id} className="flex gap-3">
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className="text-primary font-medium shrink-0">[{event.type}]</span>
                <span className="text-foreground">
                  {event.reasoning || event.action || event.error || `Turn ${event.turn}`}
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
  error: <Shield className="h-4 w-4" />,
  layout_broken: <Palette className="h-4 w-4" />,
  image_broken: <Palette className="h-4 w-4" />,
  form_validation: <MousePointer className="h-4 w-4" />,
  accessibility: <Eye className="h-4 w-4" />,
  visual_overflow: <Palette className="h-4 w-4" />,
  responsive_break: <Palette className="h-4 w-4" />,
  typography: <Palette className="h-4 w-4" />,
  interactive_fail: <MousePointer className="h-4 w-4" />,
  contrast: <Eye className="h-4 w-4" />,
};

function FindingCard({ finding }: { finding: Finding }) {
  const borderColor = {
    critical: 'border-l-destructive',
    high: 'border-l-warning',
    medium: 'border-l-info',
    low: 'border-l-muted-foreground/50',
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
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>
  );

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div>
          <h3 className="text-sm font-medium">Findings</h3>
          <p className="text-xs text-muted-foreground">
            {status === 'running' ? 'Detected during analysis' : status === 'completed' ? 'Analysis complete' : 'Issues detected'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {counts.critical > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              {counts.critical} critical
            </span>
          )}
          {counts.high > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              {counts.high} high
            </span>
          )}
          {counts.medium > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-info" />
              {counts.medium} medium
            </span>
          )}
          {counts.low > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
              {counts.low} low
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
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const data = await getJob(id, { includeFindings: true, includeEvents: true });
      setJob(data.job);
      setPage(data.page);
      setSite(data.site);
      setFindings(data.findings || []);
      setEvents(data.events || []);
      setScreenshots(data.screenshots || []);
      setCurrentTurn(data.currentTurn || 0);
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
        {/* Live view + reasoning (only for running jobs or jobs with screenshots/events) */}
        {(job.status === 'running' || screenshots.length > 0 || events.length > 0) && (
          <div className="grid grid-cols-2 h-[500px] border-b">
            <LiveViewPanel status={job.status} screenshots={screenshots} currentTurn={currentTurn} />
            <ReasoningPanel events={events} status={job.status} />
          </div>
        )}

        {/* Findings */}
        <FindingsSection findings={findings} status={job.status} />
      </div>
    </div>
  );
}
