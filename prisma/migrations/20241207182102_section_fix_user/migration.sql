/*
  Warnings:

  - Added the required column `userId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "month" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Section_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("id", "month", "title") SELECT "id", "month", "title" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
