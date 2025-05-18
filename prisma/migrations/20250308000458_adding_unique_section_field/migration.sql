/*
  Warnings:

  - A unique constraint covering the columns `[title,month]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Section_title_month_key" ON "Section"("title", "month");
