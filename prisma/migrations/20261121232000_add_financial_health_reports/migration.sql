-- CreateTable
CREATE TABLE "FinancialHealthReport" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "tone" TEXT NOT NULL,
    "reportData" JSONB NOT NULL,
    "metricsSnapshot" JSONB NOT NULL,
    "dataHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialHealthReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialHealthReport_userId_monthKey_idx" ON "FinancialHealthReport"("userId", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialHealthReport_userId_monthKey_version_key" ON "FinancialHealthReport"("userId", "monthKey", "version");

-- AddForeignKey
ALTER TABLE "FinancialHealthReport" ADD CONSTRAINT "FinancialHealthReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
