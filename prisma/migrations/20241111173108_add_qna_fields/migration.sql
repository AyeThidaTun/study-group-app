-- CreateTable
CREATE TABLE "question" (
    "questionID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "module" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_pkey" PRIMARY KEY ("questionID")
);

-- CreateTable
CREATE TABLE "answer" (
    "answerID" SERIAL NOT NULL,
    "questionID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("answerID")
);

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "question"("questionID") ON DELETE RESTRICT ON UPDATE CASCADE;
