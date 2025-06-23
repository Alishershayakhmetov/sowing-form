/*
  Warnings:

  - You are about to drop the column `crop` on the `FarmerProfile` table. All the data in the column will be lost.
  - Added the required column `district` to the `FarmerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ruralDistrict` to the `FarmerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FarmerProfile" DROP COLUMN "crop",
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "ruralDistrict" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FarmerCrop" (
    "id" SERIAL NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "culture" TEXT NOT NULL,
    "subculture" TEXT NOT NULL,

    CONSTRAINT "FarmerCrop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FarmerCrop" ADD CONSTRAINT "FarmerCrop_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
