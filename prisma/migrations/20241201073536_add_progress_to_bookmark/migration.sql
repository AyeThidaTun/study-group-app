-- CreateEnum
CREATE TYPE "BookmarkStatus" AS ENUM ('UNREAD', 'READ', 'FINISHED');

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "progress" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "status" "BookmarkStatus" NOT NULL DEFAULT 'UNREAD';
