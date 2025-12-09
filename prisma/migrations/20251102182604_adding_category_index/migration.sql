-- CreateIndex
CREATE INDEX "Transaction_userId_date_category_idx" ON "Transaction"("userId", "date", "category");
