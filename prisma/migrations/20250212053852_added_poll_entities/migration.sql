-- CreateTable
CREATE TABLE "Poll" (
    "pollId" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("pollId")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "pollOptionId" SERIAL NOT NULL,
    "pollId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("pollOptionId")
);

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("pollId") ON DELETE CASCADE ON UPDATE CASCADE;
