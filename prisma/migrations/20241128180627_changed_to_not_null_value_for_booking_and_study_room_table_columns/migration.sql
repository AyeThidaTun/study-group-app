/*
  Warnings:

  - Made the column `bookingDate` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slotId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacity` on table `StudyRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "bookingDate" SET NOT NULL,
ALTER COLUMN "slotId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudyRoom" ALTER COLUMN "capacity" SET NOT NULL;
