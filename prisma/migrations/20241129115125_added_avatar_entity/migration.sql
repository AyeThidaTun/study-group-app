/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "avatarId" INTEGER DEFAULT 1;

-- CreateTable
CREATE TABLE "Avatar" (
    "avatarId" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("avatarId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
