# Job Worker Infrastructure Implementation Plan

## Goal

Set up the core infrastructure for serverless job execution on Vercel, so the qa-engine can be plugged in later. This includes:
- Supabase Storage bucket for screenshots
- Browser automation setup (Chromium + Playwright)
- Worker route with proper lifecycle management
- Fire-and-forget job triggering
- Screenshot capture and upload

---

## Implementation Steps

### 1. Create Supabase Storage Bucket

Run in Supabase SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Allow service role to upload
CREATE POLICY "Service role can upload screenshots"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'screenshots');

-- Allow public read access
CREATE POLICY "Public read access for screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'screenshots');
```

---

### 2. Install Dependencies

```bash
cd apps/web
pnpm add @sparticuz/chromium playwright-core
```

| Package | Purpose |
|---------|---------|
| `@sparticuz/chromium` | Chromium binary optimized for serverless (AWS Lambda/Vercel) |
| `playwright-core` | Browser automation (no bundled browser) |

---

### 3. Create Browser Setup Module

**File:** `apps/web/lib/browser.ts`

```typescript
import chromium from "@sparticuz/chromium";
import { chromium as playwright, Browser, Page } from "playwright-core";

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance) return browserInstance;

  browserInstance = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function takeScreenshot(
  url: string,
  options?: { fullPage?: boolean; viewport?: { width: number; height: number } }
): Promise<{ screenshot: Buffer; title: string }> {
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: options?.viewport ?? { width: 1920, height: 1080 },
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const title = await page.title();
    const screenshot = await page.screenshot({ fullPage: options?.fullPage ?? true });
    return { screenshot: screenshot as Buffer, title };
  } finally {
    await page.close();
  }
}
```

---

### 4. Create Job Logger Module

**File:** `apps/web/lib/job-logger.ts`

Uses the existing internal events API for consistency.

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INTERNAL_SECRET = process.env.BUGABLE_INTERNAL_SECRET!;

type JobStep = "initialize" | "page_load" | "screenshot" | "analysis" | "complete" | "error";

async function sendEvent(jobId: string, events: unknown[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await fetch(`${baseUrl}/api/internal/jobs/${jobId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Bugable-Internal-Secret": INTERNAL_SECRET,
    },
    body: JSON.stringify({ events }),
  });
}

export async function logStep(
  jobId: string,
  step: JobStep,
  message: string,
  screenshotUrl?: string
) {
  await sendEvent(jobId, [
    {
      type: "log",
      timestamp: new Date().toISOString(),
      data: { step, message, screenshotUrl },
    },
  ]);
}

export async function updateProgress(
  jobId: string,
  progress: number,
  currentStep: string
) {
  await sendEvent(jobId, [
    {
      type: "progress",
      timestamp: new Date().toISOString(),
      data: { progress, currentStep },
    },
  ]);
}

export async function updateStatus(
  jobId: string,
  status: "running" | "completed" | "failed",
  options?: { errorMessage?: string; screenshotUrl?: string }
) {
  await sendEvent(jobId, [
    {
      type: "status",
      timestamp: new Date().toISOString(),
      data: { status, ...options },
    },
  ]);
}

export async function uploadScreenshot(
  jobId: string,
  screenshot: Buffer,
  filename: string
): Promise<string> {
  const path = `${jobId}/${filename}`;

  await supabase.storage
    .from("screenshots")
    .upload(path, screenshot, { contentType: "image/png", upsert: true });

  const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
  return data.publicUrl;
}
```

---

### 5. Create Worker Route

**File:** `apps/web/app/api/jobs/[jobId]/run/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@bugable/db";
import { getBrowser, closeBrowser, takeScreenshot } from "@/lib/browser";
import {
  logStep,
  updateProgress,
  updateStatus,
  uploadScreenshot,
} from "@/lib/job-logger";

