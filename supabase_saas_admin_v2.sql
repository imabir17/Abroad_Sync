-- SQL Migration Script for SaaS Admin v2 Features & Billing Enhancements
-- Execute in Supabase SQL Editor

-- 1. Create "SaasAdminAuditLog" table
CREATE TABLE IF NOT EXISTS "SaasAdminAuditLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saasadminauditlog_actor ON "SaasAdminAuditLog"("actorId");
CREATE INDEX IF NOT EXISTS idx_saasadminauditlog_target ON "SaasAdminAuditLog"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_saasadminauditlog_created ON "SaasAdminAuditLog"("createdAt" DESC);

-- 2. Create "TenantNote" table
CREATE TABLE IF NOT EXISTS "TenantNote" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "authorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenantnote_company ON "TenantNote"("companyId");

-- 3. Create "Coupon" table
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "code" TEXT UNIQUE NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'percent', -- 'percent' or 'fixed'
    "discountValue" NUMERIC(10,2) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupon_code ON "Coupon"("code");

-- 4. Create "IssuedDocument" table
CREATE TABLE IF NOT EXISTS "IssuedDocument" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "paymentId" TEXT REFERENCES "Payment"("id") ON DELETE SET NULL,
    "type" TEXT NOT NULL, -- 'invoice' or 'contract'
    "documentNumber" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issueddocument_company ON "IssuedDocument"("companyId");

-- 5. Create "CronLog" table
CREATE TABLE IF NOT EXISTS "CronLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL, -- 'success', 'failed', 'running'
    "processedCount" INTEGER DEFAULT 0,
    "details" JSONB,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cronlog_job ON "CronLog"("jobName", "executedAt" DESC);

-- 6. Add Coupon columns to "Payment" table
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC(10,2) DEFAULT 0;

-- 7. Create "PushSubscription" table for Web Push Notifications
CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "endpoint" TEXT UNIQUE NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pushsub_user ON "PushSubscription"("userId");
CREATE INDEX IF NOT EXISTS idx_pushsub_company ON "PushSubscription"("companyId");

