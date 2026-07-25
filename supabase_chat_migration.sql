-- Migration: SecureChat Internal Employee Chat Tables

-- 1. Create "ChatChannel" table for group/team channels
CREATE TABLE IF NOT EXISTS "ChatChannel" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create "ChatChannelMember" table for channel memberships
CREATE TABLE IF NOT EXISTS "ChatChannelMember" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "channelId" TEXT NOT NULL REFERENCES "ChatChannel"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("channelId", "userId")
);

-- 3. Create "ChatMessage" table for 1-on-1 and channel chat messages
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "receiverId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "channelId" TEXT REFERENCES "ChatChannel"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_chatmessage_company ON "ChatMessage"("companyId");
CREATE INDEX IF NOT EXISTS idx_chatmessage_direct ON "ChatMessage"("senderId", "receiverId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_chatmessage_channel ON "ChatMessage"("channelId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_chatchannel_company ON "ChatChannel"("companyId");

-- 4. Add "lastSeenAt" column to "User" table for WhatsApp-style presence
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

