-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTutor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TutorProfile" (
    "tutorId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "availability" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("tutorId")
);

-- CreateTable
CREATE TABLE "TutorRecommendation" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "tuteeId" INTEGER NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveRelationship" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "tuteeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "ActiveRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorRecommendation" ADD CONSTRAINT "TutorRecommendation_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("tutorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorRecommendation" ADD CONSTRAINT "TutorRecommendation_tuteeId_fkey" FOREIGN KEY ("tuteeId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveRelationship" ADD CONSTRAINT "ActiveRelationship_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("tutorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveRelationship" ADD CONSTRAINT "ActiveRelationship_tuteeId_fkey" FOREIGN KEY ("tuteeId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
