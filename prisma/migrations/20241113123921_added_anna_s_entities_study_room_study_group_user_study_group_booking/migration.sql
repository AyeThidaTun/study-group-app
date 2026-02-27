-- CreateTable
CREATE TABLE "StudyRoom" (
    "roomId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "StudyRoom_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "StudyGroup" (
    "groupId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "UserStudyGroup" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStudyGroup_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateIndex
CREATE INDEX "StudyRoom_roomId_idx" ON "StudyRoom"("roomId");

-- CreateIndex
CREATE INDEX "StudyGroup_groupId_idx" ON "StudyGroup"("groupId");

-- CreateIndex
CREATE INDEX "Booking_groupId_idx" ON "Booking"("groupId");

-- CreateIndex
CREATE INDEX "Booking_roomId_idx" ON "Booking"("roomId");

-- AddForeignKey
ALTER TABLE "UserStudyGroup" ADD CONSTRAINT "UserStudyGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStudyGroup" ADD CONSTRAINT "UserStudyGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("roomId") ON DELETE CASCADE ON UPDATE CASCADE;
