// 정부지원사업 자격 판단 유틸리티 (Phase 2)
// 패턴: leave-calculator.ts, salary-calculator.ts와 동일하게 순수 함수로 구현

import { prisma } from "@/lib/prisma";
import { GOVERNMENT_SUBSIDIES_2026 } from "@/lib/constants";
import { differenceInMonths } from "date-fns";

/**
 * 지원금 자격 판단 결과 타입
 */
export interface SubsidyEligibility {
  eligible: boolean; // 자격 충족 여부
  reason?: string; // 부적격 사유
  calculatedAmount: number; // 계산된 지원금 금액
  details?: Record<string, unknown>; // 추가 상세 정보
}

/**
 * 나이 계산 헬퍼 함수
 * @param birthDate 생년월일
 * @returns 만 나이
 */
function calculateAge(birthDate: Date | null | undefined): number {
  if (!birthDate) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

/**
 * 1. 유연근무 장려금 자격 판단
 * 조건:
 * - workType이 "FLEXIBLE_HOURS"|"REMOTE"|"HYBRID"
 * - 해당 월 유연근무 사용 횟수 ≥ 4회
 * - 입사 후 3개월 경과
 * @param employee 직원 정보
 * @param year 귀속 연도
 * @param month 귀속 월
 * @param flexibleWorkCount 해당 월 유연근무 사용 횟수
 * @returns 자격 판단 결과 (월 60만원, 최대 12개월)
 */
export function checkFlexibleWorkEligibility(
  employee: {
    workType: string;
    joinDate: Date;
  },
  year: number,
  month: number,
  flexibleWorkCount: number
): SubsidyEligibility {
  const { maxPerMonth, minUsagePerMonth } =
    GOVERNMENT_SUBSIDIES_2026.flexibleWork;

  // 조건 1: 유연근무 형태 확인
  if (
    !["FLEXIBLE_HOURS", "REMOTE", "HYBRID"].includes(employee.workType)
  ) {
    return {
      eligible: false,
      reason: "유연근무 형태가 아닙니다. (시차출퇴근/재택근무/하이브리드만 가능)",
      calculatedAmount: 0,
    };
  }

  // 조건 2: 월 최소 사용 횟수 확인
  if (flexibleWorkCount < minUsagePerMonth) {
    return {
      eligible: false,
      reason: `월 ${minUsagePerMonth}회 이상 유연근무를 사용해야 합니다. (현재: ${flexibleWorkCount}회)`,
      calculatedAmount: 0,
    };
  }

  // 조건 3: 입사 후 3개월 경과 확인
  const referenceDate = new Date(year, month - 1, 1);
  const monthsSinceJoin = differenceInMonths(referenceDate, employee.joinDate);
  if (monthsSinceJoin < 3) {
    return {
      eligible: false,
      reason: "입사 후 3개월이 경과해야 신청 가능합니다.",
      calculatedAmount: 0,
    };
  }

  return {
    eligible: true,
    calculatedAmount: maxPerMonth,
    details: {
      workType: employee.workType,
      flexibleWorkCount,
      minUsagePerMonth,
    },
  };
}

/**
 * 2. 출산육아기 대체인력 지원금 자격 판단
 * 조건:
 * - 휴직자 status="ON_LEAVE", leaveType="MATERNITY"|"PARENTAL"
 * - 대체인력 contractType="REPLACEMENT"
 * - 대체인력 근무 시작일이 휴직 시작일 이후
 * @param employee 휴직자 정보
 * @param replacementEmployee 대체인력 정보
 * @param replacementStartDate 대체인력 근무 시작일
 * @returns 자격 판단 결과 (30세 미만 140만, 30세 이상 130만)
 */
export function checkReplacementWorkerEligibility(
  employee: {
    status: string;
    leaveType: string | null;
    leaveStartDate: Date | null;
  },
  replacementEmployee: {
    contractType: string;
    birthDate: Date | null;
    joinDate: Date;
  },
  replacementStartDate: Date
): SubsidyEligibility {
  const { under30, over30 } = GOVERNMENT_SUBSIDIES_2026.replacementWorker;

  // 조건 1: 휴직자 상태 확인
  if (employee.status !== "ON_LEAVE") {
    return {
      eligible: false,
      reason: "휴직 상태가 아닙니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 2: 휴직 유형 확인 (출산휴가 또는 육아휴직)
  if (!["MATERNITY", "PARENTAL"].includes(employee.leaveType || "")) {
    return {
      eligible: false,
      reason: "출산휴가 또는 육아휴직 상태여야 합니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 3: 대체인력 계약 유형 확인
  if (replacementEmployee.contractType !== "REPLACEMENT") {
    return {
      eligible: false,
      reason: "대체인력 계약 유형이 아닙니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 4: 대체인력 근무 시작일 검증
  if (
    employee.leaveStartDate &&
    replacementStartDate < employee.leaveStartDate
  ) {
    return {
      eligible: false,
      reason: "대체인력 근무 시작일이 휴직 시작일보다 빠릅니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 5: 대체인력 나이 기반 금액 산정
  const age = calculateAge(replacementEmployee.birthDate);
  const amount = age < 30 ? under30 : over30;

  return {
    eligible: true,
    calculatedAmount: amount,
    details: {
      leaveType: employee.leaveType,
      replacementAge: age,
      replacementStartDate,
    },
  };
}

/**
 * 3. 육아휴직 부여 지원금 자격 판단
 * 조건:
 * - status="ON_LEAVE", leaveType="PARENTAL"
 * - 자녀 출생일 기준 18개월 이내
 * @param employee 직원 정보
 * @param childBirthDate 자녀 출생일
 * @param year 귀속 연도
 * @param month 귀속 월
 * @returns 자격 판단 결과 (월 30만 + 12개월 미만 자녀 100만 일시금)
 */
export function checkParentalLeaveGrantEligibility(
  employee: {
    status: string;
    leaveType: string | null;
    leaveStartDate: Date | null;
  },
  childBirthDate: Date,
  year: number,
  month: number
): SubsidyEligibility {
  const { monthly, under12MonthChild } =
    GOVERNMENT_SUBSIDIES_2026.parentalLeaveGrant;

  // 조건 1: 휴직 상태 확인
  if (employee.status !== "ON_LEAVE") {
    return {
      eligible: false,
      reason: "휴직 상태가 아닙니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 2: 육아휴직 확인
  if (employee.leaveType !== "PARENTAL") {
    return {
      eligible: false,
      reason: "육아휴직 상태여야 합니다.",
      calculatedAmount: 0,
    };
  }

  // 조건 3: 자녀 연령 확인 (18개월 이내)
  const referenceDate = new Date(year, month - 1, 1);
  const childAgeInMonths = differenceInMonths(referenceDate, childBirthDate);

  if (childAgeInMonths < 0) {
    return {
      eligible: false,
      reason: "자녀 출생일이 미래입니다.",
      calculatedAmount: 0,
    };
  }

  if (childAgeInMonths > 18) {
    return {
      eligible: false,
      reason: "자녀 출생일 기준 18개월 이내에만 신청 가능합니다.",
      calculatedAmount: 0,
      details: {
        childAgeInMonths,
      },
    };
  }

  // 금액 계산: 월 30만 + (12개월 미만 자녀면 100만 일시금)
  const amount = childAgeInMonths < 12 ? monthly + under12MonthChild : monthly;

  return {
    eligible: true,
    calculatedAmount: amount,
    details: {
      childAgeInMonths,
      monthlyGrant: monthly,
      lumpSumGrant: childAgeInMonths < 12 ? under12MonthChild : 0,
    },
  };
}

/**
 * 4. 업무분담 지원금 자격 판단
 * 조건:
 * - weeklyWorkHours < 40 (주당 소정근로시간 단축)
 * @param employee 직원 정보
 * @returns 자격 판단 결과 (30세 미만 60만, 30세 이상 40만)
 */
export function checkWorkSharingEligibility(employee: {
  birthDate: Date | null;
  weeklyWorkHours: number;
}): SubsidyEligibility {
  const { under30, over30 } = GOVERNMENT_SUBSIDIES_2026.workSharingGrant;

  // 조건 1: 주당 소정근로시간 단축 확인
  if (employee.weeklyWorkHours >= 40) {
    return {
      eligible: false,
      reason: "주당 소정근로시간이 40시간 이상입니다. (주당 근로시간 단축 필요)",
      calculatedAmount: 0,
    };
  }

  // 조건 2: 나이 기반 금액 산정
  const age = calculateAge(employee.birthDate);
  const amount = age < 30 ? under30 : over30;

  return {
    eligible: true,
    calculatedAmount: amount,
    details: {
      age,
      weeklyWorkHours: employee.weeklyWorkHours,
    },
  };
}

/**
 * 5. 유연근무 인프라 구축비 자격 판단
 * 조건:
 * - 회사 전체 신청 (직원별 아님)
 * - 30세 미만 직원 1명 이상
 * @param year 귀속 연도
 * @param totalEmployeesUnder30 30세 미만 직원 수
 * @returns 자격 판단 결과 (연 180만원)
 */
export function checkInfraSupportEligibility(
  year: number,
  totalEmployeesUnder30: number
): SubsidyEligibility {
  const { maxPerYear } = GOVERNMENT_SUBSIDIES_2026.infraSupport;

  // 조건 1: 30세 미만 직원 1명 이상
  if (totalEmployeesUnder30 < 1) {
    return {
      eligible: false,
      reason: "30세 미만 직원이 1명 이상 있어야 합니다.",
      calculatedAmount: 0,
    };
  }

  return {
    eligible: true,
    calculatedAmount: maxPerYear,
    details: {
      year,
      totalEmployeesUnder30,
    },
  };
}

/**
 * 중복 신청 검증
 * @param employeeId 직원 ID
 * @param type 지원금 유형
 * @param year 귀속 연도
 * @param month 귀속 월
 * @returns 중복 신청 여부 (true: 이미 신청됨, false: 신청 가능)
 */
export async function checkDuplicateApplication(
  employeeId: string,
  type: string,
  year: number,
  month: number
): Promise<boolean> {
  const existing = await prisma.subsidyApplication.findUnique({
    where: {
      employeeId_type_year_month: {
        employeeId,
        type,
        year,
        month,
      },
    },
  });

  return !!existing;
}
