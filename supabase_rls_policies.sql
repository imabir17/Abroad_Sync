-- SQL script to enable RLS and set up multi-tenant policies (High Performance JWT-first version)

-- 1. Create a helper function to get the current user's companyId (JWT-first, fallback to DB)
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS text AS $$
    DECLARE
        cid text;
    BEGIN
        -- Try to read from JWT app_metadata (O(1) in-memory check)
        cid := (auth.jwt() -> 'app_metadata'::text ->> 'companyId')::text;
        IF cid IS NOT NULL THEN
            RETURN cid;
        END IF;

        -- Fall back to database query if JWT is missing the claim
        SELECT "companyId" INTO cid FROM "User" WHERE id = auth.uid()::text;
        RETURN cid;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a helper function to verify if the current user is a Super Admin (JWT-first, fallback to DB)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
    DECLARE
        u_role text;
    BEGIN
        -- Try to read from JWT app_metadata (O(1) in-memory check)
        u_role := (auth.jwt() -> 'app_metadata'::text ->> 'role')::text;
        IF u_role IS NOT NULL THEN
            RETURN u_role = 'Super Admin';
        END IF;

        -- Fall back to database query
        RETURN EXISTS (
            SELECT 1 FROM "User" 
            WHERE id = auth.uid()::text AND role = 'Super Admin'
        );
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable Row-Level Security on all tables
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Users can view their own company" ON "Company";
DROP POLICY IF EXISTS "Super Admins can update their company info" ON "Company";
DROP POLICY IF EXISTS "Users can view team members in their company" ON "User";
DROP POLICY IF EXISTS "Super Admins can manage team members" ON "User";
DROP POLICY IF EXISTS "Users can manage leads in their company" ON "Lead";
DROP POLICY IF EXISTS "Users can manage interactions in their company" ON "Interaction";
DROP POLICY IF EXISTS "Users can manage tasks in their company" ON "Task";
DROP POLICY IF EXISTS "Users can manage applications in their company" ON "Application";

-- 5. "Company" table policies
CREATE POLICY "Users can view their own company" ON "Company"
    FOR SELECT TO authenticated
    USING (id = get_my_company_id());

CREATE POLICY "Super Admins can update their company info" ON "Company"
    FOR UPDATE TO authenticated
    USING (id = get_my_company_id() AND is_super_admin());

-- 6. "User" table policies
-- Allow reading own profile OR profiles belonging to the same company
CREATE POLICY "Users can view team members in their company" ON "User"
    FOR SELECT TO authenticated
    USING (id = auth.uid()::text OR "companyId" = get_my_company_id());

-- Allow managing team members if the operator is a Super Admin in the same company
CREATE POLICY "Super Admins can manage team members" ON "User"
    FOR ALL TO authenticated
    USING (
        id = auth.uid()::text OR 
        ("companyId" = get_my_company_id() AND is_super_admin())
    );

-- 7. "Lead" table policies
CREATE POLICY "Users can manage leads in their company" ON "Lead"
    FOR ALL TO authenticated
    USING ("companyId" = get_my_company_id());

-- 8. "Interaction" table policies
CREATE POLICY "Users can manage interactions in their company" ON "Interaction"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Interaction"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        )
    );

-- 9. "Task" table policies
CREATE POLICY "Users can manage tasks in their company" ON "Task"
    FOR ALL TO authenticated
    USING (
        "counselorId" = auth.uid()::text OR "counselorId" IN (
            SELECT id FROM "User" WHERE "companyId" = get_my_company_id()
        )
    );

-- 10. "Application" table policies
CREATE POLICY "Users can manage applications in their company" ON "Application"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "Lead"
            WHERE "Lead".id = "Application"."leadId"
              AND "Lead"."companyId" = get_my_company_id()
        )
    );
