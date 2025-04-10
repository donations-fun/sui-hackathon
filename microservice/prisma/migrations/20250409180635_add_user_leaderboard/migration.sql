-- CreateTable
CREATE TABLE "UserLeaderboard" (
    "chain" VARCHAR(20) NOT NULL,
    "twitterUsername" VARCHAR(255) NOT NULL,
    "lastUsdValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLeaderboard_pkey" PRIMARY KEY ("chain","twitterUsername")
);

-- CreateTable
CREATE TABLE "LastProcessedDonation" (
    "chain" VARCHAR(255) NOT NULL,
    "lastDonationId" INTEGER NOT NULL,
    "lastTwitterUsername" VARCHAR(255),

    CONSTRAINT "LastProcessedDonation_pkey" PRIMARY KEY ("chain")
);
