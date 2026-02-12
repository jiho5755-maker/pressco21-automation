import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PayrollRecord, Employee, Department } from "@prisma/client";

// ── 한글 폰트 등록 (Google Fonts CDN) ──
Font.register({
  family: "NotoSansKR",
  src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf",
  fontWeight: 400,
});

Font.register({
  family: "NotoSansKR",
  src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTKoamMx_A.ttf",
  fontWeight: 700,
});

// ── 스타일 정의 ──
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansKR",
    fontSize: 10,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 4,
  },
  section: {
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    borderTop: "1pt solid #333",
    borderLeft: "1pt solid #333",
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
  },
  infoLabel: {
    width: "20%",
    padding: 6,
    backgroundColor: "#f5f5f5",
    borderRight: "1pt solid #333",
    borderBottom: "1pt solid #333",
    fontWeight: 700,
  },
  infoValue: {
    width: "30%",
    padding: 6,
    borderRight: "1pt solid #333",
    borderBottom: "1pt solid #333",
  },
  table: {
    marginBottom: 15,
    borderTop: "1pt solid #333",
    borderLeft: "1pt solid #333",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    padding: 6,
    borderRight: "1pt solid #333",
    borderBottom: "1pt solid #333",
  },
  colLabel: {
    width: "40%",
  },
  colAmount: {
    width: "30%",
    textAlign: "right",
  },
  colNote: {
    width: "30%",
    fontSize: 9,
    color: "#666",
  },
  totalRow: {
    backgroundColor: "#f9f9f9",
    fontWeight: 700,
  },
  netPayRow: {
    backgroundColor: "#fffacd",
    fontWeight: 700,
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    color: "#666",
    lineHeight: 1.8,
  },
});

// ── Props 타입 ──
interface PayslipPDFProps {
  record: PayrollRecord & {
    employee: Employee & {
      department: Department;
    };
  };
}

// ── 금액 포맷팅 ──
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ko-KR") + "원";
};

