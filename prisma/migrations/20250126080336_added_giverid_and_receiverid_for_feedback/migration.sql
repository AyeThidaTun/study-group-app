/*
  Warnings:

  - You are about to drop the column `userId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `giverId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- DropIndex
DROP INDEX "Feedback_userId_idx";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "userId",
ADD COLUMN     "giverId" INTEGER NOT NULL,
ADD COLUMN     "receiverId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_giverId_idx" ON "Feedback"("giverId");

-- CreateIndex
CREATE INDEX "Feedback_receiverId_idx" ON "Feedback"("receiverId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
