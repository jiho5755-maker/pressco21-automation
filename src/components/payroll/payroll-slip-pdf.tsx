// 임금 명세서 PDF 템플릿 (고용노동부 표준 양식)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PayrollRecord, Employee, Department } from "@prisma/client";

// 한글 폰트 등록 (로컬 TTF 파일)
Font.register({
  family: "NotoSansKR",
  src: "/fonts/NotoSansKR-Regular.ttf",
});

// PDF 스타일 (고용노동부 표준 양식)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSansKR",
    fontSize: 9,
    lineHeight: 1.4,
  },
  // 제목
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
  },
  // 직원 정보 테이블
  employeeInfoTable: {
    marginBottom: 15,
    border: "1pt solid #000",
  },
  employeeInfoRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },
  employeeInfoRowLast: {
    flexDirection: "row",
  },
  employeeInfoCell: {
    flex: 1,
    flexDirection: "row",
    borderRight: "1pt solid #000",
  },
  employeeInfoCellLast: {
    flex: 1,
    flexDirection: "row",
  },
  employeeInfoLabel: {
    width: "35%",
    padding: 5,
    backgroundColor: "#f0f0f0",
    borderRight: "1pt solid #000",
    fontSize: 8,
  },
  employeeInfoValue: {
    width: "65%",
    padding: 5,
    fontSize: 8,
  },
  // 상세 내역 섹션
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: "1pt solid #000",
  },
  // 2단 레이아웃 (지급/공제)
  twoColumnContainer: {
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
    border: "1pt solid #000",
  },
  columnHeader: {
    padding: 5,
    backgroundColor: "#e0e0e0",
    borderBottom: "1pt solid #000",
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  columnRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e0e0e0",
    minHeight: 20,
  },
  columnRowLast: {
    flexDirection: "row",
    minHeight: 20,
  },
  columnLabel: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    borderRight: "1pt solid #e0e0e0",
  },
  columnLabelIndent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 7,
    color: "#666",
    borderRight: "1pt solid #e0e0e0",
  },
  columnValue: {
    width: "40%",
    padding: 4,
    fontSize: 8,
    textAlign: "right",
  },
  columnTotal: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
  },
  columnTotalLabel: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    borderRight: "1pt solid #e0e0e0",
  },
  columnTotalValue: {
    width: "40%",
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  // 실수령액 (노란 배경)
  netSalaryContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff5cc",
    border: "2pt solid #000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netSalaryLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  netSalaryValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  // 계산 방법 섹션
  calculationSection: {
    marginTop: 20,
  },
  calculationRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  calculationLabel: {
    width: "25%",
    fontSize: 8,
    color: "#666",
  },
  calculationFormula: {
    width: "75%",
    fontSize: 8,
    color: "#333",
  },
  // 주의사항
  note: {
    marginTop: 15,
    padding: 8,
    backgroundColor: "#f9f9f9",
    border: "1pt solid #ccc",
    fontSize: 7,
    color: "#666",
  },
  // 푸터
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1pt solid #ccc",
    fontSize: 7,
    color: "#999",
    textAlign: "center",
  },
});

// 금액 포맷팅
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR");
}

interface PayrollSlipPDFProps {
  record: PayrollRecord & {
    employee: Employee & {
      department: Department;
    };
  };
  companyName?: string;
  businessNumber?: string;
}

