-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "month" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetClass" TEXT NOT NULL DEFAULT 'ASSET',
    CONSTRAINT "Section_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("assetClass", "id", "month", "title", "userId") SELECT "assetClass", "id", "month", "title", "userId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE UNIQUE INDEX "Section_title_month_key" ON "Section"("title", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
