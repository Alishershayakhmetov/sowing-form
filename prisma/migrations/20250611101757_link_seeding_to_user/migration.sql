/*
  Warnings:

  - Added the required column `date` to the `Seeding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Seeding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seeding" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Seeding" ADD CONSTRAINT "Seeding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
