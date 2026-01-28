import { cn } from '@/lib/utils';
import type { JobStatus, Severity } from '@/lib/api';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = {
    pending: {
      label: 'Queued',
      className: 'bg-muted text-muted-foreground',
      dotClassName: 'bg-muted-foreground',
    },
    running: {
      label: 'Running',
      className: 'bg-primary/10 text-primary',
      dotClassName: 'bg-primary animate-pulse',
    },
    completed: {
      label: 'Completed',
      className: 'bg-success-muted text-success-muted-foreground',
      dotClassName: 'bg-success',
    },
    failed: {
      label: 'Failed',
      className: 'bg-destructive-muted text-destructive-muted-foreground',
      dotClassName: 'bg-destructive',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-muted text-muted-foreground',
      dotClassName: 'bg-muted-foreground',
    },
  }[status];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      size === 'sm' ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      config.className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    critical: {
      label: 'Critical',
      className: 'bg-destructive-muted text-destructive-muted-foreground border-destructive/20',
    },
    high: {
      label: 'High',
      className: 'bg-warning-muted text-warning-muted-foreground border-warning/20',
    },
    medium: {
      label: 'Medium',
      className: 'bg-info-muted text-info-muted-foreground border-info/20',
    },
    low: {
      label: 'Low',
      className: 'bg-muted text-muted-foreground border-border',
    },
  }[severity];

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border",
      config.className
    )}>
      {config.label}
    </span>
  );
}

interface FindingCountsProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function FindingCounts({ critical, high, medium, low }: FindingCountsProps) {
  const total = critical + high + medium + low;

  if (total === 0) {
    return <span className="text-xs text-muted-foreground">No issues</span>;
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {critical > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-destructive-muted-foreground font-medium">{critical}</span>
        </span>
      )}
      {high > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-warning-muted-foreground font-medium">{high}</span>
        </span>
      )}
      {medium > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-info" />
          <span className="text-info-muted-foreground font-medium">{medium}</span>
        </span>
      )}
      {low > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
          <span className="text-muted-foreground font-medium">{low}</span>
        </span>
      )}
    </div>
  );
}
