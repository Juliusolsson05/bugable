/**
 * Shared TypeScript types
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type EventType = 'progress' | 'turn' | 'finding' | 'status';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type CompletionReason = 'done' | 'max_turns' | 'error';

export interface JobEvent {
  type: EventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface TurnData {
  number: number;
  action?: string;
  reasoning: string;
  screenshotUrl?: string;
}

export interface FindingData {
  turnNumber: number;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  location: string;
}

export interface StatusUpdate {
  errorMessage?: string;
  completionReason?: CompletionReason;
  totalTurns?: number;
}
