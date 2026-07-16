-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sponsorship_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "via" TEXT NOT NULL DEFAULT 'DIRECT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("agentId", "contact", "createdAt", "id", "listingId", "message", "name", "status") SELECT "agentId", "contact", "createdAt", "id", "listingId", "message", "name", "status" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "flags" TEXT NOT NULL DEFAULT '[]',
    "moderationNote" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePi" REAL NOT NULL,
    "priceUsd" REAL NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "areaSqm" INTEGER,
    "grossYieldPct" REAL,
    "photoSeed" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featuredUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("agentId", "areaSqm", "bathrooms", "bedrooms", "city", "country", "createdAt", "description", "featuredUntil", "flags", "grossYieldPct", "id", "moderationNote", "photoSeed", "pricePi", "priceUsd", "region", "status", "title", "type", "updatedAt") SELECT "agentId", "areaSqm", "bathrooms", "bedrooms", "city", "country", "createdAt", "description", "featuredUntil", "flags", "grossYieldPct", "id", "moderationNote", "photoSeed", "pricePi", "priceUsd", "region", "status", "title", "type", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
