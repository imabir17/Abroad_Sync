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
