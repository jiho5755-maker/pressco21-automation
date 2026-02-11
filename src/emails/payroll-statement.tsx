/**
 * 급여명세서 이메일 템플릿
 *
 * Phase 3-D: 알림 시스템 - 급여명세서 자동 발송
 * - 매월 급여일(25일) 오전 9시 자동 발송
 * - 급여 구성 항목 표시 (기본급, 수당, 공제, 실수령액)
 */

import { Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "./email-layout";

interface PayrollStatementProps {
  /** 직원명 */
  employeeName: string;
  /** 지급 연도 */
  year: number;
  /** 지급 월 */
  month: number;
  /** 지급일 (YYYY-MM-DD) */
  paymentDate: string;

  // 급여 구성 (기본급 + 수당)
  /** 기본급 */
  baseSalary: number;
  /** 식대 */
  mealAllowance: number;
  /** 교통비 */
  transportAllowance: number;
  /** 직책수당 */
  positionAllowance: number;

  // 고정OT
  /** 고정 연장수당 */
  fixedOTAmount?: number;
  /** 고정 야간수당 */
  fixedNightWorkAmount?: number;
  /** 고정 휴일수당 */
  fixedHolidayWorkAmount?: number;

  // 변동 수당
  /** 변동 연장수당 */
  variableOvertimeAmount?: number;
  /** 변동 야간수당 */
  variableNightWorkAmount?: number;
  /** 변동 휴일수당 */
  variableHolidayWorkAmount?: number;

  // 급여 합계
  /** 총 급여 */
  totalGross: number;
  /** 과세 대상 급여 */
  totalTaxable: number;

  // 공제 항목
  /** 국민연금 */
  nationalPension: number;
  /** 건강보험 */
  healthInsurance: number;
  /** 장기요양 */
  longTermCare: number;
  /** 고용보험 */
  employmentInsurance: number;
  /** 총 4대보험 */
  totalInsurance: number;
  /** 소득세 */
  incomeTax: number;
  /** 지방소득세 */
  localIncomeTax: number;

  // 실수령액
  /** 실수령액 */
  netSalary: number;
}

/**
 * 금액 포맷팅 (천 단위 콤마 + "원")
 */
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * 급여명세서 이메일 템플릿
 */
export default function PayrollStatement({
  employeeName,
  year,
  month,
  paymentDate,
  baseSalary,
  mealAllowance,
  transportAllowance,
  positionAllowance,
  fixedOTAmount = 0,
  fixedNightWorkAmount = 0,
  fixedHolidayWorkAmount = 0,
  variableOvertimeAmount = 0,
  variableNightWorkAmount = 0,
  variableHolidayWorkAmount = 0,
  totalGross,
  totalTaxable,
  nationalPension,
  healthInsurance,
  longTermCare,
  employmentInsurance,
  totalInsurance,
  incomeTax,
  localIncomeTax,
  netSalary,
}: PayrollStatementProps) {
  const totalFixedOT = fixedOTAmount + fixedNightWorkAmount + fixedHolidayWorkAmount;
  const totalVariableAllowance =
    variableOvertimeAmount + variableNightWorkAmount + variableHolidayWorkAmount;

  return (
    <EmailLayout
      preview={`${year}년 ${month}월 급여명세서가 발급되었습니다.`}
      title={`${year}년 ${month}월 급여명세서`}
      titleColor="#16a34a"
    >
      {/* 인사말 */}
      <Text style={emailStyles.paragraph}>
        안녕하세요, <strong>{employeeName}</strong>님.
      </Text>
      <Text style={emailStyles.paragraph}>
        {year}년 {month}월 급여명세서가 발급되었습니다. 하단 내역을 확인해주세요.
      </Text>

      {/* 지급일 */}
      <Section style={emailStyles.infoBox}>
        <Text style={salaryItemLabel}>지급일</Text>
        <Text style={salaryItemValue}>{paymentDate}</Text>
      </Section>

      {/* 급여 구성 항목 */}
      <Section style={sectionBox}>
        <Text style={sectionTitle}>💰 급여 구성</Text>

        <SalaryItem label="기본급" amount={baseSalary} />
        <SalaryItem label="식대" amount={mealAllowance} />
        <SalaryItem label="교통비" amount={transportAllowance} />
        {positionAllowance > 0 && (
          <SalaryItem label="직책수당" amount={positionAllowance} />
        )}

        {/* 고정OT (포괄임금제) */}
        {totalFixedOT > 0 && (
          <>
            {fixedOTAmount > 0 && (
              <SalaryItem label="고정 연장수당" amount={fixedOTAmount} />
            )}
            {fixedNightWorkAmount > 0 && (
              <SalaryItem label="고정 야간수당" amount={fixedNightWorkAmount} />
            )}
            {fixedHolidayWorkAmount > 0 && (
              <SalaryItem label="고정 휴일수당" amount={fixedHolidayWorkAmount} />
            )}
          </>
        )}

        {/* 변동 수당 (근태 기반) */}
        {totalVariableAllowance > 0 && (
          <>
            {variableOvertimeAmount > 0 && (
              <SalaryItem label="연장근로 수당" amount={variableOvertimeAmount} />
            )}
            {variableNightWorkAmount > 0 && (
              <SalaryItem label="야간근로 수당" amount={variableNightWorkAmount} />
            )}
            {variableHolidayWorkAmount > 0 && (
              <SalaryItem label="휴일근로 수당" amount={variableHolidayWorkAmount} />
            )}
          </>
        )}

        {/* 총 급여 */}
        <SalaryItem label="총 급여" amount={totalGross} isBold />
        <SalaryItem
          label="과세 대상 급여"
          amount={totalTaxable}
          helpText="(비과세 제외)"
        />
      </Section>

      {/* 공제 항목 */}
      <Section style={sectionBox}>
        <Text style={sectionTitle}>💳 공제 항목</Text>

        <SalaryItem label="국민연금" amount={nationalPension} isDeduction />
        <SalaryItem label="건강보험" amount={healthInsurance} isDeduction />
        <SalaryItem label="장기요양보험" amount={longTermCare} isDeduction />
        <SalaryItem label="고용보험" amount={employmentInsurance} isDeduction />
        <SalaryItem label="소득세" amount={incomeTax} isDeduction />
        <SalaryItem label="지방소득세" amount={localIncomeTax} isDeduction />

        {/* 총 공제 */}
        <SalaryItem
          label="총 공제"
          amount={totalInsurance + incomeTax + localIncomeTax}
          isDeduction
          isBold
        />
      </Section>

      {/* 실수령액 */}
      <Section style={netSalaryBox}>
        <Text style={netSalaryLabel}>실수령액</Text>
        <Text style={netSalaryValue}>{formatCurrency(netSalary)}</Text>
      </Section>

      {/* 안내 문구 */}
      <Text style={emailStyles.paragraph}>
        급여 내역에 대해 문의사항이 있으시면 인사팀으로 연락 주시기 바랍니다.
      </Text>
    </EmailLayout>
  );
}

// ============================================================================
// 재사용 컴포넌트
// ============================================================================

interface SalaryItemProps {
  label: string;
  amount: number;
  helpText?: string;
  isBold?: boolean;
  isDeduction?: boolean;
}

function SalaryItem({
  label,
  amount,
  helpText,
  isBold = false,
  isDeduction = false,
}: SalaryItemProps) {
  return (
    <Section style={salaryItemRow}>
      <Text style={isBold ? salaryItemLabelBold : salaryItemLabel}>
        {label} {helpText && <span style={{ color: "#64748b" }}>{helpText}</span>}
      </Text>
      <Text
        style={{
          ...(isBold ? salaryItemValueBold : salaryItemValue),
          ...(isDeduction && { color: "#dc2626" }),
        }}
      >
        {isDeduction && "- "}
        {formatCurrency(amount)}
      </Text>
    </Section>
  );
}

// ============================================================================
// 스타일 정의
// ============================================================================

const sectionBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 16px",
};

const salaryItemRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #e2e8f0",
};

const salaryItemLabel = {
  color: "#64748b",
  fontSize: "14px",
  margin: "0",
};

const salaryItemLabelBold = {
  ...salaryItemLabel,
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
};

const salaryItemValue = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  textAlign: "right" as const,
};

const salaryItemValueBold = {
  ...salaryItemValue,
  fontSize: "16px",
  fontWeight: "700",
};

const netSalaryBox = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const netSalaryLabel = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const netSalaryValue = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0",
};
