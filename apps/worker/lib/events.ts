import { env } from './env.js';
import type { JobEvent, TurnData, FindingData, StatusUpdate } from './types.js';

/**
 * Send events to the main app via internal API
 */
async function sendEvents(jobId: string, events: JobEvent[]): Promise<void> {
  const response = await fetch(`${env.appUrl}/api/internal/jobs/${jobId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bugable-Internal-Secret': env.internalSecret,
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send events: ${response.statusText}`);
  }
}

/**
 * Update job progress
 */
export async function updateProgress(
  jobId: string,
  progress: number,
  currentStep: string
): Promise<void> {
  await sendEvents(jobId, [{
    type: 'progress',
    timestamp: new Date().toISOString(),
    data: { progress, currentStep }
  }]);
}

/**
 * Update job status
 */
export async function updateStatus(
  jobId: string,
  status: 'running' | 'completed' | 'failed',
  extra?: StatusUpdate
): Promise<void> {
  await sendEvents(jobId, [{
    type: 'status',
    timestamp: new Date().toISOString(),
    data: { status, ...extra }
  }]);
}

/**
 * Create a new turn event
 */
export async function createTurn(jobId: string, turn: TurnData): Promise<void> {
  await sendEvents(jobId, [{
    type: 'turn',
    timestamp: new Date().toISOString(),
    data: turn as unknown as Record<string, unknown>
  }]);
}

/**
 * Save a finding
 */
export async function saveFinding(jobId: string, finding: FindingData): Promise<void> {
  await sendEvents(jobId, [{
    type: 'finding',
    timestamp: new Date().toISOString(),
    data: finding as unknown as Record<string, unknown>
  }]);
}
