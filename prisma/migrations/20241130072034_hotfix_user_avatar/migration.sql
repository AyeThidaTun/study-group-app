-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("avatarId") ON DELETE RESTRICT ON UPDATE CASCADE;
