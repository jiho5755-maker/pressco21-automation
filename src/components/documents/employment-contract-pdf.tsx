// 근로계약서 PDF 템플릿 (근로기준법 제17조 준수)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Employee, Department } from "@prisma/client";
import type { EmploymentContractContent } from "@/types/document";

/**
 * 한글 폰트 등록 (Noto Sans KR)
 * - Regular (400): 기본 텍스트
 * - Bold (700): 제목/강조
 */
Font.register({
  family: "NotoSansKR",
  src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf",
  fontWeight: 400,
});

Font.register({
  family: "NotoSansKR",
  src: "https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf",
  fontWeight: 700,
});

// PDF 스타일
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansKR",
    fontSize: 10,
    lineHeight: 1.5,
  },
  // 제목
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 25,
  },
  // 섹션 제목
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "2pt solid #000",
  },
  // 테이블
  table: {
    border: "1pt solid #000",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableLabel: {
    width: "30%",
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRight: "1pt solid #ccc",
    fontSize: 9,
    fontWeight: 700,
  },
  tableValue: {
    width: "70%",
    padding: 8,
    fontSize: 9,
  },
  // 항목 리스트
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 10,
  },
  listNumber: {
    width: 20,
    fontSize: 9,
    fontWeight: 700,
  },
  listContent: {
    flex: 1,
    fontSize: 9,
  },
  // 법정 문구 박스
  legalNotice: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fffacd",
    border: "2pt solid #ffa500",
  },
  legalNoticeTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  legalNoticeText: {
    fontSize: 8,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  // 서명란
  signatureSection: {
    marginTop: 30,
    padding: 15,
    border: "1pt solid #000",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 25,
  },
  signatureLine: {
    borderBottom: "1pt solid #000",
    marginTop: 5,
    paddingBottom: 3,
    fontSize: 9,
    textAlign: "center",
  },
  // 푸터
  footer: {
    marginTop: 25,
    paddingTop: 10,
    borderTop: "1pt solid #ccc",
    fontSize: 7,
    color: "#666",
    textAlign: "center",
  },
});

// 금액 포맷팅
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR");
}

// 날짜 포맷팅
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface EmploymentContractPDFProps {
  employee: Employee & {
    department: Department;
  };
  content: EmploymentContractContent;
}