export const maxDuration = 60; // Vercel Pro limit
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  // 1. Get job and page info
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      page: {
        include: {
          site: true,
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "pending") {
    return NextResponse.json(
      { error: "Job already started or completed" },
      { status: 400 }
    );
  }

  const fullUrl = `https://${job.page.site.baseUrl}${job.page.path}`;

  try {
    // 2. Initialize
    await updateStatus(jobId, "running");
    await updateProgress(jobId, 10, "Initializing browser");
    await logStep(jobId, "initialize", `Starting analysis of ${fullUrl}`);

    // 3. Launch browser and load page
    await updateProgress(jobId, 20, "Loading page");
    await logStep(jobId, "page_load", "Launching browser...");

    const { screenshot, title } = await takeScreenshot(fullUrl);

    await logStep(jobId, "page_load", `Page loaded: ${title}`);

    // 4. Upload screenshot
    await updateProgress(jobId, 40, "Capturing screenshot");
    await logStep(jobId, "screenshot", "Taking full-page screenshot...");

    const screenshotUrl = await uploadScreenshot(jobId, screenshot, "full-page.png");

    await logStep(jobId, "screenshot", "Screenshot captured", screenshotUrl);
    await updateProgress(jobId, 50, "Screenshot captured");

    // 5. Placeholder for AI analysis (to be implemented later)
    await updateProgress(jobId, 60, "Ready for analysis");
    await logStep(jobId, "analysis", "AI analysis placeholder - plug in qa-engine here");

    // TODO: Integrate qa-engine here
    // const findings = await qaEngine.analyze(screenshot, fullUrl);
    // await saveFindings(jobId, findings);

    // 6. Complete
    await updateStatus(jobId, "completed", { screenshotUrl });
    await logStep(jobId, "complete", "Job completed successfully");

    return NextResponse.json({
      success: true,
      screenshotUrl,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    await updateStatus(jobId, "failed", { errorMessage });
    await logStep(jobId, "error", `Job failed: ${errorMessage}`);

    return NextResponse.json({ error: errorMessage }, { status: 500 });

  } finally {
    await closeBrowser();
  }
}
```

---

### 6. Update Job Creation to Trigger Worker

**File:** `apps/web/app/api/jobs/route.ts`

Modify the POST handler to fire-and-forget the worker:

```typescript
// After creating the job, add:

// Fire off the worker (don't await - let it run in background)
const baseUrl = new URL(request.url).origin;
fetch(`${baseUrl}/api/jobs/${job.id}/run`, {
  method: "POST",
}).catch((err) => {
  console.error("Failed to trigger job worker:", err);
});
```

---

### 7. Add Environment Variables

**File:** `.env.local` (add these)

```env
# Already have these:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Add these:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BUGABLE_INTERNAL_SECRET=generate-a-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your Vercel URL in production
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `apps/web/lib/browser.ts` | Create |
| `apps/web/lib/job-logger.ts` | Create |
| `apps/web/app/api/jobs/[jobId]/run/route.ts` | Create |
| `apps/web/app/api/jobs/route.ts` | Modify (add worker trigger) |
| `apps/web/package.json` | Add dependencies |
| `.env.local` | Add new env vars |
| Supabase SQL Editor | Run storage bucket SQL |

---

## Flow After Implementation

```
User clicks "Analyze"
        │
        ▼
POST /api/jobs { siteId, path }
        │
        ├──▶ Create job (status: pending)
        │
        └──▶ Fire POST /api/jobs/{id}/run (fire-and-forget)
                    │
                    ▼
              ┌─────────────────────────────────┐
              │  Vercel Function (60s max)      │
              │                                 │
              │  1. Update status → running     │
              │  2. Launch Chromium             │
              │  3. Navigate to URL             │
              │  4. Take screenshot             │
              │  5. Upload to Supabase Storage  │
              │  6. [TODO: AI analysis]         │
              │  7. Update status → completed   │
              └─────────────────────────────────┘
                    │
                    ▼
        Internal events API updates job in real-time
        Frontend polls and shows live progress
```

---

## Next Steps (After This Implementation)

1. **Plug in qa-engine**: Import the analysis function from `@bugable/qa-engine` in the worker
2. **Add findings**: Use the internal events API to save findings discovered by AI
3. **Frontend polling**: The dashboard already polls - verify it works with real data
