/*
  Warnings:

  - The primary key for the `TaskAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `TaskAssignment` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId", "userId");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT,
    "bio" TEXT,
    "academicLevel" TEXT,
    "skills" TEXT,
    "subjectInterests" TEXT,
    "adminNumber" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
