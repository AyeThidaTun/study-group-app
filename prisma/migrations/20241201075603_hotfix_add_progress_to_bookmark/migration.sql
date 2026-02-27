/*
  Warnings:

  - The values [READ] on the enum `BookmarkStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookmarkStatus_new" AS ENUM ('UNREAD', 'READING', 'FINISHED');
ALTER TABLE "Bookmark" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bookmark" ALTER COLUMN "status" TYPE "BookmarkStatus_new" USING ("status"::text::"BookmarkStatus_new");
ALTER TYPE "BookmarkStatus" RENAME TO "BookmarkStatus_old";
ALTER TYPE "BookmarkStatus_new" RENAME TO "BookmarkStatus";
DROP TYPE "BookmarkStatus_old";
ALTER TABLE "Bookmark" ALTER COLUMN "status" SET DEFAULT 'UNREAD';
COMMIT;
