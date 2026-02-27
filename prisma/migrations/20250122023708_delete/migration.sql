/*
  Warnings:

  - You are about to drop the column `matchScore` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the `ActiveRelationship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TutorRecommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActiveRelationship" DROP CONSTRAINT "ActiveRelationship_tuteeId_fkey";

-- DropForeignKey
ALTER TABLE "ActiveRelationship" DROP CONSTRAINT "ActiveRelationship_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "TutorRecommendation" DROP CONSTRAINT "TutorRecommendation_tuteeId_fkey";

-- DropForeignKey
ALTER TABLE "TutorRecommendation" DROP CONSTRAINT "TutorRecommendation_tutorId_fkey";

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "matchScore";

-- DropTable
DROP TABLE "ActiveRelationship";

-- DropTable
DROP TABLE "TutorRecommendation";
