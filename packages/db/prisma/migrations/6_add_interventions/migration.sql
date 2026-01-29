-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('text_input', 'yes_no_other');

-- CreateEnum
CREATE TYPE "InterventionStatus" AS ENUM ('pending', 'responded', 'skipped');

-- CreateTable
CREATE TABLE "interventions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "finding_ref" TEXT NOT NULL,
    "type" "InterventionType" NOT NULL,
    "status" "InterventionStatus" NOT NULL DEFAULT 'pending',
    "prompt" TEXT NOT NULL,
    "placeholder" TEXT,
    "yes_label" TEXT,
    "no_label" TEXT,
    "other_label" TEXT,
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "interventions_job_id_finding_ref_key" ON "interventions"("job_id", "finding_ref");
CREATE INDEX "interventions_job_id_idx" ON "interventions"("job_id");
CREATE INDEX "interventions_status_idx" ON "interventions"("status");

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
