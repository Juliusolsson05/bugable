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
    warning: {
      label: 'Warning',
      className: 'bg-warning-muted text-warning-muted-foreground border-warning/20',
    },
    info: {
      label: 'Info',
      className: 'bg-info-muted text-info-muted-foreground border-info/20',
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
  warning: number;
  info: number;
}

export function FindingCounts({ critical, warning, info }: FindingCountsProps) {
  const total = critical + warning + info;

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
      {warning > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-warning-muted-foreground font-medium">{warning}</span>
        </span>
      )}
      {info > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-info" />
          <span className="text-info-muted-foreground font-medium">{info}</span>
        </span>
      )}
    </div>
  );
}
