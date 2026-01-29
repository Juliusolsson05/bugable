-- CreateTable
CREATE TABLE "resolved_findings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "finding_ref" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_by" UUID,

    CONSTRAINT "resolved_findings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resolved_findings_job_id_idx" ON "resolved_findings"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "resolved_findings_job_id_finding_ref_key" ON "resolved_findings"("job_id", "finding_ref");

-- AddForeignKey
ALTER TABLE "resolved_findings" ADD CONSTRAINT "resolved_findings_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
