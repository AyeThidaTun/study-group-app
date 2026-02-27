/*
  Warnings:

  - You are about to drop the column `answer` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `option1` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `option2` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `option3` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `option4` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `semester` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "answer",
DROP COLUMN "option1",
DROP COLUMN "option2",
DROP COLUMN "option3",
DROP COLUMN "option4",
DROP COLUMN "question",
DROP COLUMN "school",
ADD COLUMN     "semester" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL;

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "QuizItem" (
    "itemId" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "QuizItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "attemptId" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "score" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "progress" JSONB,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("attemptId")
);

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "modCode" TEXT NOT NULL,
    "modName" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("modCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_itemId_key" ON "QuizQuestion"("quizId", "itemId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_modCode_fkey" FOREIGN KEY ("modCode") REFERENCES "Module"("modCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("quizId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "QuizItem"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("quizId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
