/*
  Warnings:

  - The primary key for the `TaskAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `TaskAssignment` table. All the data in the column will be lost.
  - Added the required column `personId` to the `TaskAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_pkey",
DROP COLUMN "userId",
ADD COLUMN     "personId" INTEGER NOT NULL,
ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId", "personId");

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
