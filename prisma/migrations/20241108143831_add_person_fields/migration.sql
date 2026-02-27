-- AlterTable
ALTER TABLE "User" ADD COLUMN     "academicLevel" TEXT,
ADD COLUMN     "adminNumber" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "subjectInterests" TEXT;
