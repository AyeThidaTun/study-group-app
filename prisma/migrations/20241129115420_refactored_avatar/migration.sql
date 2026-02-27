/*
  Warnings:

  - You are about to drop the column `userId` on the `Avatar` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Avatar_userId_key";

-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "userId";
