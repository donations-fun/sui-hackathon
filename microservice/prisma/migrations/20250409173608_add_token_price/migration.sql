-- CreateTable
CREATE TABLE "TokenPrice" (
    "chain" VARCHAR(20) NOT NULL,
    "tokenAddress" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "logo" VARCHAR(255),
    "decimals" SMALLINT NOT NULL,
    "itsTokenId" VARCHAR(66),
    "lastUsdPrice" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("chain","tokenAddress")
);
