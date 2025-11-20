-- CreateTable
CREATE TABLE "Cache" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Cache_expireAt_idx" ON "Cache"("expireAt");
