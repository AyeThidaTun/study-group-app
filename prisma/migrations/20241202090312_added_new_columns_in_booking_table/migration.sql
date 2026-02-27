/*
  Warnings:

  - Added the required column `timeout` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_roomId_slotId_bookingDate_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "timeout" TIMESTAMP(3) NOT NULL;
