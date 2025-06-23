/*
  Warnings:

  - You are about to drop the `AdminProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HRProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminProfile" DROP CONSTRAINT "AdminProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "HRProfile" DROP CONSTRAINT "HRProfile_userId_fkey";

-- DropTable
DROP TABLE "AdminProfile";

-- DropTable
DROP TABLE "HRProfile";
