/*
  Warnings:

  - You are about to drop the column `module` on the `Question` table. All the data in the column will be lost.
  - Added the required column `modCode` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SOLVED');

-- CreateEnum
CREATE TYPE "AnswerStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionID_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_answerID_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_questionID_fkey";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "status" "AnswerStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "module",
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "modCode" TEXT NOT NULL,
ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SavedQuestion" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "questionID" INTEGER,
    "answerID" INTEGER,

    CONSTRAINT "SavedQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_modCode_fkey" FOREIGN KEY ("modCode") REFERENCES "Module"("modCode") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_answerID_fkey" FOREIGN KEY ("answerID") REFERENCES "Answer"("answerID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_answerID_fkey" FOREIGN KEY ("answerID") REFERENCES "Answer"("answerID") ON DELETE CASCADE ON UPDATE NO ACTION;
