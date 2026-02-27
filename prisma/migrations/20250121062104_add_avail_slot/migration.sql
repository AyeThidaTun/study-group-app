/*
  Warnings:

  - You are about to drop the column `availability` on the `TutorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "availability";

-- CreateTable
CREATE TABLE "TutorBooking" (
    "id" SERIAL NOT NULL,
    "tuteeId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Booked',

    CONSTRAINT "TutorBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TutorBooking" ADD CONSTRAINT "TutorBooking_tuteeId_fkey" FOREIGN KEY ("tuteeId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorBooking" ADD CONSTRAINT "TutorBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("tutorId") ON DELETE RESTRICT ON UPDATE CASCADE;
