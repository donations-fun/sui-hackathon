/*
  Warnings:

  - A unique constraint covering the columns `[twitterUsername]` on the table `Charity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Charity" ADD COLUMN     "twitterUsername" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Charity_twitterUsername_key" ON "Charity"("twitterUsername");
