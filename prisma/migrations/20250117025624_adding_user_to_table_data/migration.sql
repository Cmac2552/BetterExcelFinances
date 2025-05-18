/*
  Warnings:

  - Added the required column `userId` to the `TableData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TableData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "sectionValue" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TableData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableData" ("date", "id", "sectionValue") SELECT "date", "id", "sectionValue" FROM "TableData";
DROP TABLE "TableData";
ALTER TABLE "new_TableData" RENAME TO "TableData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
