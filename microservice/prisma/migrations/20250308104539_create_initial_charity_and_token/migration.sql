-- CreateTable
CREATE TABLE "Charity" (
    "id" VARCHAR(66) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "chains" VARCHAR(255)[],
    "addressesByChain" JSONB NOT NULL,
    "description" TEXT,
    "url" VARCHAR(255),
    "logo" VARCHAR(255),

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "logo" VARCHAR(255),
    "infoByChain" JSONB NOT NULL,
    "itsTokenId" VARCHAR(66),
    "analytic" BOOLEAN NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);
