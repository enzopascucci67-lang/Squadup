-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "game" TEXT,
    "rank" TEXT,
    "lastGame" TEXT,
    "lastRank" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
