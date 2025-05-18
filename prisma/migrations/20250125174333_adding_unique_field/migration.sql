/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `TableData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TableData_userId_date_key" ON "TableData"("userId", "date");
