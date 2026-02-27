/*
  Warnings:

  - A unique constraint covering the columns `[roomId,slotId,bookingDate]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingDate" TIMESTAMP(3),
ADD COLUMN     "slotId" INTEGER;

-- AlterTable
ALTER TABLE "StudyRoom" ADD COLUMN     "capacity" INTEGER;

-- CreateTable
CREATE TABLE "RoomSlot" (
    "slotId" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "RoomSlot_pkey" PRIMARY KEY ("slotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomSlot_startTime_endTime_key" ON "RoomSlot"("startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_roomId_slotId_bookingDate_key" ON "Booking"("roomId", "slotId", "bookingDate");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "RoomSlot"("slotId") ON DELETE CASCADE ON UPDATE CASCADE;
