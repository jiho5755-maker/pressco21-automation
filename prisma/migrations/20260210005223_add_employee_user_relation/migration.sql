-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "userId" TEXT,
    "address" TEXT,
    "childrenUnder20" INTEGER NOT NULL DEFAULT 0,
    "departmentId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "joinDate" DATETIME NOT NULL,
    "contractType" TEXT NOT NULL DEFAULT 'REGULAR',
    "contractEndDate" DATETIME,
    "probationEnd" DATETIME,
    "replacementForId" TEXT,
    "replacementReason" TEXT,
    "weeklyWorkHours" INTEGER NOT NULL DEFAULT 40,
    "workStartTime" TEXT NOT NULL DEFAULT '09:00',
    "workEndTime" TEXT NOT NULL DEFAULT '18:00',
    "breakMinutes" INTEGER NOT NULL DEFAULT 60,
    "workType" TEXT NOT NULL DEFAULT 'OFFICE',
    "flexStartTime" TEXT,
    "flexEndTime" TEXT,
    "remoteWorkDays" TEXT,
    "salaryType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "baseSalary" INTEGER NOT NULL DEFAULT 0,
    "mealAllowance" INTEGER NOT NULL DEFAULT 0,
    "transportAllowance" INTEGER NOT NULL DEFAULT 0,
    "positionAllowance" INTEGER NOT NULL DEFAULT 0,
    "taxFreeMeal" BOOLEAN NOT NULL DEFAULT true,
    "taxFreeTransport" BOOLEAN NOT NULL DEFAULT true,
    "useFixedOT" BOOLEAN NOT NULL DEFAULT false,
    "fixedOTHours" INTEGER,
    "fixedOTAmount" INTEGER,
    "fixedNightWorkHours" INTEGER DEFAULT 0,
    "fixedNightWorkAmount" INTEGER DEFAULT 0,
    "fixedHolidayWorkHours" INTEGER DEFAULT 0,
    "fixedHolidayWorkAmount" INTEGER DEFAULT 0,
    "fixedOTAgreementConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "nationalPension" BOOLEAN NOT NULL DEFAULT true,
    "healthInsurance" BOOLEAN NOT NULL DEFAULT true,
    "employmentInsurance" BOOLEAN NOT NULL DEFAULT true,
    "industrialAccident" BOOLEAN NOT NULL DEFAULT true,
    "dependents" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "leaveType" TEXT,
    "leaveStartDate" DATETIME,
    "leaveEndDate" DATETIME,
    "resignDate" DATETIME,
    "resignReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Employee_replacementForId_fkey" FOREIGN KEY ("replacementForId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("address", "bankAccount", "bankName", "baseSalary", "breakMinutes", "childrenUnder20", "contractEndDate", "contractType", "createdAt", "departmentId", "dependents", "email", "employeeNo", "employmentInsurance", "fixedHolidayWorkAmount", "fixedHolidayWorkHours", "fixedNightWorkAmount", "fixedNightWorkHours", "fixedOTAgreementConfirmed", "fixedOTAmount", "fixedOTHours", "flexEndTime", "flexStartTime", "healthInsurance", "id", "industrialAccident", "joinDate", "leaveEndDate", "leaveStartDate", "leaveType", "mealAllowance", "name", "nationalPension", "phone", "position", "positionAllowance", "probationEnd", "remoteWorkDays", "replacementForId", "replacementReason", "resignDate", "resignReason", "salaryType", "status", "taxFreeMeal", "taxFreeTransport", "transportAllowance", "updatedAt", "useFixedOT", "weeklyWorkHours", "workEndTime", "workStartTime", "workType") SELECT "address", "bankAccount", "bankName", "baseSalary", "breakMinutes", "childrenUnder20", "contractEndDate", "contractType", "createdAt", "departmentId", "dependents", "email", "employeeNo", "employmentInsurance", "fixedHolidayWorkAmount", "fixedHolidayWorkHours", "fixedNightWorkAmount", "fixedNightWorkHours", "fixedOTAgreementConfirmed", "fixedOTAmount", "fixedOTHours", "flexEndTime", "flexStartTime", "healthInsurance", "id", "industrialAccident", "joinDate", "leaveEndDate", "leaveStartDate", "leaveType", "mealAllowance", "name", "nationalPension", "phone", "position", "positionAllowance", "probationEnd", "remoteWorkDays", "replacementForId", "replacementReason", "resignDate", "resignReason", "salaryType", "status", "taxFreeMeal", "taxFreeTransport", "transportAllowance", "updatedAt", "useFixedOT", "weeklyWorkHours", "workEndTime", "workStartTime", "workType" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
