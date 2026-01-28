const INTERNAL_SECRET = process.env.BUGABLE_INTERNAL_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type EventType = 'progress' | 'turn' | 'finding' | 'status';

interface JobEvent {
  type: EventType;
  timestamp: string;
  data: Record<string, unknown>;
}

async function sendEvents(jobId: string, events: JobEvent[]) {
  await fetch(`${APP_URL}/api/internal/jobs/${jobId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bugable-Internal-Secret': INTERNAL_SECRET,
    },
    body: JSON.stringify({ events }),
  });
}

export async function updateProgress(jobId: string, progress: number, currentStep: string) {
  await sendEvents(jobId, [{
    type: 'progress',
    timestamp: new Date().toISOString(),
    data: { progress, currentStep }
  }]);
}

export async function updateStatus(
  jobId: string,
  status: 'running' | 'completed' | 'failed',
  extra?: {
    errorMessage?: string;
    completionReason?: 'done' | 'max_turns' | 'error';
    totalTurns?: number;
  }
) {
  await sendEvents(jobId, [{
    type: 'status',
    timestamp: new Date().toISOString(),
    data: { status, ...extra }
  }]);
}

export async function createTurn(jobId: string, turn: {
  number: number;
  action?: string;
  reasoning: string;
  screenshotUrl?: string;
}) {
  await sendEvents(jobId, [{
    type: 'turn',
    timestamp: new Date().toISOString(),
    data: turn
  }]);
}

export async function saveFinding(jobId: string, finding: {
  turnNumber: number;  // Link to turn
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: string;
}) {
  await sendEvents(jobId, [{
    type: 'finding',
    timestamp: new Date().toISOString(),
    data: finding
  }]);
}