export function EmploymentContractPDF({
  employee,
  content,
}: EmploymentContractPDFProps) {
  const companyName = content.companyName || "프레스코21";
  const businessNumber = content.businessNumber || "215-05-52221";

  // 총 급여 계산
  const totalSalary =
    content.salary.baseSalary +
    content.salary.mealAllowance +
    content.salary.transportAllowance +
    content.salary.positionAllowance;

  // 계약 유형 한글 변환
  const contractTypeLabel =
    {
      REGULAR: "정규직 (무기계약)",
      CONTRACT: "계약직 (기간제)",
      PARTTIME: "파트타임",
      REPLACEMENT: "대체인력",
    }[content.contractType] || "정규직";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>근로계약서</Text>

        {/* 1. 회사 및 근로자 정보 */}
        <Text style={styles.sectionTitle}>1. 당사자</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>사업장명</Text>
            <Text style={styles.tableValue}>{companyName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>사업자등록번호</Text>
            <Text style={styles.tableValue}>{businessNumber}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>근로자 성명</Text>
            <Text style={styles.tableValue}>{employee.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>사번</Text>
            <Text style={styles.tableValue}>{employee.employeeNo}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>부서</Text>
            <Text style={styles.tableValue}>{employee.department.name}</Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>직급</Text>
            <Text style={styles.tableValue}>{employee.position}</Text>
          </View>
        </View>

        {/* 2. 근로계약 기간 (필수 1번) */}
        <Text style={styles.sectionTitle}>2. 근로계약 기간</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>계약 유형</Text>
            <Text style={styles.tableValue}>{contractTypeLabel}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>계약 시작일</Text>
            <Text style={styles.tableValue}>
              {formatDate(content.contractStartDate)}
            </Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>계약 종료일</Text>
            <Text style={styles.tableValue}>
              {content.isIndefinite
                ? "무기한 (정년 퇴직 시까지)"
                : content.contractEndDate
                  ? formatDate(content.contractEndDate)
                  : "—"}
            </Text>
          </View>
        </View>

        {/* 3. 근무 장소 및 업무 (필수 2, 3번) */}
        <Text style={styles.sectionTitle}>3. 근무 장소 및 업무 내용</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>근무 장소</Text>
            <Text style={styles.tableValue}>{content.workLocation}</Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>업무 내용</Text>
            <Text style={styles.tableValue}>{content.jobDescription}</Text>
          </View>
        </View>

        {/* 4. 소정근로시간 (필수 4번) */}
        <Text style={styles.sectionTitle}>4. 소정근로시간</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>주당 근로시간</Text>
            <Text style={styles.tableValue}>
              주 {content.workingHours.weeklyWorkHours}시간
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>근무 시간</Text>
            <Text style={styles.tableValue}>
              {content.workingHours.workStartTime} ~ {content.workingHours.workEndTime}
            </Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>휴게 시간</Text>
            <Text style={styles.tableValue}>
              {content.workingHours.breakMinutes}분
            </Text>
          </View>
        </View>

        {/* 5. 근무일 및 휴일 (필수 5번) */}
        <Text style={styles.sectionTitle}>5. 근무일 및 휴일</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>근무일</Text>
            <Text style={styles.tableValue}>월요일 ~ 금요일 (주 5일)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>주휴일</Text>
            <Text style={styles.tableValue}>{content.weeklyRestDay}</Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>유급휴일</Text>
            <Text style={styles.tableValue}>
              근로자의 날, 국경일, 공휴일 (관공서의 공휴일에 관한 규정)
            </Text>
          </View>
        </View>

        {/* 6. 임금 (필수 6, 7번) */}
        <Text style={styles.sectionTitle}>6. 임금의 구성·계산·지급방법</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>기본급</Text>
            <Text style={styles.tableValue}>
              월 {formatCurrency(content.salary.baseSalary)}원
            </Text>
          </View>
          {content.salary.mealAllowance > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>
                식대 {content.salary.taxFreeMeal && "(비과세)"}
              </Text>
              <Text style={styles.tableValue}>
                월 {formatCurrency(content.salary.mealAllowance)}원
              </Text>
            </View>
          )}
          {content.salary.transportAllowance > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>
                교통비 {content.salary.taxFreeTransport && "(비과세)"}
              </Text>
              <Text style={styles.tableValue}>
                월 {formatCurrency(content.salary.transportAllowance)}원
              </Text>
            </View>
          )}
          {content.salary.positionAllowance > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>직책수당</Text>
              <Text style={styles.tableValue}>
                월 {formatCurrency(content.salary.positionAllowance)}원
              </Text>
            </View>
          )}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>총 급여</Text>
            <Text style={styles.tableValue}>
              월 {formatCurrency(totalSalary)}원
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>지급일</Text>
            <Text style={styles.tableValue}>
              매월 {content.salaryPayment.paymentDate}일 (휴일인 경우 전일 지급)
            </Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>지급방법</Text>
            <Text style={styles.tableValue}>
              {content.salaryPayment.paymentMethod === "BANK_TRANSFER"
                ? "은행 계좌 이체"
                : content.salaryPayment.paymentMethod === "CASH"
                  ? "현금 지급"
                  : "기타"}
              {content.salaryPayment.bankName &&
                ` (${content.salaryPayment.bankName})`}
            </Text>
          </View>
        </View>

        {/* 7. 연차 유급휴가 (필수 8번) */}
        <Text style={styles.sectionTitle}>7. 연차 유급휴가</Text>
        <View style={styles.table}>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>연차 정책</Text>
            <Text style={styles.tableValue}>{content.annualLeavePolicy}</Text>
          </View>
        </View>

        {/* 8. 사회보험 적용 (필수 9번) */}
        <Text style={styles.sectionTitle}>8. 사회보험 적용</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>국민연금</Text>
            <Text style={styles.tableValue}>
              {content.socialInsurance.nationalPension ? "가입" : "미가입"}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>건강보험</Text>
            <Text style={styles.tableValue}>
              {content.socialInsurance.healthInsurance ? "가입" : "미가입"}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>고용보험</Text>
            <Text style={styles.tableValue}>
              {content.socialInsurance.employmentInsurance ? "가입" : "미가입"}
            </Text>
          </View>
          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>산재보험</Text>
            <Text style={styles.tableValue}>
              {content.socialInsurance.industrialAccident ? "가입" : "미가입"}
            </Text>
          </View>
        </View>

        {/* 9. 수습기간 (필수 11번) */}
        {content.probation && content.probation.hasProbation && (
          <>
            <Text style={styles.sectionTitle}>9. 수습기간</Text>
            <View style={styles.table}>
              <View style={styles.tableRowLast}>
                <Text style={styles.tableLabel}>수습 종료일</Text>
                <Text style={styles.tableValue}>
                  {content.probation.probationEndDate
                    ? formatDate(content.probation.probationEndDate)
                    : "—"}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* 10. 계약 갱신 조건 (기간제만) */}
        {!content.isIndefinite && content.renewalCondition && (
          <>
            <Text style={styles.sectionTitle}>10. 계약 갱신 조건 (기간제)</Text>
            <View style={styles.table}>
              <View style={styles.tableRowLast}>
                <Text style={styles.tableLabel}>갱신 조건</Text>
                <Text style={styles.tableValue}>{content.renewalCondition}</Text>
              </View>
            </View>
          </>
        )}

        {/* 법정 필수 문구 */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalNoticeTitle}>
            ■ 근로기준법 준수 사항
          </Text>
          <Text style={styles.legalNoticeText}>
            1. 본 근로계약은 근로기준법 제17조에 따라 작성되었으며, 서면으로
            교부합니다.
          </Text>
          <Text style={styles.legalNoticeText}>
            2. 근로자는 근로기준법 제15조에 따라 근로조건이 사실과 다른 경우
            즉시 근로계약을 해제할 수 있습니다.
          </Text>
          <Text style={styles.legalNoticeText}>
            3. 본 계약에 명시되지 않은 사항은 근로기준법, 취업규칙, 단체협약에
            따릅니다.
          </Text>
          <Text style={styles.legalNoticeText}>
            4. 본 근로계약의 임금은 최저임금법에 따른 2026년 최저임금(시급
            10,320원)을 준수합니다.
          </Text>
        </View>

        {/* 서명란 */}
        <View style={styles.signatureSection}>
          <Text style={{ fontSize: 10, marginBottom: 10 }}>
            위 내용과 같이 근로계약을 체결하고, 이를 확인합니다.
          </Text>
          <Text style={{ fontSize: 8, color: "#666", marginBottom: 15 }}>
            계약일: {formatDate(content.generatedAt)}
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>사용자 (회사)</Text>
              <Text style={styles.signatureLine}>{companyName}</Text>
              <Text style={{ fontSize: 9, marginTop: 5 }}>대표자: ___________ (인)</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>근로자</Text>
              <Text style={styles.signatureLine}>{employee.name}</Text>
              <Text style={{ fontSize: 9, marginTop: 5 }}>서명: ___________ (인)</Text>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>
            ⚠️ 주의: 근로계약서 미교부 시 500만원 이하 벌금 (근로기준법 제114조
            제1호)
          </Text>
          <Text style={{ marginTop: 3 }}>
            발행일: {new Date().toLocaleDateString("ko-KR")} | 문의: 인사팀
          </Text>
        </View>
      </Page>
    </Document>
  );
}
