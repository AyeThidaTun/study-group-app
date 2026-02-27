/*
  Warnings:

  - Made the column `isGlobal` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "isGlobal" SET NOT NULL;
