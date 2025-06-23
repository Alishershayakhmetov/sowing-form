-- CreateTable
CREATE TABLE "Seeding" (
    "id" SERIAL NOT NULL,
    "culture" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Seeding_pkey" PRIMARY KEY ("id")
);
