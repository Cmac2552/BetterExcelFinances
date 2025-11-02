-- DropIndex
DROP INDEX "Transaction_userId_date_category_idx";

-- CreateIndex
CREATE INDEX "Transaction_userId_statementMonth_category_idx" ON "Transaction"("userId", "statementMonth", "category");
