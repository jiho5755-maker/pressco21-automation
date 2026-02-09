-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LeaveRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" REAL NOT NULL,
    "halfDayType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedReason" TEXT,
    "reason" TEXT,
    "childBirthDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeaveRecord_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LeaveRecord" ("childBirthDate", "createdAt", "days", "employeeId", "endDate", "id", "reason", "startDate", "status", "type", "updatedAt") SELECT "childBirthDate", "createdAt", "days", "employeeId", "endDate", "id", "reason", "startDate", "status", "type", "updatedAt" FROM "LeaveRecord";
DROP TABLE "LeaveRecord";
ALTER TABLE "new_LeaveRecord" RENAME TO "LeaveRecord";
CREATE INDEX "LeaveRecord_employeeId_startDate_idx" ON "LeaveRecord"("employeeId", "startDate");
CREATE INDEX "LeaveRecord_employeeId_status_idx" ON "LeaveRecord"("employeeId", "status");
CREATE INDEX "LeaveRecord_status_requestedAt_idx" ON "LeaveRecord"("status", "requestedAt");
CREATE INDEX "LeaveRecord_type_startDate_idx" ON "LeaveRecord"("type", "startDate");
CREATE INDEX "LeaveRecord_startDate_endDate_idx" ON "LeaveRecord"("startDate", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
