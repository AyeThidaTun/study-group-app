-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('HAPPY', 'STRESSED', 'RELAXED');

-- CreateTable
CREATE TABLE "Tasks" (
    "taskId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mood" "Mood",

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "RecurringTask" (
    "recurringId" SERIAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "RecurringTask_pkey" PRIMARY KEY ("recurringId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecurringTask_taskId_key" ON "RecurringTask"("taskId");

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
