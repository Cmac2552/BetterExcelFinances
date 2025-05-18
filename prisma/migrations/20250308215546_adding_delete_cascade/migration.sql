-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TableData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "sectionValue" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TableData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TableData" ("date", "id", "sectionValue", "userId") SELECT "date", "id", "sectionValue", "userId" FROM "TableData";
DROP TABLE "TableData";
ALTER TABLE "new_TableData" RENAME TO "TableData";
CREATE UNIQUE INDEX "TableData_userId_date_key" ON "TableData"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
