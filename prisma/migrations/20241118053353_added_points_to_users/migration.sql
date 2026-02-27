/*
  Warnings:

  - You are about to drop the `answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `ResourceTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "answer" DROP CONSTRAINT "answer_questionID_fkey";

-- DropForeignKey
ALTER TABLE "answer" DROP CONSTRAINT "answer_userID_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_userID_fkey";

-- AlterTable
ALTER TABLE "ResourceTag" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "answer";

-- DropTable
DROP TABLE "question";

-- AddForeignKey
ALTER TABLE "ResourceTag" ADD CONSTRAINT "ResourceTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
