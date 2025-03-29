-- CreateTable
CREATE TABLE "EventsCursor" (
    "id" TEXT NOT NULL,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL,

    CONSTRAINT "EventsCursor_pkey" PRIMARY KEY ("id")
);
