// 연차 계산 유틸리티 — 근로기준법 기반 순수 함수
// 입사일 기준 연차 산정 (회계연도 기준 아님)

import { MATERNITY_PARENTAL_2026 } from "@/lib/constants";

const { annualLeave } = MATERNITY_PARENTAL_2026;

/**
 * 총 연차일수 계산 (근로기준법 제60조)
 *
 * - 입사 1년 미만: 1개월 개근 시 1일 (최대 11일)
 * - 입사 1년 이상: 15일
 * - 3년 이상 근속: 2년마다 +1일 (최대 25일)
 *
 * @param joinDate 입사일
 * @param referenceDate 기준일 (보통 오늘)
 * @returns 총 연차일수
 */
export function calculateTotalAnnualLeave(
  joinDate: Date,
  referenceDate: Date = new Date()
): number {
  const join = new Date(joinDate);
  const ref = new Date(referenceDate);

  // 근속 개월 수 계산
  const diffMs = ref.getTime() - join.getTime();
  if (diffMs < 0) return 0;

  const totalMonths =
    (ref.getFullYear() - join.getFullYear()) * 12 +
    (ref.getMonth() - join.getMonth());

  // 1년 미만: 1개월 개근 시 1일씩 (최대 11일)
  if (totalMonths < 12) {
    return Math.min(totalMonths, 11) * annualLeave.underOneYear;
  }

  // 1년 이상: 기본 15일
  const yearsWorked = Math.floor(totalMonths / 12);
  const base = annualLeave.baseAfterOneYear;

  // 3년 이상: 2년마다 +1일
  const additionalYears = Math.max(0, yearsWorked - 1);
  const additional =
    Math.floor(additionalYears / 2) * annualLeave.additionalPerTwoYears;

  return Math.min(base + additional, annualLeave.maxDays);
}

/**
 * 해당 연도의 사용 연차일수 합산
 *
 * @param leaveRecords 휴가 기록 배열
 * @param year 조회 연도
 * @returns 사용 연차일수
 */
export function calculateUsedAnnualLeave(
  leaveRecords: { type: string; days: number; status: string; startDate: Date }[],
  year: number
): number {
  return leaveRecords
    .filter(
      (record) =>
        record.type === "ANNUAL" &&
        (record.status === "APPROVED" || record.status === "PENDING") &&
        new Date(record.startDate).getFullYear() === year
    )
    .reduce((sum, record) => sum + record.days, 0);
}

/**
 * 연차 현황 요약 반환
 *
 * 근로기준법 제60조 제3항:
 * 1년 미만 기간 중 사용한 연차는 1년 이상 연차(15일)에서 차감
 *
 * @param joinDate 입사일
 * @param leaveRecords 휴가 기록 배열
 * @param referenceDate 기준일
 * @returns { total: 사용 가능 연차, used: 사용 연차, remaining: 잔여 연차, year: 기준 연도 }
 */
export function getAnnualLeaveSummary(
  joinDate: Date,
  leaveRecords: { type: string; days: number; status: string; startDate: Date }[],
  referenceDate: Date = new Date()
) {
  const year = referenceDate.getFullYear();
  const join = new Date(joinDate);

  // 근속 개월 수 계산
  const totalMonths =
    (referenceDate.getFullYear() - join.getFullYear()) * 12 +
    (referenceDate.getMonth() - join.getMonth());

  // 총 연차 발생
  let totalAnnualLeave = calculateTotalAnnualLeave(joinDate, referenceDate);

  // 근로기준법 제60조 제3항: 1년 미만 사용 연차를 2년차에서 차감
  if (totalMonths >= 12 && totalMonths < 24) {
    // 2년차 기간 (입사일 + 1년 ~ 입사일 + 2년)
    const firstYearEnd = new Date(join);
    firstYearEnd.setFullYear(firstYearEnd.getFullYear() + 1);

    // 1년 미만 기간 사용 연차 계산 (입사일 ~ 입사일+1년)
    const usedInFirstYear = leaveRecords
      .filter(
        (record) =>
          record.type === "ANNUAL" &&
          (record.status === "APPROVED" || record.status === "PENDING") &&
          new Date(record.startDate) >= join &&
          new Date(record.startDate) < firstYearEnd
      )
      .reduce((sum, record) => sum + record.days, 0);

    // 2년차 총 연차에서 1년 미만 사용분 차감
    totalAnnualLeave = Math.max(0, totalAnnualLeave - usedInFirstYear);
  }

  // 해당 연도 사용 연차
  const used = calculateUsedAnnualLeave(leaveRecords, year);
  const remaining = Math.max(0, totalAnnualLeave - used);

  return { total: totalAnnualLeave, used, remaining, year };
}

