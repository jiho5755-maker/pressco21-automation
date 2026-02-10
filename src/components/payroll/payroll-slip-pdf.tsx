// 급여명세서 PDF 템플릿 (@react-pdf/renderer)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PayrollRecord, Employee, Department } from "@prisma/client";

// 한글 폰트 등록 (Pretendard - jsDelivr CDN)
// Pretendard: 한국어 최적화 폰트, @react-pdf/renderer 호환
Font.register({
  family: "Pretendard",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Regular.otf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf",
      fontWeight: 700,
    },
  ],
});

// PDF 스타일
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Pretendard", // 한글 폰트 (jsDelivr CDN)
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#666",
  },
  companyInfo: {
    marginTop: 10,
    fontSize: 9,
    color: "#666",
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: "1pt solid #ccc",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    width: "30%",
    color: "#666",
  },
  infoValue: {
    width: "70%",
    fontWeight: 700,
  },
  table: {
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #eee",
    paddingVertical: 5,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  tableLabel: {
    width: "50%",
    paddingLeft: 5,
  },
  tableValue: {
    width: "50%",
    textAlign: "right",
    paddingRight: 5,
  },
  tableLabelIndent: {
    width: "50%",
    paddingLeft: 15,
    fontSize: 9,
    color: "#666",
  },
  tableLabelBold: {
    width: "50%",
    paddingLeft: 5,
    fontWeight: 700,
  },
  tableValueBold: {
    width: "50%",
    textAlign: "right",
    paddingRight: 5,
    fontWeight: 700,
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: "#666",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  netSalaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2pt solid #000",
  },
  netSalaryLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  netSalaryValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2563eb",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1pt solid #ccc",
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  note: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fffbeb",
    borderLeft: "3pt solid #f59e0b",
    fontSize: 8,
    color: "#92400e",
  },
});

// 금액 포맷팅
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>급여 명세서</Text>
          <Text style={styles.subtitle}>{yearMonth} 귀속</Text>
          <View style={styles.companyInfo}>
            <Text>{companyName}</Text>
            <Text>사업자등록번호: {businessNumber}</Text>
          </View>
        </View>

        {/* 직원 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직원 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>사번</Text>
            <Text style={styles.infoValue}>{employee.employeeNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>성명</Text>
            <Text style={styles.infoValue}>{employee.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>부서</Text>
            <Text style={styles.infoValue}>{employee.department.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>직급</Text>
            <Text style={styles.infoValue}>{employee.position}</Text>
          </View>
        </View>

        {/* 급여 내역 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>급여 내역</Text>
          <View style={styles.table}>
            {/* 기본급 */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>기본급</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.baseSalary)}
              </Text>
            </View>

            {/* 수당 */}
            {record.mealAllowance > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>
                  식대 {record.taxFreeMeal && "(비과세)"}
                </Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.mealAllowance)}
                </Text>
              </View>
            )}
            {record.transportAllowance > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>
                  교통비 {record.taxFreeTransport && "(비과세)"}
                </Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.transportAllowance)}
                </Text>
              </View>
            )}
            {record.positionAllowance > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>직책수당</Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.positionAllowance)}
                </Text>
              </View>
            )}

            {/* 고정OT (포괄임금제) */}
            {record.useFixedOT && (
              <>
                {record.fixedOTAmount > 0 && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabelIndent}>
                      고정 연장수당 (포괄임금)
                    </Text>
                    <Text style={styles.tableValue}>
                      {formatCurrency(record.fixedOTAmount)}
                    </Text>
                  </View>
                )}
                {record.fixedNightWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabelIndent}>
                      고정 야간수당 (포괄임금)
                    </Text>
                    <Text style={styles.tableValue}>
                      {formatCurrency(record.fixedNightWorkAmount)}
                    </Text>
                  </View>
                )}
                {record.fixedHolidayWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabelIndent}>
                      고정 휴일수당 (포괄임금)
                    </Text>
                    <Text style={styles.tableValue}>
                      {formatCurrency(record.fixedHolidayWorkAmount)}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* 변동 수당 (근태 기반) */}
            {record.variableOvertimeAmount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>
                  연장수당 ({Math.floor(record.variableOvertimeMinutes / 60)}시간)
                </Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.variableOvertimeAmount)}
                </Text>
              </View>
            )}
            {record.variableNightWorkAmount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>
                  야간수당 ({Math.floor(record.variableNightWorkMinutes / 60)}시간)
                </Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.variableNightWorkAmount)}
                </Text>
              </View>
            )}
            {record.variableHolidayWorkAmount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabelIndent}>
                  휴일수당 ({Math.floor(record.variableHolidayMinutes / 60)}시간)
                </Text>
                <Text style={styles.tableValue}>
                  {formatCurrency(record.variableHolidayWorkAmount)}
                </Text>
              </View>
            )}

            {/* 총 지급액 */}
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabelBold}>총 지급액</Text>
              <Text style={styles.tableValueBold}>
                {formatCurrency(record.totalGross)}
              </Text>
            </View>
          </View>
        </View>

        {/* 공제 내역 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공제 내역</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>국민연금</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.nationalPension)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>건강보험</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.healthInsurance)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabelIndent}>장기요양보험</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.longTermCare)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>고용보험</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.employmentInsurance)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>소득세</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.incomeTax)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabelIndent}>지방소득세</Text>
              <Text style={styles.tableValue}>
                {formatCurrency(record.localIncomeTax)}
              </Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabelBold}>총 공제액</Text>
              <Text style={styles.tableValueBold}>
                {formatCurrency(
                  record.totalInsurance + record.incomeTax + record.localIncomeTax
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* 실수령액 */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>총 지급액</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(record.totalGross)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>총 공제액</Text>
            <Text style={styles.totalValue}>
              -{" "}
              {formatCurrency(
                record.totalInsurance + record.incomeTax + record.localIncomeTax
              )}
            </Text>
          </View>
          <View style={styles.netSalaryRow}>
            <Text style={styles.netSalaryLabel}>실수령액</Text>
            <Text style={styles.netSalaryValue}>
              {formatCurrency(record.netSalary)}
            </Text>
          </View>
        </View>

        {/* 비과세 안내 */}
        {(taxFreeMealAmount > 0 || taxFreeTransportAmount > 0) && (
          <View style={styles.note}>
            <Text>
              ※ 비과세 한도: 식대 {formatCurrency(taxFreeMealAmount)}, 교통비{" "}
              {formatCurrency(taxFreeTransportAmount)}
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
            본 명세서는 {yearMonth} 귀속 급여 내역입니다. 문의사항은
            인사팀으로 연락주시기 바랍니다.
          </Text>
          <Text style={{ marginTop: 5 }}>
            발행일: {new Date().toLocaleDateString("ko-KR")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
