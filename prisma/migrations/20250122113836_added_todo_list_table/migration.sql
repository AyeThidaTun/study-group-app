/*
  Warnings:

  - You are about to drop the `RecurringTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('PENDING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecurringTasks" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterEnum
ALTER TYPE "Mood" ADD VALUE 'NEUTRAL';

-- DropForeignKey
ALTER TABLE "RecurringTask" DROP CONSTRAINT "RecurringTask_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_userId_fkey";

-- DropTable
DROP TABLE "RecurringTask";

-- DropTable
DROP TABLE "Tasks";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" "PriorityLevel" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "status" "TodoStatus" NOT NULL DEFAULT 'PENDING',
    "mood" "Mood",
    "recurring" "RecurringTasks" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
