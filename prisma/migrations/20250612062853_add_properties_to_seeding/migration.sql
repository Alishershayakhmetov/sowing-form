/*
  Warnings:

  - Added the required column `company` to the `Seeding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan` to the `Seeding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Seeding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `Seeding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seeding" ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "plan" INTEGER NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "village" TEXT NOT NULL;
