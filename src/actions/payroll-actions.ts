"use server";

import { z } from "zod/v4"; // ⚠️ v4 임포트 필수 (v3 경로 사용 금지)
import { revalidatePath } from "next/cache";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { calculateMonthlyPayroll } from "@/lib/payroll-calculator";
import ExcelJS from "exceljs";
import { notifyPayslipReady } from "@/lib/notification-helper";

// ── Zod 스키마 ──

const generatePayrollSchema = z.object({
  employeeId: z.string().min(1, "직원을 선택해주세요"),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

const confirmPayrollSchema = z.object({
  ids: z.array(z.string()).min(1, "확정할 급여를 선택해주세요"),
});

const deletePayrollSchema = z.object({
  id: z.string().min(1),
});

const exportPayrollSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

// ── Server Actions ──

/**
 * 월별 급여 생성 (자동 계산)
 */
export const generatePayrollRecord = authActionClient
  .inputSchema(generatePayrollSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, year, month } = parsedInput;

    // 1. 중복 체크
    const existing = await prisma.payrollRecord.findUnique({
      where: {
        employeeId_year_month: { employeeId, year, month },
      },
    });

    if (existing) {
      throw new ActionError("해당 월의 급여 기록이 이미 존재합니다.");
    }

    // 2. 급여 계산
    const payroll = await calculateMonthlyPayroll(employeeId, year, month);

    // 3. DB 저장
    const record = await prisma.payrollRecord.create({
      data: {
        employeeId,
        year,
        month,
        // 급여 구성 스냅샷
        baseSalary: payroll.baseSalary,
        mealAllowance: payroll.mealAllowance,
        transportAllowance: payroll.transportAllowance,
        positionAllowance: payroll.positionAllowance,
        taxFreeMeal: payroll.taxFreeMeal,
        taxFreeTransport: payroll.taxFreeTransport,
        useFixedOT: payroll.useFixedOT,
        fixedOTAmount: payroll.fixedOTAmount,
        fixedNightWorkAmount: payroll.fixedNightWorkAmount,
        fixedHolidayWorkAmount: payroll.fixedHolidayWorkAmount,
        // 변동 수당
        variableOvertimeMinutes: payroll.variableOvertimeMinutes,
        variableNightWorkMinutes: payroll.variableNightWorkMinutes,
        variableHolidayMinutes: payroll.variableHolidayMinutes,
        variableOvertimeAmount: payroll.variableOvertimeAmount,
        variableNightWorkAmount: payroll.variableNightWorkAmount,
        variableHolidayWorkAmount: payroll.variableHolidayWorkAmount,
        // 계산 결과
        totalGross: payroll.totalGross,
        totalTaxable: payroll.totalTaxable,
        totalInsurance: payroll.totalInsurance,
        incomeTax: payroll.incomeTax,
        localIncomeTax: payroll.localIncomeTax,
        netSalary: payroll.netSalary,
        nationalPension: payroll.nationalPension,
        healthInsurance: payroll.healthInsurance,
        longTermCare: payroll.longTermCare,
        employmentInsurance: payroll.employmentInsurance,
      },
    });

    revalidatePath("/payroll");

    return { success: true, data: record };
  });

/**
 * 급여 확정 (일괄)
 */
export const confirmPayrollRecords = authActionClient
  .inputSchema(confirmPayrollSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { ids } = parsedInput;

    // 관리자 권한 체크
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 급여를 확정할 수 있습니다.");
    }

    // 일괄 확정 (NULL 체크 포함)
    const result = await prisma.payrollRecord.updateMany({
      where: { id: { in: ids } },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmedBy: ctx.userId ?? null, // NULL 체크
      },
    });

    // 알림 발송 (각 직원에게 급여명세서 발급 알림)
    for (const id of ids) {
      await notifyPayslipReady(id);
    }

    revalidatePath("/payroll");

    return { success: true, count: result.count };
  });

/**
 * 급여 기록 삭제
 */
export const deletePayrollRecord = authActionClient
  .inputSchema(deletePayrollSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    // 기록 조회
    const existing = await prisma.payrollRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ActionError("해당 급여 기록을 찾을 수 없습니다.");
    }

    // 확정된 기록 삭제 방지
    if (existing.isConfirmed) {
      throw new ActionError("확정된 급여는 삭제할 수 없습니다.");
    }

    // 삭제
    await prisma.payrollRecord.delete({ where: { id } });

    revalidatePath("/payroll");

    return { success: true };
  });

/**
 * Excel 급여대장 내보내기 (세무사 제출용)
 *
 * @returns Excel 파일 Buffer (base64 인코딩)
 */
export const exportPayrollToExcel = authActionClient
  .inputSchema(exportPayrollSchema)
  .action(async ({ parsedInput }) => {
    const { year, month } = parsedInput;

    // 1. 해당 월의 급여 기록 조회
    const records = await prisma.payrollRecord.findMany({
      where: { year, month },
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: [{ employee: { department: { name: "asc" } } }, { employee: { employeeNo: "asc" } }],
    });

    if (records.length === 0) {
      throw new ActionError("해당 월의 급여 기록이 없습니다.");
    }

    // 2. ExcelJS 워크북 생성
    const workbook = new ExcelJS.Workbook();

    // 워크북 속성
    workbook.creator = "소기업 자동화 시스템";
    workbook.created = new Date();
    workbook.title = `${year}년 ${month}월 급여대장`;

    // 워크시트 추가
    const sheet = workbook.addWorksheet("급여대장");

    // 3. 헤더 행 (굵게)
    const headerRow = sheet.addRow([
      "부서",
      "사번",
      "성명",
      "기본급",
      "식대",
      "교통비",
      "직책수당",
      "변동OT",
      "변동야간",
      "변동휴일",
      "총지급액",
      "국민연금",
      "건강보험",
      "고용보험",
      "소득세",
      "지방소득세",
      "총공제액",
      "실수령액",
      "확정여부",
    ]);

    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // 4. 데이터 행
    for (const record of records) {
      const totalDeduction =
        record.nationalPension +
        record.healthInsurance +
        record.longTermCare +
        record.employmentInsurance +
        record.incomeTax +
        record.localIncomeTax;

      sheet.addRow([
        record.employee.department.name,
        record.employee.employeeNo,
        record.employee.name,
        record.baseSalary,
        record.mealAllowance,
        record.transportAllowance,
        record.positionAllowance,
        record.variableOvertimeAmount,
        record.variableNightWorkAmount,
        record.variableHolidayWorkAmount,
        record.totalGross,
        record.nationalPension,
        record.healthInsurance + record.longTermCare,
        record.employmentInsurance,
        record.incomeTax,
        record.localIncomeTax,
        totalDeduction,
        record.netSalary,
        record.isConfirmed ? "확정" : "미확정",
      ]);
    }

    // 5. 컬럼 너비 자동 조정
    sheet.columns.forEach((column) => {
      if (column) {
        column.width = 12;
      }
    });

    // 6. Buffer 생성
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      success: true,
      buffer: Buffer.from(buffer).toString("base64"),
      filename: `급여대장_${year}_${month}.xlsx`,
    };
  });
