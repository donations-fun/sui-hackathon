-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "chain" VARCHAR(255) NOT NULL,
    "userAddress" VARCHAR(255),
    "token" VARCHAR(255) NOT NULL,
    "charityId" VARCHAR(66) NOT NULL,
    "charityName" VARCHAR(255),
    "amount" VARCHAR(255) NOT NULL,
    "sourceChain" VARCHAR(255),
    "sourceAddress" VARCHAR(255),
    "txHash" VARCHAR(255) NOT NULL,
    "processedBlock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donation_chain_idx" ON "Donation"("chain");

-- CreateIndex
CREATE INDEX "Donation_userAddress_idx" ON "Donation"("userAddress");

-- CreateIndex
CREATE INDEX "Donation_charityId_idx" ON "Donation"("charityId");
