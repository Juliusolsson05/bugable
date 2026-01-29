'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Undo2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSite } from '@/components/site-provider';
import {
  getFindings,
  resolveFinding,
  formatRelativeTime,
  type GlobalFinding,
  type Severity,
} from '@/lib/api';

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Info,
  },
  low: {
    label: 'Low',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Info,
  },
};

const SEVERITY_ORDER: Severity[] = ['low', 'medium', 'high', 'critical'];

function FindingCard({
  finding,
  onResolve,
}: {
  finding: GlobalFinding;
  onResolve: (id: string, resolved: boolean) => Promise<void>;
}) {
  const [isResolving, setIsResolving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[finding.severity];
  const Icon = config.icon;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(finding.id, !finding.resolved);
    } finally {
      setIsResolving(false);
    }
  };

  const baseUrl = finding.siteBaseUrl.startsWith('http')
    ? finding.siteBaseUrl
    : `https://${finding.siteBaseUrl}`;
  const fullUrl = baseUrl.replace(/\/$/, '') + finding.pagePath;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        finding.resolved
          ? 'bg-muted/50 border-muted opacity-60'
          : cn(config.bgColor, config.borderColor)
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', finding.resolved ? 'text-muted-foreground' : config.color)} />
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'inline-block px-1.5 py-0.5 text-xs font-medium rounded mb-1',
              finding.resolved ? 'bg-muted text-muted-foreground' : cn(config.bgColor, config.color)
            )}
          >
            {finding.category.replace(/_/g, ' ')}
          </span>
          <p className={cn('text-sm', finding.resolved ? 'text-muted-foreground line-through' : 'text-foreground')}>
            {finding.description}
          </p>
        </div>
      </div>

      {/* Location & page info */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
        <span className="truncate">{finding.pagePath}</span>
      </button>

      {expanded && (
        <div className="text-xs text-muted-foreground space-y-1 mb-2 pl-4 border-l-2 border-muted">
          <p>
            <span className="font-medium">Site:</span> {finding.siteName}
          </p>
          <p>
            <span className="font-medium">Page:</span> {finding.pageTitle || finding.pagePath}
          </p>
          {finding.location && (
            <p>
              <span className="font-medium">Element:</span> {finding.location}
            </p>
          )}
          <p>
            <span className="font-medium">Detected:</span> Turn {finding.turn},{' '}
            {formatRelativeTime(finding.detectedAt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open page
            </a>
            <Link
              href={`/dashboard/jobs/${finding.jobId}`}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              View job
            </Link>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResolve}
          disabled={isResolving}
          className={cn(
            'h-7 text-xs',
            finding.resolved
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-success hover:text-success'
          )}
        >
          {isResolving ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : finding.resolved ? (
            <>
              <Undo2 className="h-3 w-3 mr-1" />
              Unresolve
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Resolve
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SeverityColumn({
  severity,
  findings,
  onResolve,
}: {
  severity: Severity;
  findings: GlobalFinding[];
  onResolve: (id: string, resolved: boolean) => Promise<void>;
}) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  const unresolvedCount = findings.filter((f) => !f.resolved).length;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-lg border border-b-0',
          config.bgColor,
          config.borderColor
        )}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
        <span className={cn('font-medium', config.color)}>{config.label}</span>
        <span
          className={cn(
            'ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full',
            unresolvedCount > 0 ? cn(config.bgColor, config.color) : 'bg-muted text-muted-foreground'
          )}
        >
          {unresolvedCount}
        </span>
      </div>

      {/* Cards */}
      <div
        className={cn(
          'flex-1 p-2 space-y-2 rounded-b-lg border overflow-y-auto max-h-[calc(100vh-220px)]',
          'bg-card',
          config.borderColor
        )}
      >
        {findings.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No findings</p>
        ) : (
          findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} onResolve={onResolve} />
          ))
        )}
      </div>
    </div>
  );
}

export default function FindingsPage() {
  const { activeSite, isLoading: siteLoading } = useSite();
  const [findings, setFindings] = useState<GlobalFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const fetchFindings = useCallback(async () => {
    if (!activeSite) return;
    setIsLoading(true);
    try {
      const data = await getFindings({ siteId: activeSite.id });
      setFindings(data.findings);
    } catch (err) {
      console.error('Failed to fetch findings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSite]);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  const handleResolve = useCallback(async (id: string, resolved: boolean) => {
    try {
      await resolveFinding(id, resolved);
      // Optimistically update local state
      setFindings((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, resolved, resolvedAt: resolved ? new Date().toISOString() : null }
            : f
        )
      );
    } catch (err) {
      console.error('Failed to resolve finding:', err);
      // Refetch on error
      fetchFindings();
    }
  }, [fetchFindings]);

  // Group and filter findings
  const { findingsBySeverity, stats } = useMemo(() => {
    const filtered = showResolved ? findings : findings.filter((f) => !f.resolved);
    const bySeverity: Record<Severity, GlobalFinding[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    filtered.forEach((f) => {
      bySeverity[f.severity]?.push(f);
    });

    const totalUnresolved = findings.filter((f) => !f.resolved).length;
    const totalResolved = findings.filter((f) => f.resolved).length;

    return {
      findingsBySeverity: bySeverity,
      stats: {
        total: findings.length,
        unresolved: totalUnresolved,
        resolved: totalResolved,
        critical: findings.filter((f) => f.severity === 'critical' && !f.resolved).length,
        high: findings.filter((f) => f.severity === 'high' && !f.resolved).length,
        medium: findings.filter((f) => f.severity === 'medium' && !f.resolved).length,
        low: findings.filter((f) => f.severity === 'low' && !f.resolved).length,
      },
    };
  }, [findings, showResolved]);

  // Loading state - must be after all hooks
  if (siteLoading || !activeSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          <div>
            <h1 className="text-base font-semibold">Findings</h1>
            <p className="text-xs text-muted-foreground">
              {stats.unresolved} open on {activeSite.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.resolved > 0 && (
              <button
                onClick={() => setShowResolved(!showResolved)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                  showResolved
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {showResolved ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showResolved ? 'Showing' : 'Show'} {stats.resolved} resolved
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchFindings} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="border-b bg-muted/30 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          {stats.critical > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-600">{stats.critical}</span>
            </div>
          )}
          {stats.high > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-600">{stats.high}</span>
            </div>
          )}
          {stats.medium > 0 && (
            <div className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-600">{stats.medium}</span>
            </div>
          )}
          {stats.low > 0 && (
            <div className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-600">{stats.low}</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 p-6 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Check className="h-12 w-12 text-success mb-4" />
            <h2 className="text-lg font-semibold mb-2">No findings</h2>
            <p className="text-muted-foreground">
              Run some QA tests to start discovering issues.
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {SEVERITY_ORDER.map((severity) => (
              <SeverityColumn
                key={severity}
                severity={severity}
                findings={findingsBySeverity[severity]}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