/**
 * 주말 제외 근무일수 계산 (월~금만 카운트)
 *
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns 근무일수
 */
export function calculateWorkDays(startDate: Date, endDate: Date): number {
  let workDays = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 월(1) ~ 금(5)만 카운트
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workDays;
}

/**
 * 출산전후휴가 기간 검증 (근로기준법 제74조)
 *
 * - 총 90일 (다태아 120일)
 * - 출산 후 최소 45일 연속 보장 (다태아 60일) - 법적 필수
 *
 * @param startDate 휴가 시작일
 * @param endDate 휴가 종료일
 * @param childBirthDate 자녀 출생일
 * @param isMultiple 다태아 여부 (기본값: false)
 * @returns { isValid: boolean, error?: string }
 */
export function validateMaternityLeave(
  startDate: Date,
  endDate: Date,
  childBirthDate: Date,
  isMultiple: boolean = false
): { isValid: boolean; error?: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const birth = new Date(childBirthDate);

  // 총 기간 계산 (일 단위)
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 최대 기간 검증
  const maxDays = isMultiple ? 120 : 90;
  if (totalDays > maxDays) {
    return {
      isValid: false,
      error: `출산전후휴가는 최대 ${maxDays}일입니다 (현재: ${totalDays}일).`,
    };
  }

  // 출산 후 기간 계산
  const daysAfterBirth = Math.floor(
    (end.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 출산 후 최소 45일(다태아 60일) 연속 보장 (법적 필수)
  const minDaysAfterBirth = isMultiple ? 60 : 45;
  if (daysAfterBirth < minDaysAfterBirth) {
    return {
      isValid: false,
      error: `출산 후 최소 ${minDaysAfterBirth}일을 연속으로 사용해야 합니다 (현재: ${daysAfterBirth}일). 근로기준법 제74조 위반입니다.`,
    };
  }

  // 출산일이 휴가 기간 내에 있는지 확인
  if (birth < start || birth > end) {
    return {
      isValid: false,
      error: "자녀 출생일은 휴가 기간 내에 있어야 합니다.",
    };
  }

  return { isValid: true };
}

/**
 * 배우자 출산휴가 기간 검증 (남녀고용평등법 제18조의2)
 *
 * - 총 20일 (2025.2.23 개정)
 * - 출산일로부터 120일 이내 사용
 *
 * @param startDate 휴가 시작일
 * @param childBirthDate 자녀 출생일
 * @returns { isValid: boolean, error?: string }
 */
export function validateSpouseMaternityLeave(
  startDate: Date,
  childBirthDate: Date
): { isValid: boolean; error?: string } {
  const start = new Date(startDate);
  const birth = new Date(childBirthDate);

  // 출산일로부터 경과일 계산
  const daysSinceBirth = Math.floor(
    (start.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 출산일로부터 120일 이내 검증
  if (daysSinceBirth < 0) {
    return {
      isValid: false,
      error: "배우자 출산휴가는 출산일 이후에만 사용 가능합니다.",
    };
  }

  if (daysSinceBirth > 120) {
    return {
      isValid: false,
      error: `배우자 출산휴가는 출산일로부터 120일 이내에 사용해야 합니다 (현재: ${daysSinceBirth}일 경과).`,
    };
  }

  return { isValid: true };
}
