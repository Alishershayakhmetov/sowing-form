/*
  Warnings:

  - Added the required column `crop` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "crop" TEXT NOT NULL,
ADD COLUMN     "village" TEXT NOT NULL;
