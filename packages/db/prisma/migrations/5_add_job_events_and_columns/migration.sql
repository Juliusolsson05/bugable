-- Migration: Add job_events table and additional job columns
-- Aligns database with Prisma schema for event-sourced QA runner

-- 1) Create JobEventType enum
CREATE TYPE "JobEventType" AS ENUM (
  'test_started',
  'turn_started',
  'screenshot_taken',
  'bugs_detected',
  'action_planned',
  'action_executed',
  'turn_completed',
  'test_completed',
  'test_error'
);

-- 2) Add columns to jobs table
ALTER TABLE "jobs"
  ADD COLUMN "max_turns" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "completion_reason" TEXT,
  ADD COLUMN "latest_screenshot_url" TEXT,
  ADD COLUMN "findings_critical" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "findings_high" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "findings_medium" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "findings_low" INTEGER NOT NULL DEFAULT 0;

-- 3) Create job_events table
CREATE TABLE "job_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_id" UUID NOT NULL,
  "type" "JobEventType" NOT NULL,
  "turn" INTEGER NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- test_started fields
  "url" TEXT,
  "max_turns" INTEGER,

  -- screenshot_taken fields
  "screenshot_url" TEXT,
  "screenshot_size" INTEGER,

  -- bugs_detected fields
  "findings" JSONB,
  "total_findings" INTEGER,

  -- action_planned fields
  "action" TEXT,
  "reasoning" TEXT,
  "complete" BOOLEAN,

  -- action_executed fields
  "success" BOOLEAN,
  "error" TEXT,

  -- test_completed fields
  "result" JSONB,

  -- test_error fields
  "partial_result" JSONB,

  CONSTRAINT "job_events_pkey" PRIMARY KEY ("id")
);

-- 4) Add foreign key
ALTER TABLE "job_events"
  ADD CONSTRAINT "job_events_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Create indexes
CREATE INDEX "job_events_job_id_idx" ON "job_events"("job_id");
CREATE INDEX "job_events_type_idx" ON "job_events"("type");
CREATE INDEX "job_events_turn_idx" ON "job_events"("turn");
CREATE INDEX "job_events_timestamp_idx" ON "job_events"("timestamp");

-- 6) Drop unused legacy tables (findings and reasoning_logs were replaced by job_events)
DROP TABLE IF EXISTS "findings";
DROP TABLE IF EXISTS "reasoning_logs";

-- 7) Drop unused legacy enums
DROP TYPE IF EXISTS "FindingSeverity";
DROP TYPE IF EXISTS "FindingCategory";