// ── 임금명세서 PDF 컴포넌트 ──
export function PayslipPDF({ record }: PayslipPDFProps) {
  const { employee } = record;

  // 비과세 금액 계산 (한도: 각 20만원)
  const taxFreeMealAmount = record.taxFreeMeal
    ? Math.min(record.mealAllowance, 200000)
    : 0;
  const taxFreeTransportAmount = record.taxFreeTransport
    ? Math.min(record.transportAllowance, 200000)
    : 0;

  // 총 공제액 계산
  const totalDeductions =
    record.nationalPension +
    record.healthInsurance +
    record.longTermCare +
    record.employmentInsurance +
    record.incomeTax +
    record.localIncomeTax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>임 금 명 세 서</Text>

        {/* 기본 정보 */}
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Text>귀속연월</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>
                {record.year}년 {record.month}월
              </Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>성명</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{employee.name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Text>사원번호</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{employee.employeeNo}</Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>부서</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{employee.department.name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Text>직급</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{employee.position}</Text>
            </View>
            <View style={styles.infoLabel}>
              <Text>지급일</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>
                {record.year}년 {record.month}월 25일
              </Text>
            </View>
          </View>
        </View>

        {/* 지급 항목 */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8 }}>
            ■ 지급 항목
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>항목</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>금액</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>비고</Text>
              </View>
            </View>

            {/* 기본급 */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>기본급</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.baseSalary)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>월 기본급</Text>
              </View>
            </View>

            {/* 수당 */}
            {record.mealAllowance > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.colLabel]}>
                  <Text>식대</Text>
                </View>
                <View style={[styles.tableCol, styles.colAmount]}>
                  <Text>{formatCurrency(record.mealAllowance)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colNote]}>
                  <Text>비과세: {formatCurrency(taxFreeMealAmount)}</Text>
                </View>
              </View>
            )}

            {record.transportAllowance > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.colLabel]}>
                  <Text>교통비</Text>
                </View>
                <View style={[styles.tableCol, styles.colAmount]}>
                  <Text>{formatCurrency(record.transportAllowance)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colNote]}>
                  <Text>
                    비과세: {formatCurrency(taxFreeTransportAmount)}
                  </Text>
                </View>
              </View>
            )}

            {record.positionAllowance > 0 && (
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, styles.colLabel]}>
                  <Text>직책수당</Text>
                </View>
                <View style={[styles.tableCol, styles.colAmount]}>
                  <Text>{formatCurrency(record.positionAllowance)}</Text>
                </View>
                <View style={[styles.tableCol, styles.colNote]}>
                  <Text>과세 대상</Text>
                </View>
              </View>
            )}

            {/* 고정OT 또는 변동수당 */}
            {record.useFixedOT ? (
              <>
                {record.fixedOTAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>고정 연장근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>{formatCurrency(record.fixedOTAmount)}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>포괄임금제</Text>
                    </View>
                  </View>
                )}
                {record.fixedNightWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>고정 야간근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>{formatCurrency(record.fixedNightWorkAmount)}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>포괄임금제</Text>
                    </View>
                  </View>
                )}
                {record.fixedHolidayWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>고정 휴일근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>
                        {formatCurrency(record.fixedHolidayWorkAmount)}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>포괄임금제</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                {record.variableOvertimeAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>연장근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>
                        {formatCurrency(record.variableOvertimeAmount)}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>
                        근태 기반 ({Math.round(record.variableOvertimeMinutes / 60)}시간)
                      </Text>
                    </View>
                  </View>
                )}
                {record.variableNightWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>야간근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>
                        {formatCurrency(record.variableNightWorkAmount)}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>
                        근태 기반 ({Math.round(record.variableNightWorkMinutes / 60)}시간)
                      </Text>
                    </View>
                  </View>
                )}
                {record.variableHolidayWorkAmount > 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colLabel]}>
                      <Text>휴일근로수당</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colAmount]}>
                      <Text>
                        {formatCurrency(record.variableHolidayWorkAmount)}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colNote]}>
                      <Text>
                        근태 기반 ({Math.round(record.variableHolidayMinutes / 60)}시간)
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* 총 지급액 */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>총 지급액</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.totalGross)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>세전 총액</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 공제 항목 */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 700, marginBottom: 8 }}>
            ■ 공제 항목
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>항목</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>금액</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>비고</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>국민연금</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.nationalPension)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>4.75%</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>건강보험</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.healthInsurance)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>3.595%</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>장기요양보험</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.longTermCare)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>건보×13.14%</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>고용보험</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.employmentInsurance)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>0.9%</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>소득세</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.incomeTax)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>간이세액표 기준</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>지방소득세</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(record.localIncomeTax)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>소득세×10%</Text>
              </View>
            </View>

            {/* 총 공제액 */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={[styles.tableCol, styles.colLabel]}>
                <Text>총 공제액</Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(totalDeductions)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colNote]}>
                <Text>4대보험+세금</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 실수령액 */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.netPayRow]}>
            <View style={[styles.tableCol, styles.colLabel]}>
              <Text>실수령액</Text>
            </View>
            <View style={[styles.tableCol, styles.colAmount]}>
              <Text>{formatCurrency(record.netSalary)}</Text>
            </View>
            <View style={[styles.tableCol, styles.colNote]}>
              <Text>지급액-공제액</Text>
            </View>
          </View>
        </View>

        {/* 법적 근거 */}
        <View style={styles.footer}>
          <Text>
            본 임금명세서는 근로기준법 제48조(임금 대장 및 임금명세서)에 따라
            교부되었습니다.
          </Text>
          <Text>
            - 근로기준법 제48조: 사용자는 임금을 지급하는 때에는 근로자에게
            임금의 구성항목·계산방법,
          </Text>
          <Text>
            공제 내역 등 대통령령으로 정하는 사항이 명시된 임금명세서를
            서면(전자문서 포함)으로 교부해야 합니다.
          </Text>
          <Text style={{ marginTop: 10 }}>
            발급일: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월{" "}
            {new Date().getDate()}일
          </Text>
          <Text>발급처: 프레스코21</Text>
        </View>
      </Page>
    </Document>
  );
}
