-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SectionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    CONSTRAINT "SectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SectionItem" ("id", "label", "sectionId", "value") SELECT "id", "label", "sectionId", "value" FROM "SectionItem";
DROP TABLE "SectionItem";
ALTER TABLE "new_SectionItem" RENAME TO "SectionItem";
CREATE TABLE "new_TableData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "sectionValue" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TableData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TableData" ("date", "id", "sectionValue", "userId") SELECT "date", "id", "sectionValue", "userId" FROM "TableData";
DROP TABLE "TableData";
ALTER TABLE "new_TableData" RENAME TO "TableData";
CREATE UNIQUE INDEX "TableData_userId_date_key" ON "TableData"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
