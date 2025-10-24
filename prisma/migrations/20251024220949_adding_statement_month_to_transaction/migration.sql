/*
  Warnings:

  - Added the required column `statementMonth` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "statementMonth" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_statementMonth_idx" ON "Transaction"("statementMonth");
