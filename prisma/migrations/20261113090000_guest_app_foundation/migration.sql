-- AlterTable
ALTER TABLE "EventItem" ADD COLUMN     "description" TEXT,
ADD COLUMN     "dressCode" TEXT,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "nameHi" TEXT,
ADD COLUMN     "showToGuests" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TEXT;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "GuestAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "guestId" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpContact" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HelpContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestAccount_phone_key" ON "GuestAccount"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_phone_key" ON "Guest"("phone");

-- AddForeignKey
ALTER TABLE "GuestAccount" ADD CONSTRAINT "GuestAccount_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

