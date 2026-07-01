-- Performance Indexes for Abroad Sync database tables

-- Indexes for Lead table
CREATE INDEX IF NOT EXISTS "idx_Lead_companyId" ON "Lead" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_Lead_assignedCounselorId" ON "Lead" ("assignedCounselorId");

-- Indexes for User table
CREATE INDEX IF NOT EXISTS "idx_User_companyId" ON "User" ("companyId");

-- Indexes for Task table
CREATE INDEX IF NOT EXISTS "idx_Task_counselorId" ON "Task" ("counselorId");
CREATE INDEX IF NOT EXISTS "idx_Task_leadId" ON "Task" ("leadId");

-- Indexes for Interaction table
CREATE INDEX IF NOT EXISTS "idx_Interaction_leadId" ON "Interaction" ("leadId");

-- Indexes for Application table
CREATE INDEX IF NOT EXISTS "idx_Application_leadId" ON "Application" ("leadId");
