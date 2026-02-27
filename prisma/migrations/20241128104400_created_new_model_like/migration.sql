-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionID_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_userID_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_userID_fkey";

-- CreateTable
CREATE TABLE "Like" (
    "likeID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "questionID" INTEGER,
    "answerID" INTEGER,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("likeID")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_answerID_fkey" FOREIGN KEY ("answerID") REFERENCES "Answer"("answerID") ON DELETE CASCADE ON UPDATE CASCADE;