export function PayrollSlipPDF({
  record,
  companyName = "주식회사 프레스코21",
  businessNumber = "000-00-00000",
}: PayrollSlipPDFProps) {
  const { employee } = record;
  const yearMonth = `${record.year}년 ${record.month}월`;

  // 비과세 금액 계산
  const taxFreeMealAmount = record.taxFreeMeal
    ? Math.min(record.mealAllowance, 200000)
    : 0;
  const taxFreeTransportAmount = record.taxFreeTransport
    ? Math.min(record.transportAllowance, 200000)
    : 0;
  const totalTaxFree = taxFreeMealAmount + taxFreeTransportAmount;

  // 과세 대상 계산
  const taxableGross = record.totalGross - totalTaxFree;

  // 공제 합계
  const totalDeduction =
    record.totalInsurance + record.incomeTax + record.localIncomeTax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>임금 명세서</Text>

        {/* 1. 직원 정보 (2행 × 3셀) */}
        <View style={styles.employeeInfoTable}>
          {/* 첫째 행 */}
          <View style={styles.employeeInfoRow}>
            <View style={styles.employeeInfoCell}>
              <Text style={styles.employeeInfoLabel}>성명</Text>
              <Text style={styles.employeeInfoValue}>{employee.name}</Text>
            </View>
            <View style={styles.employeeInfoCell}>
              <Text style={styles.employeeInfoLabel}>사번</Text>
              <Text style={styles.employeeInfoValue}>
                {employee.employeeNo}
              </Text>
            </View>
            <View style={styles.employeeInfoCellLast}>
              <Text style={styles.employeeInfoLabel}>부서</Text>
              <Text style={styles.employeeInfoValue}>
                {employee.department.name}
              </Text>
            </View>
          </View>

          {/* 둘째 행 */}
          <View style={styles.employeeInfoRowLast}>
            <View style={styles.employeeInfoCell}>
              <Text style={styles.employeeInfoLabel}>직급</Text>
              <Text style={styles.employeeInfoValue}>{employee.position}</Text>
            </View>
            <View style={styles.employeeInfoCell}>
              <Text style={styles.employeeInfoLabel}>귀속년월</Text>
              <Text style={styles.employeeInfoValue}>{yearMonth}</Text>
            </View>
            <View style={styles.employeeInfoCellLast}>
              <Text style={styles.employeeInfoLabel}>지급일</Text>
              <Text style={styles.employeeInfoValue}>
                {yearMonth} 말일 (추정)
              </Text>
            </View>
          </View>
        </View>

        {/* 상세 내역 제목 */}
        <Text style={styles.sectionTitle}>상세 내역</Text>

        {/* 2단 레이아웃: 지급 내역 | 공제 내역 */}
        <View style={styles.twoColumnContainer}>
          {/* 왼쪽: 지급 내역 */}
          <View style={styles.column}>
            <Text style={styles.columnHeader}>지급 내역</Text>

            {/* 기본급 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabel}>기본급</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.baseSalary)}
              </Text>
            </View>

            {/* 식대 */}
            {record.mealAllowance > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>
                  식대 {record.taxFreeMeal && "(비과세)"}
                </Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.mealAllowance)}
                </Text>
              </View>
            )}

            {/* 교통비 */}
            {record.transportAllowance > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>
                  교통비 {record.taxFreeTransport && "(비과세)"}
                </Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.transportAllowance)}
                </Text>
              </View>
            )}

            {/* 직책수당 */}
            {record.positionAllowance > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>직책수당</Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.positionAllowance)}
                </Text>
              </View>
            )}

            {/* 고정OT (포괄임금) */}
            {record.useFixedOT && (
              <>
                {record.fixedOTAmount > 0 && (
                  <View style={styles.columnRow}>
                    <Text style={styles.columnLabelIndent}>
                      고정 연장수당
                    </Text>
                    <Text style={styles.columnValue}>
                      {formatCurrency(record.fixedOTAmount)}
                    </Text>
                  </View>
                )}
                {record.fixedNightWorkAmount > 0 && (
                  <View style={styles.columnRow}>
                    <Text style={styles.columnLabelIndent}>
                      고정 야간수당
                    </Text>
                    <Text style={styles.columnValue}>
                      {formatCurrency(record.fixedNightWorkAmount)}
                    </Text>
                  </View>
                )}
                {record.fixedHolidayWorkAmount > 0 && (
                  <View style={styles.columnRow}>
                    <Text style={styles.columnLabelIndent}>
                      고정 휴일수당
                    </Text>
                    <Text style={styles.columnValue}>
                      {formatCurrency(record.fixedHolidayWorkAmount)}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* 변동 수당 (근태 기반) */}
            {record.variableOvertimeAmount > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>
                  연장수당 ({Math.floor(record.variableOvertimeMinutes / 60)}h)
                </Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.variableOvertimeAmount)}
                </Text>
              </View>
            )}
            {record.variableNightWorkAmount > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>
                  야간수당 ({Math.floor(record.variableNightWorkMinutes / 60)}
                  h)
                </Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.variableNightWorkAmount)}
                </Text>
              </View>
            )}
            {record.variableHolidayWorkAmount > 0 && (
              <View style={styles.columnRow}>
                <Text style={styles.columnLabelIndent}>
                  휴일수당 ({Math.floor(record.variableHolidayMinutes / 60)}h)
                </Text>
                <Text style={styles.columnValue}>
                  {formatCurrency(record.variableHolidayWorkAmount)}
                </Text>
              </View>
            )}

            {/* 지급 총액 */}
            <View style={styles.columnTotal}>
              <Text style={styles.columnTotalLabel}>지급 총액</Text>
              <Text style={styles.columnTotalValue}>
                {formatCurrency(record.totalGross)}
              </Text>
            </View>
          </View>

          {/* 오른쪽: 공제 내역 */}
          <View style={styles.column}>
            <Text style={styles.columnHeader}>공제 내역</Text>

            {/* 국민연금 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabel}>국민연금</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.nationalPension)}
              </Text>
            </View>

            {/* 건강보험 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabel}>건강보험</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.healthInsurance)}
              </Text>
            </View>

            {/* 장기요양보험 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabelIndent}>장기요양보험</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.longTermCare)}
              </Text>
            </View>

            {/* 고용보험 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabel}>고용보험</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.employmentInsurance)}
              </Text>
            </View>

            {/* 소득세 */}
            <View style={styles.columnRow}>
              <Text style={styles.columnLabel}>소득세</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.incomeTax)}
              </Text>
            </View>

            {/* 지방소득세 */}
            <View style={styles.columnRowLast}>
              <Text style={styles.columnLabelIndent}>지방소득세</Text>
              <Text style={styles.columnValue}>
                {formatCurrency(record.localIncomeTax)}
              </Text>
            </View>

            {/* 공제 총액 */}
            <View style={styles.columnTotal}>
              <Text style={styles.columnTotalLabel}>공제 총액</Text>
              <Text style={styles.columnTotalValue}>
                {formatCurrency(totalDeduction)}
              </Text>
            </View>
          </View>
        </View>

        {/* 실수령액 (노란 배경) */}
        <View style={styles.netSalaryContainer}>
          <Text style={styles.netSalaryLabel}>실수령액</Text>
          <Text style={styles.netSalaryValue}>
            {formatCurrency(record.netSalary)}원
          </Text>
        </View>

        {/* 2. 계산 방법 (고용노동부 표준) */}
        <View style={styles.calculationSection}>
          <Text style={styles.sectionTitle}>2. 계산 방법</Text>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>과세 대상</Text>
            <Text style={styles.calculationFormula}>
              지급 총액 {formatCurrency(record.totalGross)} - 비과세{" "}
              {formatCurrency(totalTaxFree)} = {formatCurrency(taxableGross)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>국민연금</Text>
            <Text style={styles.calculationFormula}>
              과세 대상 × 4.75% (상한 637만원) ={" "}
              {formatCurrency(record.nationalPension)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>건강보험</Text>
            <Text style={styles.calculationFormula}>
              과세 대상 × 3.595% (상한 1,270만원) ={" "}
              {formatCurrency(record.healthInsurance)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>장기요양보험</Text>
            <Text style={styles.calculationFormula}>
              건강보험료 × 13.14% = {formatCurrency(record.longTermCare)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>고용보험</Text>
            <Text style={styles.calculationFormula}>
              과세 대상 × 0.9% = {formatCurrency(record.employmentInsurance)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>소득세</Text>
            <Text style={styles.calculationFormula}>
              간이세액표 적용 (부양가족 {employee.childrenUnder20}명) ={" "}
              {formatCurrency(record.incomeTax)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>지방소득세</Text>
            <Text style={styles.calculationFormula}>
              소득세 × 10% = {formatCurrency(record.localIncomeTax)}원
            </Text>
          </View>

          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>실수령액</Text>
            <Text style={styles.calculationFormula}>
              지급 총액 {formatCurrency(record.totalGross)} - 공제 총액{" "}
              {formatCurrency(totalDeduction)} = {formatCurrency(record.netSalary)}
              원
            </Text>
          </View>
        </View>

        {/* 비과세 안내 */}
        {totalTaxFree > 0 && (
          <View style={styles.note}>
            <Text>
              ※ 비과세 한도: 식대 월 20만원, 교통비 월 20만원 (소득세법 시행령
              제12조)
            </Text>
          </View>
        )}

        {/* 포괄임금제 안내 */}
        {record.useFixedOT && (
          <View style={styles.note}>
            <Text>
              ※ 본 급여는 포괄임금제(서면 합의)가 적용되어 고정 가산수당이
              포함되어 있습니다.
            </Text>
          </View>
        )}

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>
            {companyName} (사업자등록번호: {businessNumber})
          </Text>
          <Text style={{ marginTop: 3 }}>
            발행일: {new Date().toLocaleDateString("ko-KR")} | 문의: 인사팀
          </Text>
          <Text style={{ marginTop: 3 }}>
            ※ 본 명세서는 근로기준법 제48조에 따른 임금명세서입니다.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
