/*
  Warnings:

  - You are about to alter the column `comment` on the `Seeding` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Seeding" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(255);
