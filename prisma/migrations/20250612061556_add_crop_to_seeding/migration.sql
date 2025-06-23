/*
  Warnings:

  - Added the required column `crop` to the `Seeding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seeding" ADD COLUMN     "crop" TEXT NOT NULL;
