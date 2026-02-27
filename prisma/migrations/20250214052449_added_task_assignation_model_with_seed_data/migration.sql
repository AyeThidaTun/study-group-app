-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "AssignedTask" (
    "id" SERIAL NOT NULL,
    "assignerId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "PriorityLevel" NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "todoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssignedTask" ADD CONSTRAINT "AssignedTask_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedTask" ADD CONSTRAINT "AssignedTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedTask" ADD CONSTRAINT "AssignedTask_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
