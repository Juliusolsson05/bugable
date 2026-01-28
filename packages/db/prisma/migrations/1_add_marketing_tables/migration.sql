-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'landing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE INDEX "waitlist_created_at_idx" ON "waitlist"("created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at" DESC);

-- Enable RLS
ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT (for landing page API routes)
CREATE POLICY "waitlist_insert_public" ON "waitlist"
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "contact_messages_insert_public" ON "contact_messages"
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only authenticated users can SELECT (for dashboard)
CREATE POLICY "waitlist_select_authenticated" ON "waitlist"
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "contact_messages_select_authenticated" ON "contact_messages"
    FOR SELECT
    USING (auth.role() = 'authenticated');
