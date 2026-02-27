/*
  Warnings:

  - A unique constraint covering the columns `[bookingId,giverId,receiverId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_bookingId_giverId_receiverId_key" ON "Feedback"("bookingId", "giverId", "receiverId");
