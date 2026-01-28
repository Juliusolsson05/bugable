import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@bugable/db';
import { createStagehand } from '@/lib/stagehand';
import { createTurn, updateProgress, updateStatus, saveFinding } from '@/lib/job-logger';
import { uploadScreenshot } from '@/lib/storage';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  let stagehand = null;

  try {
    // 1. Get job info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { page: { include: { site: true } } }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'pending') {
      return NextResponse.json({ error: 'Job already started' }, { status: 400 });
    }

    const url = `https://${job.page.site.baseUrl}${job.page.path}`;

    // 2. Start job
    await updateStatus(jobId, 'running');
    await updateProgress(jobId, 10, 'Initializing browser');

    // 3. Create Stagehand (serverless chromium)
    await updateProgress(jobId, 20, 'Launching browser');
    stagehand = await createStagehand();

    // 4. Navigate to page and take initial screenshot (Turn 1)
    await updateProgress(jobId, 30, 'Loading page');
    await stagehand.page.goto(url, { waitUntil: 'networkidle' });

    const screenshot = await stagehand.page.screenshot({ fullPage: true });
    const screenshotUrl = await uploadScreenshot(jobId, screenshot as Buffer, 'turn-1.png');

    await createTurn(jobId, {
      number: 1,
      reasoning: `Loaded ${url} and captured initial state`,
      screenshotUrl
    });

    // 5. TODO: Call qa-engine here when ready
    // -----------------------------------------
    // let turnNumber = 1;
    // const qaEngine = await import('@bugable/qa-runner');
    // for await (const event of qaEngine.run(url, stagehand)) {
    //   switch (event.type) {
    //     case 'turn':
    //       turnNumber = event.data.number;
    //       const turnScreenshotUrl = await uploadScreenshot(
    //         jobId, event.data.screenshot, `turn-${turnNumber}.png`
    //       );
    //       await createTurn(jobId, {
    //         number: turnNumber,
    //         action: event.data.action,
    //         reasoning: event.data.reasoning,
    //         screenshotUrl: turnScreenshotUrl
    //       });
    //       break;
    //     case 'finding':
    //       await saveFinding(jobId, event.data);
    //       break;
    //     case 'progress':
    //       await updateProgress(jobId, event.data.progress, event.data.step);
    //       break;
    //     case 'complete':
    //       await updateStatus(jobId, 'completed', {
    //         completionReason: event.data.reason,
    //         totalTurns: event.data.totalTurns
    //       });
    //       break;
    //   }
    // }
    // -----------------------------------------

    await updateProgress(jobId, 90, 'Analysis complete');

    // 6. Complete (placeholder until qa-engine integration)
    await updateStatus(jobId, 'completed', {
      completionReason: 'done',
      totalTurns: 1
    });

    return NextResponse.json({ success: true, screenshotUrl });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await updateStatus(jobId, 'failed', {
      errorMessage,
      completionReason: 'error'
    });
    return NextResponse.json({ error: errorMessage }, { status: 500 });

  } finally {
    if (stagehand) {
      await stagehand.close();
    }
  }
}
