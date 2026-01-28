-- ============================================
-- RLS POLICIES FOR MAIN APPLICATION TABLES
-- Users can only access their own data
-- ============================================

-- ===================
-- PROFILES
-- ===================
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON "profiles"
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON "profiles"
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ===================
-- SITES
-- ===================
ALTER TABLE "sites" ENABLE ROW LEVEL SECURITY;

-- Users can read their own sites
CREATE POLICY "sites_select_own" ON "sites"
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create sites for themselves
CREATE POLICY "sites_insert_own" ON "sites"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "sites_update_own" ON "sites"
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sites
CREATE POLICY "sites_delete_own" ON "sites"
    FOR DELETE
    USING (auth.uid() = user_id);

-- ===================
-- PAGES
-- ===================
ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;

-- Users can read pages of their sites
CREATE POLICY "pages_select_own" ON "pages"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = pages.site_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can create pages for their sites
CREATE POLICY "pages_insert_own" ON "pages"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = site_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can update pages of their sites
CREATE POLICY "pages_update_own" ON "pages"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = pages.site_id
            AND sites.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = site_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can delete pages of their sites
CREATE POLICY "pages_delete_own" ON "pages"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sites
            WHERE sites.id = pages.site_id
            AND sites.user_id = auth.uid()
        )
    );

-- ===================
-- JOBS
-- ===================
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;

-- Users can read jobs of their pages
CREATE POLICY "jobs_select_own" ON "jobs"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN sites ON sites.id = pages.site_id
            WHERE pages.id = jobs.page_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can create jobs for their pages
CREATE POLICY "jobs_insert_own" ON "jobs"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages
            JOIN sites ON sites.id = pages.site_id
            WHERE pages.id = page_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can update jobs of their pages
CREATE POLICY "jobs_update_own" ON "jobs"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN sites ON sites.id = pages.site_id
            WHERE pages.id = jobs.page_id
            AND sites.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages
            JOIN sites ON sites.id = pages.site_id
            WHERE pages.id = page_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can delete jobs of their pages
CREATE POLICY "jobs_delete_own" ON "jobs"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN sites ON sites.id = pages.site_id
            WHERE pages.id = jobs.page_id
            AND sites.user_id = auth.uid()
        )
    );

-- ===================
-- FINDINGS
-- ===================
ALTER TABLE "findings" ENABLE ROW LEVEL SECURITY;

-- Users can read findings of their jobs
CREATE POLICY "findings_select_own" ON "findings"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = findings.job_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can create findings for their jobs
CREATE POLICY "findings_insert_own" ON "findings"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = job_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can delete findings of their jobs
CREATE POLICY "findings_delete_own" ON "findings"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = findings.job_id
            AND sites.user_id = auth.uid()
        )
    );

-- ===================
-- REASONING LOGS
-- ===================
ALTER TABLE "reasoning_logs" ENABLE ROW LEVEL SECURITY;

-- Users can read reasoning logs of their jobs
CREATE POLICY "reasoning_logs_select_own" ON "reasoning_logs"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = reasoning_logs.job_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can create reasoning logs for their jobs
CREATE POLICY "reasoning_logs_insert_own" ON "reasoning_logs"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = job_id
            AND sites.user_id = auth.uid()
        )
    );

-- Users can delete reasoning logs of their jobs
CREATE POLICY "reasoning_logs_delete_own" ON "reasoning_logs"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN pages ON pages.id = jobs.page_id
            JOIN sites ON sites.id = pages.site_id
            WHERE jobs.id = reasoning_logs.job_id
            AND sites.user_id = auth.uid()
        )
    );
