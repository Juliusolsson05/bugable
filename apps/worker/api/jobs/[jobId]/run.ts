import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma, type Prisma } from '@bugable/db';
import { QARunner, type QAEvent, type Finding } from '@bugable/qa-runner';
import { createClient } from '@supabase/supabase-js';
import chromium from '@sparticuz/chromium';
import { env } from '../../../lib/env.js';

export const config = {
  maxDuration: 60,
  runtime: 'nodejs20.x',
};

// Initialize Supabase client for screenshot uploads
const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify internal secret
  const internalSecret = req.headers['x-bugable-internal-secret'] as string;
  if (!internalSecret || internalSecret !== env.internalSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const jobId = req.query.jobId as string;

  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId parameter' });
  }

  try {
    // 1. Load job configuration
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { page: { include: { site: true } } }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({ error: 'Job already started or completed' });
    }

    // Safely construct URL (handles https://, trailing slashes, etc.)
    const base = job.page.site.baseUrl.startsWith('http')
      ? job.page.site.baseUrl
      : `https://${job.page.site.baseUrl}`;
    const url = new URL(job.page.path || '/', base).toString();
    // Limit turns for serverless (60s timeout) - 10 turns is realistic
    const maxTurns = Math.min(job.maxTurns || 10, 10);

    // 2. Configure QA Runner with serverless browser
    const qaRunner = new QARunner({
      url,
      maxTurns,
      browserConfig: env.isServerless ? {
        env: 'LOCAL',
        verbose: 1,
        localBrowserLaunchOptions: {
          executablePath: await chromium.executablePath(),
          args: chromium.args,
          headless: true
        }
      } : undefined
    });

    // 3. Track state across events
    const state = {
      currentScreenshotUrl: null as string | null,
      currentTurnFindings: [] as Finding[],
      currentAction: '',
      currentReasoning: ''
    };

    // 4. Process events from QA Runner
    for await (const event of qaRunner.run()) {
      await handleQAEvent(jobId, event, maxTurns, state);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Worker error:', errorMessage);

    // Update job status to failed
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        completedAt: new Date()
      }
    });

    return res.status(500).json({ error: errorMessage });
  }
}

