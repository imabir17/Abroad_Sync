-- SQL migration script to set up PipelineStage table in Supabase
-- Please run this SQL script in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS "PipelineStage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("companyId", "name")
);

-- Index for ordering stages
CREATE INDEX IF NOT EXISTS idx_pipelinestage_company ON "PipelineStage"("companyId");

-- Enable Row-Level Security on PipelineStage
ALTER TABLE "PipelineStage" ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Users can view stages in their company" ON "PipelineStage";
DROP POLICY IF EXISTS "Admins and Managers can manage stages" ON "PipelineStage";

-- SELECT: Allow all authenticated users in the company to view stages
CREATE POLICY "Users can view stages in their company" ON "PipelineStage"
    FOR SELECT TO authenticated
    USING ("companyId" = get_my_company_id());

-- ALL: Allow Admins and Managers to manage stages in their company
CREATE POLICY "Admins and Managers can manage stages" ON "PipelineStage"
    FOR ALL TO authenticated
    USING (
        "companyId" = get_my_company_id() AND 
        (
            (auth.jwt() -> 'app_metadata'::text ->> 'role')::text = 'Super Admin' OR 
            (auth.jwt() -> 'app_metadata'::text ->> 'role')::text = 'Manager' OR
            EXISTS (
                SELECT 1 FROM "User" 
                WHERE "User".id = auth.uid()::text AND ("User".role = 'Super Admin' OR "User".role = 'Manager')
            )
        )
    );
