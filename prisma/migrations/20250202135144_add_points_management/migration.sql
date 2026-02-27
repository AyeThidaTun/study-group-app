-- CreateTable
CREATE TABLE "PointsTransaction" (
    "pointsTransactionId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("pointsTransactionId")
);

-- CreateTable
CREATE TABLE "PointsRule" (
    "ruleId" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "calculation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsRule_pkey" PRIMARY KEY ("ruleId")
);

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
