-- CreateEnum
CREATE TYPE "TravelDirection" AS ENUM ('ARRIVAL', 'DEPARTURE');

-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('TRAIN', 'FLIGHT', 'BUS', 'CAR', 'OTHER');

-- AlterTable
ALTER TABLE "GuestAccount" ADD COLUMN     "attending" BOOLEAN,
ADD COLUMN     "partySize" INTEGER,
ADD COLUMN     "rsvpAt" TIMESTAMP(3),
ADD COLUMN     "stayNote" TEXT,
ADD COLUMN     "stayPlace" TEXT,
ADD COLUMN     "stayRoom" TEXT;

-- CreateTable
CREATE TABLE "GuestMember" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuestMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelLeg" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" "TravelDirection" NOT NULL,
    "mode" "TravelMode" NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "place" TEXT,
    "number" TEXT,
    "pnr" TEXT,
    "paxCount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelLeg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelLeg_accountId_direction_key" ON "TravelLeg"("accountId", "direction");

-- AddForeignKey
ALTER TABLE "GuestMember" ADD CONSTRAINT "GuestMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GuestAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelLeg" ADD CONSTRAINT "TravelLeg_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "GuestAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

