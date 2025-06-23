/*
  Warnings:

  - You are about to drop the column `plan` on the `FarmerProfile` table. All the data in the column will be lost.
  - Added the required column `plan` to the `FarmerCrop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FarmerCrop" ADD COLUMN     "plan" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "FarmerProfile" DROP COLUMN "plan";
