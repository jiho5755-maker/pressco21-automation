-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "mealAllowance" INTEGER NOT NULL,
    "transportAllowance" INTEGER NOT NULL,
    "positionAllowance" INTEGER NOT NULL,
    "taxFreeMeal" BOOLEAN NOT NULL DEFAULT true,
    "taxFreeTransport" BOOLEAN NOT NULL DEFAULT true,
    "useFixedOT" BOOLEAN NOT NULL DEFAULT false,
    "fixedOTAmount" INTEGER NOT NULL DEFAULT 0,
    "fixedNightWorkAmount" INTEGER NOT NULL DEFAULT 0,
    "fixedHolidayWorkAmount" INTEGER NOT NULL DEFAULT 0,
    "variableOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "variableNightWorkMinutes" INTEGER NOT NULL DEFAULT 0,
    "variableHolidayMinutes" INTEGER NOT NULL DEFAULT 0,
    "variableOvertimeAmount" INTEGER NOT NULL DEFAULT 0,
    "variableNightWorkAmount" INTEGER NOT NULL DEFAULT 0,
    "variableHolidayWorkAmount" INTEGER NOT NULL DEFAULT 0,
    "totalGross" INTEGER NOT NULL,
    "totalTaxable" INTEGER NOT NULL,
    "totalInsurance" INTEGER NOT NULL,
    "incomeTax" INTEGER NOT NULL,
    "localIncomeTax" INTEGER NOT NULL,
    "netSalary" INTEGER NOT NULL,
    "nationalPension" INTEGER NOT NULL DEFAULT 0,
    "healthInsurance" INTEGER NOT NULL DEFAULT 0,
    "longTermCare" INTEGER NOT NULL DEFAULT 0,
    "employmentInsurance" INTEGER NOT NULL DEFAULT 0,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" DATETIME,
    "confirmedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayrollRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PayrollRecord_year_month_idx" ON "PayrollRecord"("year", "month");

-- CreateIndex
CREATE INDEX "PayrollRecord_isConfirmed_year_month_idx" ON "PayrollRecord"("isConfirmed", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_employeeId_year_month_key" ON "PayrollRecord"("employeeId", "year", "month");