async function uploadScreenshot(
  jobId: string,
  screenshot: Buffer,
  filename: string
): Promise<string> {
  const path = `${jobId}/${filename}`;

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(path, screenshot, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    throw new Error(`Screenshot upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from('screenshots')
    .getPublicUrl(path);

  return data.publicUrl;
}

// Helper to make objects JSON-safe (converts Date to ISO string)
const jsonSafe = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

async function handleQAEvent(
  jobId: string,
  event: QAEvent,
  maxTurns: number,
  state: {
    currentScreenshotUrl: string | null;
    currentTurnFindings: Finding[];
    currentAction: string;
    currentReasoning: string;
  }
) {
  switch (event.type) {
    case 'test_started':
      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'test_started',
          turn: 0,
          url: event.url,
          maxTurns: event.maxTurns
        }
      });

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'running',
          startedAt: new Date(),
          progress: 5,
          currentStep: 'Test started'
        }
      });

      state.currentScreenshotUrl = null;
      state.currentTurnFindings = [];
      state.currentAction = '';
      state.currentReasoning = '';
      break;

    case 'turn_started':
      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'turn_started',
          turn: event.turn
        }
      });

      // Reset state for new turn
      state.currentScreenshotUrl = null;
      state.currentTurnFindings = [];
      state.currentAction = '';
      state.currentReasoning = '';

      // Update progress
      const progress = Math.floor((event.turn / maxTurns) * 85) + 5;
      await prisma.job.update({
        where: { id: jobId },
        data: {
          progress,
          currentStep: `Turn ${event.turn} of ${maxTurns}`
        }
      });
      break;

    case 'screenshot_taken':
      // Upload screenshot to Supabase
      const screenshotUrl = await uploadScreenshot(
        jobId,
        event.screenshot,
        `turn-${event.turn}.png`
      );
      state.currentScreenshotUrl = screenshotUrl;

      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'screenshot_taken',
          turn: event.turn,
          screenshotUrl,
          screenshotSize: event.metadata.size
        }
      });

      // Update latest screenshot URL on job
      await prisma.job.update({
        where: { id: jobId },
        data: { latestScreenshotUrl: screenshotUrl }
      });
      break;

    case 'bugs_detected':
      // Accumulate findings for this turn
      state.currentTurnFindings.push(...event.findings);

      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'bugs_detected',
          turn: event.turn,
          findings: event.findings as any,  // Stored as JSON
          totalFindings: event.totalFindings
        }
      });

      // Update finding counts
      const counts = { critical: 0, high: 0, medium: 0, low: 0 };
      event.findings.forEach(f => {
        const severity = f.severity as 'critical' | 'high' | 'medium' | 'low';
        counts[severity]++;
      });

      await prisma.job.update({
        where: { id: jobId },
        data: {
          findingsCritical: { increment: counts.critical },
          findingsHigh: { increment: counts.high },
          findingsMedium: { increment: counts.medium },
          findingsLow: { increment: counts.low },
        }
      });

      // Call n8n to generate interventions for each finding
      const interventionWebhookUrl = env.n8nInterventionWebhookUrl;
      if (interventionWebhookUrl) {
        let findingIndex = 0;
        for (const finding of event.findings) {
          const findingRef = `finding-${event.turn}-${findingIndex++}`;
          try {
            // Build prompt from finding
            const prompt = `${finding.description}${finding.location ? ` Location: ${finding.location}` : ''}`;

            // Call n8n intervention webhook
            const payload: { prompt: string; image?: string } = { prompt };

            // Include screenshot if available (as base64)
            if (state.currentScreenshotUrl) {
              // Fetch the screenshot and convert to base64
              try {
                const screenshotResponse = await fetch(state.currentScreenshotUrl);
                if (screenshotResponse.ok) {
                  const buffer = await screenshotResponse.arrayBuffer();
                  payload.image = Buffer.from(buffer).toString('base64');
                }
              } catch (screenshotErr) {
                console.warn(`Failed to fetch screenshot for intervention: ${screenshotErr}`);
              }
            }

            console.log(`Calling n8n intervention webhook for ${findingRef}...`);
            const n8nResponse = await fetch(interventionWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(env.n8nApiKey ? { 'X-N8N-API-KEY': env.n8nApiKey } : {}),
              },
              body: JSON.stringify(payload),
            });

            if (n8nResponse.ok) {
              const n8nData = await n8nResponse.json();
              console.log(`n8n response for ${findingRef}:`, JSON.stringify(n8nData, null, 2));

              // Parse the response - handle multiple formats
              let interventionData;

              // Format 1: { response: "<json string>" }
              if (typeof n8nData.response === 'string') {
                try {
                  interventionData = JSON.parse(n8nData.response);
                } catch {
                  const match = n8nData.response.match(/\{[^{}]*\}/);
                  if (match) interventionData = JSON.parse(match[0]);
                }
              }
              // Format 2: Direct object with solution_type
              else if (n8nData.solution_type) {
                interventionData = n8nData;
              }
              // Format 3: Array with first item
              else if (Array.isArray(n8nData) && n8nData[0]?.solution_type) {
                interventionData = n8nData[0];
              }
              // Format 4: Nested in output/data
              else if (n8nData.output?.solution_type) {
                interventionData = n8nData.output;
              } else if (n8nData.data?.solution_type) {
                interventionData = n8nData.data;
              }

              console.log(`Parsed intervention data for ${findingRef}:`, interventionData);

              if (interventionData && interventionData.solution_type) {
                // Map n8n response to our intervention model
                const type = interventionData.solution_type === 'text_input' ? 'text_input' : 'yes_no_other';

                await prisma.intervention.upsert({
                  where: {
                    jobId_findingRef: { jobId, findingRef }
                  },
                  create: {
                    jobId,
                    findingRef,
                    type,
                    prompt: interventionData.prompt || 'Please provide additional information',
                    placeholder: interventionData.placeholder,
                    yesLabel: interventionData.yes_label,
                    noLabel: interventionData.no_label,
                    otherLabel: interventionData.other_label,
                  },
                  update: {
                    type,
                    prompt: interventionData.prompt || 'Please provide additional information',
                    placeholder: interventionData.placeholder,
                    yesLabel: interventionData.yes_label,
                    noLabel: interventionData.no_label,
                    otherLabel: interventionData.other_label,
                  }
                });
                console.log(`Created intervention for ${findingRef}: ${type}`);
              } else {
                console.warn(`No valid intervention data found for ${findingRef} - missing solution_type`);
              }
            } else {
              console.warn(`n8n webhook returned ${n8nResponse.status} for ${findingRef}`);
            }
          } catch (interventionErr) {
            console.error(`Failed to create intervention for ${findingRef}:`, interventionErr);
          }
        }
      }
      break;

    case 'action_planned':
      // Store action and reasoning
      state.currentAction = event.action;
      state.currentReasoning = event.reasoning;

      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'action_planned',
          turn: event.turn,
          action: event.action,
          reasoning: event.reasoning,
          complete: event.complete
        }
      });

      if (event.complete) {
        await prisma.job.update({
          where: { id: jobId },
          data: {
            progress: 90,
            currentStep: 'Analysis complete'
          }
        });
      }
      break;

    case 'action_executed':
      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'action_executed',
          turn: event.turn,
          action: event.action,
          success: event.success,
          error: event.error
        }
      });

      // Log action execution failures
      if (!event.success && event.error) {
        console.warn(`Turn ${event.turn} action failed: ${event.error}`);
      }
      break;

    case 'turn_completed':
      // Create event record
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'turn_completed',
          turn: event.turn
        }
      });
      break;

    case 'test_completed':
      // Create event record with full result (jsonSafe converts Date to string)
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'test_completed',
          turn: event.turn,
          result: jsonSafe(event.result)
        }
      });

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          progress: 100,
          currentStep: 'Complete',
          completedAt: new Date(),
          completionReason: event.result.completionReason,
        }
      });
      break;

    case 'test_error':
      // Create event record (jsonSafe converts Date to string)
      await prisma.jobEvent.create({
        data: {
          jobId,
          type: 'test_error',
          turn: event.turn,
          error: event.error,
          partialResult: event.partialResult ? jsonSafe(event.partialResult) : undefined
        }
      });

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          completionReason: 'error',
          errorMessage: event.error,
        }
      });
      break;
  }
}
