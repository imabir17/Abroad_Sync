ALTER TABLE "Country"
ADD COLUMN "continent" TEXT,
ADD COLUMN "capitals" TEXT,
ADD COLUMN "majorCities" TEXT,
ADD COLUMN "countryCode" TEXT,
ADD COLUMN "currency" TEXT,
ADD COLUMN "ieltsRequirement" TEXT,
ADD COLUMN "pteRequirement" TEXT,
ADD COLUMN "toeflRequirement" TEXT,
ADD COLUMN "duolingoRequirement" TEXT,
ADD COLUMN "keySellingPoints" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN "universityChecklist" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN "universities" JSONB DEFAULT '[]'::jsonb;
