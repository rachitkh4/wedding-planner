-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "WeddingMeta" ADD COLUMN     "hashtag" TEXT,
ADD COLUMN     "invitationText" TEXT,
ADD COLUMN     "invitationTextHi" TEXT;

-- CreateTable
CREATE TABLE "SiteImage" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryChapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleHi" TEXT,
    "body" TEXT NOT NULL,
    "bodyHi" TEXT,
    "imageId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoryChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "name" TEXT NOT NULL,
    "nameHi" TEXT,
    "relation" TEXT NOT NULL,
    "relationHi" TEXT,
    "imageId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blessing" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "authorName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blessing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Blessing_createdAt_idx" ON "Blessing"("createdAt");

-- AddForeignKey
ALTER TABLE "Blessing" ADD CONSTRAINT "Blessing_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GuestAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

