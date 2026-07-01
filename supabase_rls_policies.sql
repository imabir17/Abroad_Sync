-- SQL script to enable RLS and set up multi-tenant policies (idempotent version with explicit type casting)

-- 1. Enable Row-Level Security on all tables
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to make it safe to re-run
DROP POLICY IF EXISTS "Users can view their own company" ON "Company";
DROP POLICY IF EXISTS "Super Admins can update their company info" ON "Company";
DROP POLICY IF EXISTS "Users can view team members in their company" ON "User";
DROP POLICY IF EXISTS "Super Admins can manage team members" ON "User";
DROP POLICY IF EXISTS "Users can manage leads in their company" ON "Lead";
DROP POLICY IF EXISTS "Users can manage interactions in their company" ON "Interaction";
DROP POLICY IF EXISTS "Users can manage tasks in their company" ON "Task";
DROP POLICY IF EXISTS "Users can manage applications in their company" ON "Application";

-- 3. "Company" table policies (casts auth.uid() to text since User.id is TEXT)
CREATE POLICY "Users can view their own company" ON "Company"
    FOR SELECT TO authenticated
    USING (id = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Super Admins can update their company info" ON "Company"
    FOR UPDATE TO authenticated
    USING (id = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text AND role = 'Super Admin'));

-- 4. "User" table policies
CREATE POLICY "Users can view team members in their company" ON "User"
    FOR SELECT TO authenticated
    USING ("companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text));

CREATE POLICY "Super Admins can manage team members" ON "User"
    FOR ALL TO authenticated
    USING ("companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text AND role = 'Super Admin'));

-- 5. "Lead" table policies
CREATE POLICY "Users can manage leads in their company" ON "Lead"
    FOR ALL TO authenticated
    USING ("companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text));

-- 6. "Interaction" table policies
CREATE POLICY "Users can manage interactions in their company" ON "Interaction"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Interaction"."leadId"
              AND "Lead"."companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text)
        )
    );

-- 7. "Task" table policies
CREATE POLICY "Users can manage tasks in their company" ON "Task"
    FOR ALL TO authenticated
    USING (
        "counselorId" IN (
            SELECT id FROM "User" 
            WHERE "companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text)
        )
    );

-- 8. "Application" table policies
CREATE POLICY "Users can manage applications in their company" ON "Application"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Application"."leadId"
              AND "Lead"."companyId" = (SELECT "companyId" FROM "User" WHERE id = auth.uid()::text)
        )
    );
