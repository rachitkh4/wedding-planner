-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COUPLE', 'FAMILY');

-- AlterTable
ALTER TABLE "InviteToken" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'FAMILY';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'FAMILY';
