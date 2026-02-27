-- CreateEnum
CREATE TYPE "FeedbackState" AS ENUM ('UNACTIVATED', 'PENDING', 'COMPLETED', 'EXPIRED', 'DISCLOSED');

-- CreateTable
CREATE TABLE "Feedback" (
    "feedbackId" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "comments" TEXT,
    "rating" INTEGER,
    "state" "FeedbackState" NOT NULL DEFAULT 'UNACTIVATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedbackId")
);

-- CreateIndex
CREATE INDEX "Feedback_bookingId_idx" ON "Feedback"("bookingId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
