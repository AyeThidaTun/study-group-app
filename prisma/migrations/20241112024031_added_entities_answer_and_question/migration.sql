-- CreateTable
CREATE TABLE "Question" (
    "questionID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "module" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("questionID")
);

-- CreateTable
CREATE TABLE "Answer" (
    "answerID" SERIAL NOT NULL,
    "questionID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("answerID")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE RESTRICT ON UPDATE CASCADE;
