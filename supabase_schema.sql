-- SQL migration script to set up schema in Supabase (idempotent/re-runnable version)

-- 1. Create triggers for automatically updating "updatedAt"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create "Company" table
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

DROP TRIGGER IF EXISTS update_company_updated_at ON "Company";
CREATE TRIGGER update_company_updated_at
    BEFORE UPDATE ON "Company"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Create "User" table (linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY, -- Will hold the Supabase auth.users ID
    "email" TEXT UNIQUE NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Counselor',
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrations for existing User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';

DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Create "Lead" table
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "lastStudyLevel" TEXT,
    "preferredStudyLevel" TEXT,
    "preferredCountry" TEXT,
    "preferredCourse" TEXT,
    "preferredIntake" TEXT,
    
    -- English Proficiency
    "englishTestStatus" TEXT,
    "englishTestType" TEXT,
    "englishTestScore" TEXT,
    
    -- Academic Details
    "sscGroup" TEXT,
    "sscYear" TEXT,
    "sscResult" TEXT,
    "hscGroup" TEXT,
    "hscYear" TEXT,
    "hscResult" TEXT,
    "bachelorsMajor" TEXT,
    "bachelorsYear" TEXT,
    "bachelorsCgpa" TEXT,
    "mastersMajor" TEXT,
    "mastersYear" TEXT,
    "mastersCgpa" TEXT,
    
    "workExperience" TEXT,
    "source" TEXT,
    "eventTag" TEXT,
    "budget" TEXT,
    "initialNote" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'New',
    "rating" TEXT DEFAULT 'Unrated',
    "isFileOpened" BOOLEAN NOT NULL DEFAULT false,
    "fileOpenedAt" TIMESTAMP WITH TIME ZONE,
    "contactedAt" TIMESTAMP WITH TIME ZONE,
    "assignedAt" TIMESTAMP WITH TIME ZONE,
    
    "assignedCounselorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration statement for Lead table
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "eventTag" TEXT;

DROP TRIGGER IF EXISTS update_lead_updated_at ON "Lead";
CREATE TRIGGER update_lead_updated_at
    BEFORE UPDATE ON "Lead"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create "Interaction" table
CREATE TABLE IF NOT EXISTS "Interaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "counselorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_interaction_updated_at ON "Interaction";
CREATE TRIGGER update_interaction_updated_at
    BEFORE UPDATE ON "Interaction"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Create "Task" table
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT REFERENCES "Lead"("id") ON DELETE CASCADE,
    "counselorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_task_updated_at ON "Task";
CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON "Task"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create "Application" table
CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "country" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_application_updated_at ON "Application";
CREATE TRIGGER update_application_updated_at
    BEFORE UPDATE ON "Application"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Create "Country" table
CREATE TABLE IF NOT EXISTS "Country" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "continent" TEXT,
    "capitals" TEXT,
    "majorCities" TEXT,
    "countryCode" TEXT,
    "currency" TEXT,
    "academicRequirement" TEXT,
    "studyGapAcceptance" TEXT,
    "ieltsRequirement" TEXT,
    "pteRequirement" TEXT,
    "toeflRequirement" TEXT,
    "duolingoRequirement" TEXT,
    "intakes" TEXT,
    "applicationFee" TEXT,
    "tuitionFees" TEXT,
    "tuitionType" TEXT,
    "scholarship" TEXT,
    "courseDurationUg" TEXT,
    "courseDurationPg" TEXT,
    "sponsorBankStatement" TEXT,
    "policeClearance" TEXT,
    "insurance" TEXT,
    "medical" TEXT,
    "embassyFees" TEXT,
    "biometricFee" TEXT,
    "visaInterview" TEXT,
    "embassyFace" TEXT,
    "residencePermit" TEXT,
    "livingCost" TEXT,
    "workPermit" TEXT,
    "jobOpportunity" TEXT,
    "spouseAndKids" TEXT,
    "accommodation" TEXT,
    "processingDuration" TEXT,
    "serviceCharge" TEXT,
    "totalCost" TEXT,
    "steps" JSONB DEFAULT '[]'::jsonb,
    "visaChecklist" JSONB DEFAULT '[]'::jsonb,
    "keySellingPoints" JSONB DEFAULT '[]'::jsonb,
    "universityChecklist" JSONB DEFAULT '[]'::jsonb,
    "universities" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_country_updated_at ON "Country";
CREATE TRIGGER update_country_updated_at
    BEFORE UPDATE ON "Country"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 9. Create "Invite" table
CREATE TABLE IF NOT EXISTS "Invite" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Counselor', -- 'Manager' or 'Counselor'. Never 'Super Admin' via invite.
    "token" TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    "invitedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending', -- Pending, Accepted, Revoked
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_invite_updated_at ON "Invite";
CREATE TRIGGER update_invite_updated_at
    BEFORE UPDATE ON "Invite"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create "ActivityLog" table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL, -- 'company.created', 'user.invited', 'invite.accepted', 'user.role_changed', 'user.deactivated'
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create "Plan" table
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "priceUsd" NUMERIC(10,2) NOT NULL,
    "setupFeeUsd" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "userLimit" INTEGER,
    "leadLimitPerMonth" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_plan_updated_at ON "Plan";
CREATE TRIGGER update_plan_updated_at
    BEFORE UPDATE ON "Plan"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed default plans
INSERT INTO "Plan" ("name", "billingCycle", "priceUsd", "setupFeeUsd", "userLimit", "leadLimitPerMonth", "isPublic")
VALUES
  ('Free',          'free',    0,   0,  2,   100,  true),
  ('Basic Monthly', 'monthly', 35,  20, 20,  NULL, true),
  ('Pro Monthly',   'monthly', 70,  20, 100, NULL, true),
  ('Basic Yearly',  'yearly',  399, 0,  20,  NULL, true),
  ('Pro Yearly',    'yearly',  799, 0,  100, NULL, true),
  ('Custom',        'custom',  0,   0,  NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- 12. Create "Branch" table
CREATE TABLE IF NOT EXISTS "Branch" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL DEFAULT 'Main Branch',
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Create "Subscription" table
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "branchId" TEXT NOT NULL REFERENCES "Branch"("id") ON DELETE CASCADE,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "planId" TEXT NOT NULL REFERENCES "Plan"("id"),
    "status" TEXT NOT NULL DEFAULT 'active',
    "overrideUserLimit" INTEGER,
    "overrideLeadLimit" INTEGER,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
    "graceEndsAt" TIMESTAMP WITH TIME ZONE,
    "setupFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_subscription_updated_at ON "Subscription";
CREATE TRIGGER update_subscription_updated_at
    BEFORE UPDATE ON "Subscription"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Create "PaymentMethodConfig" table
CREATE TABLE IF NOT EXISTS "PaymentMethodConfig" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "method" TEXT NOT NULL UNIQUE,
    "number" TEXT NOT NULL,
    "accountType" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- Seed default receiving payment numbers
INSERT INTO "PaymentMethodConfig" ("method", "number", "accountType", "instructions")
VALUES
  ('bKash',  '+8801700000000', 'Merchant', 'Send Money or Payment to this Merchant number. Use your Company Name as reference.'),
  ('Nagad',  '+8801700000000', 'Personal', 'Send Money to this personal Nagad number.'),
  ('Rocket', '+8801700000000', 'Personal', 'Send Money to this personal Rocket number.')
ON CONFLICT DO NOTHING;

-- 15. Create "Payment" table
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscriptionId" TEXT NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "planId" TEXT NOT NULL REFERENCES "Plan"("id"),
    "amountUsd" NUMERIC(10,2) NOT NULL,
    "includesSetupFee" BOOLEAN NOT NULL DEFAULT false,
    "method" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "submittedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Create "SubscriptionNotification" table
CREATE TABLE IF NOT EXISTS "SubscriptionNotification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscriptionId" TEXT NOT NULL REFERENCES "Subscription"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Create "LeadForm" table (Custom Public Lead Forms & QR Event Tracking)
CREATE TABLE IF NOT EXISTS "LeadForm" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventTag" TEXT,
    "fieldsConfig" JSONB DEFAULT '{}'::jsonb,
    "assignedCounselorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "submissionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS update_leadform_updated_at ON "LeadForm";
CREATE TRIGGER update_leadform_updated_at
    BEFORE UPDATE ON "LeadForm"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 18. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_company ON "User"("companyId");
CREATE INDEX IF NOT EXISTS idx_lead_company ON "Lead"("companyId");
CREATE INDEX IF NOT EXISTS idx_lead_assigned ON "Lead"("assignedCounselorId");
CREATE INDEX IF NOT EXISTS idx_lead_eventtag ON "Lead"("companyId", "eventTag");
CREATE INDEX IF NOT EXISTS idx_interaction_lead ON "Interaction"("leadId");
CREATE INDEX IF NOT EXISTS idx_task_counselor ON "Task"("counselorId");
CREATE INDEX IF NOT EXISTS idx_task_lead ON "Task"("leadId");
CREATE INDEX IF NOT EXISTS idx_application_lead ON "Application"("leadId");
CREATE INDEX IF NOT EXISTS idx_country_company ON "Country"("companyId");
CREATE INDEX IF NOT EXISTS idx_invite_company ON "Invite"("companyId");
CREATE INDEX IF NOT EXISTS idx_invite_token ON "Invite"("token");
CREATE INDEX IF NOT EXISTS idx_activitylog_company ON "ActivityLog"("companyId");
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_branch ON "Subscription"("branchId");
CREATE INDEX IF NOT EXISTS idx_subscription_company ON "Subscription"("companyId");
CREATE INDEX IF NOT EXISTS idx_subscription_status_period ON "Subscription"("status", "currentPeriodEnd");
CREATE INDEX IF NOT EXISTS idx_payment_subscription ON "Payment"("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"("status");
CREATE INDEX IF NOT EXISTS idx_leadform_company ON "LeadForm"("companyId");

