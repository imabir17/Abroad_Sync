-- SQL script to enable RLS and set up multi-tenant policies (High Performance JWT-first version)

-- 1. Create a helper function to get the current user's companyId (JWT-first, fallback to DB)
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS text AS $$
    DECLARE
        cid text;
    BEGIN
        -- Check database query to ensure user exists and status is Active
        SELECT "companyId" INTO cid FROM "User" WHERE id = auth.uid()::text AND status = 'Active';
        IF cid IS NOT NULL THEN
            RETURN cid;
        END IF;

        -- Fall back to JWT app_metadata claim if DB returns null
        RETURN (auth.jwt() -> 'app_metadata'::text ->> 'companyId')::text;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a helper function to verify if the current user is a Super Admin (JWT-first, fallback to DB)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM "User" 
            WHERE id = auth.uid()::text AND role = 'Super Admin' AND status = 'Active'
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
ALTER TABLE "Country" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Users can view their own company" ON "Company";
DROP POLICY IF EXISTS "Super Admins can update their company info" ON "Company";
DROP POLICY IF EXISTS "Users can view team members in their company" ON "User";
DROP POLICY IF EXISTS "Super Admins can manage team members" ON "User";
DROP POLICY IF EXISTS "Users can manage leads in their company" ON "Lead";
DROP POLICY IF EXISTS "Users can manage interactions in their company" ON "Interaction";
DROP POLICY IF EXISTS "Users can manage tasks in their company" ON "Task";
DROP POLICY IF EXISTS "Users can manage applications in their company" ON "Application";
DROP POLICY IF EXISTS "Users can view countries in their company" ON "Country";
DROP POLICY IF EXISTS "Admins can manage countries in their company" ON "Country";
DROP POLICY IF EXISTS "Super Admins and Managers can manage invites" ON "Invite";
DROP POLICY IF EXISTS "Company members can read activity log" ON "ActivityLog";

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
        "companyId" = get_my_company_id() AND is_super_admin()
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

-- 11. "Country" table policies
CREATE POLICY "Users can view countries in their company" ON "Country"
    FOR SELECT TO authenticated
    USING ("companyId" = get_my_company_id());

CREATE POLICY "Admins can manage countries in their company" ON "Country"
    FOR ALL TO authenticated
    USING (
        "companyId" = get_my_company_id() AND (is_super_admin() OR (SELECT role FROM "User" WHERE id = auth.uid()::text AND status = 'Active') = 'Manager')
    );

-- 12. "Invite" table policies (Super Admin & Manager)
CREATE POLICY "Super Admins and Managers can manage invites" ON "Invite"
    FOR ALL TO authenticated
    USING (
        "companyId" = get_my_company_id()
        AND (is_super_admin() OR EXISTS (
            SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'Manager' AND status = 'Active'
        ))
    );

-- 13. "ActivityLog" table policies
CREATE POLICY "Company members can read activity log" ON "ActivityLog"
    FOR SELECT TO authenticated
    USING ("companyId" = get_my_company_id());

-- 14. Enable RLS on Billing & Subscription tables
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Branch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentMethodConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Clean up existing billing policies
DROP POLICY IF EXISTS "Anyone authenticated can read active plans" ON "Plan";
DROP POLICY IF EXISTS "Company members read their branches" ON "Branch";
DROP POLICY IF EXISTS "Company members read their subscription" ON "Subscription";
DROP POLICY IF EXISTS "Anyone authenticated can read active payment methods" ON "PaymentMethodConfig";
DROP POLICY IF EXISTS "Company members submit payments" ON "Payment";
DROP POLICY IF EXISTS "Company members read their own payments" ON "Payment";

-- Policies for Billing tables
CREATE POLICY "Anyone authenticated can read active plans" ON "Plan"
    FOR SELECT TO authenticated USING ("isActive" = true AND "isPublic" = true);

CREATE POLICY "Company members read their branches" ON "Branch"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

CREATE POLICY "Company members read their subscription" ON "Subscription"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

CREATE POLICY "Anyone authenticated can read active payment methods" ON "PaymentMethodConfig"
    FOR SELECT TO authenticated USING ("isActive" = true);

CREATE POLICY "Company members submit payments" ON "Payment"
    FOR INSERT TO authenticated WITH CHECK ("companyId" = get_my_company_id());

CREATE POLICY "Company members read their own payments" ON "Payment"
    FOR SELECT TO authenticated USING ("companyId" = get_my_company_id());

-- Helper function: Check if current company subscription is writable (not suspended)
CREATE OR REPLACE FUNCTION is_company_writable()
RETURNS boolean AS $$
DECLARE
    v_status text;
BEGIN
    SELECT status INTO v_status FROM "Subscription" WHERE "companyId" = get_my_company_id();
    RETURN v_status IS NULL OR v_status IN ('active', 'grace');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: Enforce Monthly Lead Quotas based on Plan / Override Limits
CREATE OR REPLACE FUNCTION check_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER;
    v_count INTEGER;
BEGIN
    SELECT COALESCE(s."overrideLeadLimit", p."leadLimitPerMonth")
    INTO v_limit
    FROM "Subscription" s JOIN "Plan" p ON p.id = s."planId"
    WHERE s."companyId" = NEW."companyId" AND s.status IN ('active', 'grace');

    IF v_limit IS NULL OR v_limit = -1 THEN
        RETURN NEW; -- unlimited
    END IF;

    SELECT count(*) INTO v_count FROM "Lead"
    WHERE "companyId" = NEW."companyId"
      AND "createdAt" >= date_trunc('month', timezone('utc'::text, now()));

    IF v_count >= v_limit THEN
        RAISE EXCEPTION 'Monthly lead limit reached for this plan. Upgrade to add more leads.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_lead_limit ON "Lead";
CREATE TRIGGER enforce_lead_limit
    BEFORE INSERT ON "Lead"
    FOR EACH ROW
    EXECUTE FUNCTION check_lead_limit();

-- 15. Enable RLS on LeadForm table
ALTER TABLE "LeadForm" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active lead forms" ON "LeadForm";
DROP POLICY IF EXISTS "Company members manage lead forms" ON "LeadForm";

CREATE POLICY "Anyone can view active lead forms" ON "LeadForm"
    FOR SELECT TO anon, authenticated USING ("isActive" = true);

CREATE POLICY "Company members manage lead forms" ON "LeadForm"
    FOR ALL TO authenticated USING ("companyId" = get_my_company_id());



