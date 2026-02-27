/*
  Warnings:

  - You are about to drop the `FlashcardProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FlashcardProgress" DROP CONSTRAINT "FlashcardProgress_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "FlashcardProgress" DROP CONSTRAINT "FlashcardProgress_userId_fkey";

-- DropTable
DROP TABLE "FlashcardProgress";
