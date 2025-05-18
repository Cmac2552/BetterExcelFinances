/*
  Warnings:

  - You are about to drop the column `month` on the `TableData` table. All the data in the column will be lost.
  - Added the required column `date` to the `TableData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TableData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "sectionValue" INTEGER NOT NULL
);
INSERT INTO "new_TableData" ("id", "sectionValue") SELECT "id", "sectionValue" FROM "TableData";
DROP TABLE "TableData";
ALTER TABLE "new_TableData" RENAME TO "TableData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
