/**
 * 근태 관리 계산 유틸리티
 * 근로기준법 제50조(근로시간), 제56조(연장근로 가산) 기준
 */

import { differenceInMinutes, parse } from "date-fns";
import { LABOR_STANDARDS_2026 } from "./constants";

/**
 * 총 근무시간 계산 (분 단위)
 * 근무시간 = (퇴근 - 출근) - 휴게시간
 *
 * @param clockIn 출근 시간 (HH:mm 형식, 예: "09:00")
 * @param clockOut 퇴근 시간 (HH:mm 형식, 예: "18:30")
 * @param breakMinutes 휴게시간 (분 단위, 기본값 60분)
 * @returns 실근로시간 (분)
 */
export function calculateWorkMinutes(
  clockIn: string,
  clockOut: string,
  breakMinutes: number = 60
): number {
  const baseDate = new Date(2000, 0, 1);
  const start = parse(clockIn, "HH:mm", baseDate);
  const end = parse(clockOut, "HH:mm", baseDate);

  let totalMinutes = differenceInMinutes(end, start);

  // 자정을 넘긴 경우 (예: 18:00 ~ 02:00)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  // 휴게시간 제외
  return Math.max(0, totalMinutes - breakMinutes);
}

/**
 * 연장근로 시간 계산 (분 단위)
 * 연장근로 = 실근로시간 - 소정근로시간(8시간)
 *
 * @param workMinutes 실근로시간 (분)
 * @param standardMinutes 소정근로시간 (분, 기본값 480분 = 8시간)
 * @returns 연장근로시간 (분)
 */
export function calculateOvertime(
  workMinutes: number,
  standardMinutes: number = 480
): number {
  return Math.max(0, workMinutes - standardMinutes);
}

/**
 * 야간근로 시간 계산 (분 단위)
 * 야간근로: 22:00 ~ 06:00 구간 근무시간
 *
 * @param clockIn 출근 시간 (HH:mm)
 * @param clockOut 퇴근 시간 (HH:mm)
 * @returns 야간근로시간 (분)
 */
export function calculateNightWork(
  clockIn: string,
  clockOut: string
): number {
  const baseDate = new Date(2000, 0, 1);
  const nextDate = new Date(2000, 0, 2);

  const workStart = parse(clockIn, "HH:mm", baseDate);
  const workEnd = parse(clockOut, "HH:mm", baseDate);

  // 야간 구간: 22:00 ~ 06:00
  const nightStart = parse("22:00", "HH:mm", baseDate);
  const nightEnd = parse("06:00", "HH:mm", nextDate);

  let nightMinutes = 0;

  // 퇴근 시간이 출근 시간보다 이르면 자정을 넘긴 것
  const isOvernight = workEnd <= workStart;

  if (isOvernight) {
    // 자정 넘김: 22:00~24:00 + 00:00~06:00 구간 계산
    // 1) 출근 ~ 자정
    if (workStart >= nightStart) {
      const midnight = new Date(2000, 0, 2, 0, 0);
      nightMinutes += differenceInMinutes(midnight, workStart);
    } else if (workStart < nightStart) {
      // 22:00 이전 출근인 경우, 22:00부터 계산
      const midnight = new Date(2000, 0, 2, 0, 0);
      nightMinutes += differenceInMinutes(midnight, nightStart);
    }

    // 2) 자정 ~ 퇴근 (퇴근이 06:00 이전일 경우만)
    const workEndNext = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), workEnd.getHours(), workEnd.getMinutes());
    if (workEndNext <= nightEnd) {
      nightMinutes += differenceInMinutes(workEndNext, new Date(2000, 0, 2, 0, 0));
    } else if (workEndNext > nightEnd) {
      nightMinutes += differenceInMinutes(nightEnd, new Date(2000, 0, 2, 0, 0));
    }
  } else {
    // 일반 근무 (자정 안 넘김)
    // 22:00~24:00 구간만 계산
    if (workEnd > nightStart) {
      const effectiveStart = workStart > nightStart ? workStart : nightStart;
      const midnight = new Date(2000, 0, 2, 0, 0);
      nightMinutes = differenceInMinutes(midnight, effectiveStart);
    }
  }

  return Math.max(0, nightMinutes);
}

/**
 * 주52시간 검증
 *
 * @param weekRecords 해당 주차 근태 기록 배열
 * @returns 검증 결과 { isValid: boolean, totalMinutes: number, totalHours: number }
 */
export function validateWeeklyWorkHours(
  weekRecords: Array<{ workMinutes: number | null }>
): {
  isValid: boolean;
  totalMinutes: number;
  totalHours: number;
} {
  const totalMinutes = weekRecords.reduce(
    (sum, record) => sum + (record.workMinutes || 0),
    0
  );
  const totalHours = totalMinutes / 60;
  const maxHours = LABOR_STANDARDS_2026.maxWeeklyHours; // 52

  return {
    isValid: totalHours <= maxHours,
    totalMinutes,
    totalHours: Math.round(totalHours * 10) / 10, // 소수점 1자리
  };
}

/**
 * 월별 통계 계산
 *
 * @param records 월별 근태 기록 배열
 * @returns 통계 { totalWorkDays, totalWorkHours, totalOvertimeHours, totalNightWorkHours }
 */
export function calculateMonthlyStats(
  records: Array<{
    workMinutes: number | null;
    overtime: number | null;
    nightWork: number | null;
  }>
) {
  const totalWorkMinutes = records.reduce(
    (sum, r) => sum + (r.workMinutes || 0),
    0
  );
  const totalOvertimeMinutes = records.reduce(
    (sum, r) => sum + (r.overtime || 0),
    0
  );
  const totalNightWorkMinutes = records.reduce(
    (sum, r) => sum + (r.nightWork || 0),
    0
  );

  return {
    totalWorkDays: records.length,
    totalWorkHours: Math.round((totalWorkMinutes / 60) * 10) / 10,
    totalOvertimeHours: Math.round((totalOvertimeMinutes / 60) * 10) / 10,
    totalNightWorkHours: Math.round((totalNightWorkMinutes / 60) * 10) / 10,
  };
}

/**
 * 시간(분)을 "X시간 Y분" 형식으로 변환
 *
 * @param minutes 분
 * @returns 형식화된 문자열 (예: "8시간 30분")
 */
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}분`;
  }
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}
