"use server";

import { z } from "zod/v4";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import {
  aggregateWithholdingTax,
  calculateYearlyTotal,
} from "@/lib/withholding-tax-aggregator";
import ExcelJS from "exceljs";

/**
 * 원천징수 세액 Excel 내보내기 (Admin 전용)
 */
const exportSchema = z.object({
  year: z.number().int().min(2024),
});

export const exportWithholdingTaxToExcel = authActionClient
  .inputSchema(exportSchema)
  .action(async ({ parsedInput: { year }, ctx }) => {
    // RBAC 검증
    if (ctx.userRole !== "admin") {
      throw new ActionError(
        "관리자만 Excel 내보내기를 사용할 수 있습니다."
      );
    }

    // DB 조회
    const records = await prisma.payrollRecord.findMany({
      where: { year },
      include: { employee: { select: { name: true, employeeNo: true } } },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    if (records.length === 0) {
      throw new ActionError(`${year}년 급여 기록이 없습니다.`);
    }

    // 집계
    const summary = aggregateWithholdingTax(records);
    const yearlyTotal = calculateYearlyTotal(summary);

    // Excel 생성
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: 월별 집계표
    const summarySheet = workbook.addWorksheet(`${year}년 원천징수 집계`);
    summarySheet.columns = [
      { header: "연월", key: "month", width: 12 },
      { header: "인원", key: "employeeCount", width: 10 },
      { header: "총 급여", key: "totalGross", width: 15 },
      { header: "과세 대상", key: "totalTaxableAmount", width: 15 },
      { header: "비과세", key: "totalNonTaxable", width: 15 },
      { header: "소득세", key: "incomeTax", width: 15 },
      { header: "지방소득세", key: "localIncomeTax", width: 15 },
      { header: "원천징수 합계", key: "totalTax", width: 15 },
    ];

    // 데이터
    summarySheet.addRows(summary);

    // 합계 행 추가
    summarySheet.addRow({
      month: "합계",
      employeeCount: "",
      totalGross: yearlyTotal.totalGross,
      totalTaxableAmount: yearlyTotal.totalTaxableAmount,
      totalNonTaxable: yearlyTotal.totalNonTaxable,
      incomeTax: yearlyTotal.incomeTax,
      localIncomeTax: yearlyTotal.localIncomeTax,
      totalTax: yearlyTotal.totalTax,
    });

    // 스타일 (헤더 행만 굵게)
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).alignment = { horizontal: "center" };
    summarySheet.getRow(summary.length + 2).font = { bold: true }; // 합계 행

    // Buffer 생성
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      success: true,
      data: Buffer.from(buffer).toString("base64"),
      filename: `원천징수_${year}.xlsx`,
    };
  });
