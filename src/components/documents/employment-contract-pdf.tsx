// 근로계약서 PDF 템플릿 (회사 실제 양식 기반)
// 3가지 양식: 재택근무(9조항) / 포괄임금제(10조항) / 촉탁직(10조항)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Employee, Department } from "@prisma/client";
import type { EmploymentContractContent, ContractVariant } from "@/types/document";

// 한글 폰트 등록 (Noto Sans KR)
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
    padding: 35,
    fontFamily: "NotoSansKR",
    fontSize: 9,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
  },
  // 당사자 정보 테이블
  infoTable: {
    border: "1pt solid #000",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #999",
    minHeight: 22,
  },
  infoRowLast: {
    flexDirection: "row",
    minHeight: 22,
  },
  infoLabelMain: {
    width: "13%",
    padding: 5,
    backgroundColor: "#f0f0f0",
    borderRight: "0.5pt solid #999",
    fontWeight: 700,
    fontSize: 8,
    textAlign: "center",
    justifyContent: "center",
  },
  infoLabelSub: {
    width: "12%",
    padding: 5,
    backgroundColor: "#f8f8f8",
    borderRight: "0.5pt solid #999",
    fontSize: 8,
    textAlign: "center",
    justifyContent: "center",
  },
  infoValue: {
    width: "25%",
    padding: 5,
    fontSize: 8,
    justifyContent: "center",
  },
  infoValueWide: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    justifyContent: "center",
  },
  // 계약 도입부
  contractIntro: {
    fontSize: 9,
    marginTop: 12,
    marginBottom: 15,
    lineHeight: 1.7,
    textAlign: "center",
  },
  // 조항 제목
  articleTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
  },
  // 조항 본문
  clause: {
    fontSize: 8.5,
    lineHeight: 1.7,
    marginBottom: 4,
    marginLeft: 3,
  },
  clauseIndent: {
    fontSize: 8.5,
    lineHeight: 1.7,
    marginBottom: 3,
    marginLeft: 15,
  },
  // 강조 텍스트 (포괄임금제, 재택근무 특별 조항)
  importantClause: {
    fontSize: 8.5,
    fontWeight: 700,
    lineHeight: 1.7,
    marginBottom: 4,
    marginLeft: 3,
  },
  importantBox: {
    border: "0.5pt solid #666",
    backgroundColor: "#fffde7",
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 3,
  },
  // 급여 테이블
  salaryTable: {
    border: "1pt solid #000",
    marginTop: 6,
    marginBottom: 8,
  },
  salaryRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #999",
    minHeight: 20,
  },
  salaryRowLast: {
    flexDirection: "row",
    minHeight: 20,
  },
  salaryHeader: {
    padding: 4,
    backgroundColor: "#f0f0f0",
    borderRight: "0.5pt solid #999",
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
  },
  salaryHeaderLast: {
    padding: 4,
    backgroundColor: "#f0f0f0",
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
  },
  salaryCell: {
    padding: 4,
    borderRight: "0.5pt solid #999",
    fontSize: 8,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
  },
  salaryCellLast: {
    padding: 4,
    fontSize: 8,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
  },
  // 서명란
  signatureSection: {
    marginTop: 25,
  },
  signatureDate: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  signatureLine: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.8,
  },
  signatureSign: {
    fontSize: 9,
    marginTop: 2,
  },
  // 소형 텍스트
  smallText: {
    fontSize: 7.5,
    color: "#555",
    marginTop: 3,
    marginBottom: 6,
    marginLeft: 3,
  },
  // 서명(인) 표기
  signMark: {
    fontSize: 8.5,
    textAlign: "right",
    marginTop: 2,
    marginBottom: 4,
  },
});

// 금액 포맷팅
function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR");
}

// 날짜 포맷팅 (YYYY년 MM월 DD일)
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}년 ${m}월 ${d}일`;
}

// 양식 유형 결정
function getContractVariant(content: EmploymentContractContent): ContractVariant {
  if (content.contractVariant) return content.contractVariant;
  if (content.reemployed?.isReemployed) return "REEMPLOYED";
  if (content.fixedOT?.useFixedOT) return "FIXED_OT";
  if (content.remoteWork?.isRemote) return "REMOTE";
  return "REMOTE";
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
  const variant = getContractVariant(content);
  const isFixedOT = variant === "FIXED_OT" || variant === "REEMPLOYED";
  const isRemote = variant === "REMOTE";

  // 계약 해지 사유
  const terminationReasons = content.terminationReasons?.length
    ? content.terminationReasons
    : [
        "경영상의 이유에 의한 해고 등 관련법에 의한 사유가 발생한 경우",
        "근로자에게 노동관계법 또는 취업규칙에서 정하는 징계해고 사유가 발생한 경우",
        "계약기간 만료 시",
        "근로자가 사직원을 제출한 경우",
        "기타, 갑·을 쌍방의 합의에 의한 경우",
      ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>
          {variant === "REEMPLOYED" ? "[촉탁직] 근로계약서" : "근로계약서"}
        </Text>

        {/* 당사자 정보 테이블 */}
        <View style={styles.infoTable}>
          {/* 사업주 1행: 성명 + 사업의 종류 */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelMain}>
              <Text>사업주{"\n"}(갑)</Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>성명</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{content.representativeName || "이진선"}</Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>사업의 종류</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>{content.businessType || "상품도매업"}</Text>
            </View>
          </View>
          {/* 사업주 2행: 사업체명 */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelMain}>
              <Text> </Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>사업체명</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>{content.companyName || "프레스코21"}</Text>
            </View>
          </View>
          {/* 사업주 3행: 소재지 */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelMain}>
              <Text> </Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>소재지</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>
                {content.companyAddress ||
                  "서울시 송파구 송이동 15길 33(가락동) 가락2차 쌍용상가 201호"}
              </Text>
            </View>
          </View>
          {/* 근로자 1행: 성명 + 직위 */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelMain}>
              <Text>근로자{"\n"}(을)</Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>성명</Text>
            </View>
            <View style={styles.infoValue}>
              <Text>{employee.name}</Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>직위</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>{employee.position}</Text>
            </View>
          </View>
          {/* 근로자 2행: 주소 */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelMain}>
              <Text> </Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>주소</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>{employee.address || "(주소 미기재)"}</Text>
            </View>
          </View>
          {/* 근로자 3행: 생년월일 */}
          <View style={styles.infoRowLast}>
            <View style={styles.infoLabelMain}>
              <Text> </Text>
            </View>
            <View style={styles.infoLabelSub}>
              <Text>생년월일</Text>
            </View>
            <View style={styles.infoValueWide}>
              <Text>
                {employee.birthDate
                  ? formatDate(employee.birthDate.toString())
                  : "(생년월일 미기재)"}
              </Text>
            </View>
          </View>
        </View>

        {/* 계약 도입부 */}
        <Text style={styles.contractIntro}>
          {content.companyName || "프레스코21"} (이하 &quot;갑&quot;이라함)과{" "}
          {employee.name} (이하 &quot;을&quot;이라함)은 다음과 같이 근로계약을
          체결한다.
        </Text>

        {/* ════ 제1조: 근로계약기간 ════ */}
        <Text style={styles.articleTitle}>
          {variant === "REEMPLOYED"
            ? "제1조 (근로계약기간 및 촉탁직 재고용)"
            : "제1조 (근로계약기간)"}
        </Text>
        <Text style={styles.clause}>
          {"\u2460"} 근로계약기간: {formatDate(content.contractStartDate)}부터{" "}
          {content.isIndefinite
            ? "   년   월   일 까지로 한다."
            : content.contractEndDate
              ? `${formatDate(content.contractEndDate)}까지로 한다.`
              : "   년   월   일 까지로 한다."}
        </Text>
        <Text style={styles.clauseIndent}>
          1) 근로계약기간의 종기가 없는 경우, 근로계약기간이 없는 근로계약으로
          본다.
        </Text>
        <Text style={styles.clauseIndent}>
          2) 기간제의 경우, 근로계약기간의 만료로 근로관계는 종료한다.
        </Text>
        <Text style={styles.clauseIndent}>
          3) 입사일부터 {content.probationPeriod || 3}개월간은 수습기간으로 한다.
        </Text>

        {/* 촉탁직 특별 조항 */}
        {variant === "REEMPLOYED" && content.reemployed?.isReemployed && (
          <>
            <Text style={styles.importantClause}>
              {"\u2461"} [근로관계의 단절] 본 계약은 정년퇴직(만{" "}
              {content.reemployed.retirementAge || 65}
              세)에 의해 종전의 근로관계가 종료된 후, 고령자 고용유지 정책에
              의거하여 새롭게 체결된 &apos;촉탁직 재고용&apos; 계약임을 양 당사자는
              명확히 확인한다.
            </Text>
            <View style={styles.importantBox}>
              <Text style={styles.importantClause}>
                이에 따라 퇴직급여 및 연차유급휴가 산정을 위한 계속근로기간은 본
                계약 체결 시점부터 새롭게 기산한다.
              </Text>
            </View>
          </>
        )}

        {/* ════ 제2조: 근로시간, 근로일 및 휴게 ════ */}
        <Text style={styles.articleTitle}>
          제2조 (근로시간, 근로일 및 휴게)
        </Text>
        <Text style={styles.clause}>
          {"\u2460"} &quot;을&quot;의 근로시간, 근로일 및 휴게는 다음과 같다.
        </Text>
        <Text style={styles.clauseIndent}>
          - 근로시간:{" "}
          {content.workingHours.workStartTime || "09:00"}~
          {content.workingHours.workEndTime || "18:00"} (휴게시간이 포함되어 있음)
        </Text>
        <Text style={styles.clauseIndent}>
          - 휴게:{" "}
          {content.workingHours.breakStartTime || "12:30"}~
          {content.workingHours.breakEndTime || "13:30"} (업무의 특성상 휴게
          시간을 변경하거나, 분할 가능하다.)
        </Text>

        <Text style={styles.clause}>
          {"\u2461"} 근로일: {content.workingHours.workDays || "주 5일 (월요일~금요일)"}{" "}
          근무를 원칙으로 한다.
        </Text>

        {/* 재택근무: 요일 명시 */}
        {isRemote && content.remoteWork?.isRemote && (
          <Text style={styles.importantClause}>
            {"   "}단, {content.remoteWork.remoteDays || "월, 화, 수, 금요일"}은
            재택근로 하며, 재택근로 요일을 변경할 수 있다.
          </Text>
        )}

        {/* 시차출퇴근제 */}
        {isFixedOT && content.flexibleSchedule?.useFlexible && (
          <>
            <Text style={styles.importantClause}>
              {"   "}[시차출퇴근제 적용] 본 근로계약은 시차출퇴근제를 적용하며,
              &quot;을&quot;은 아래 범위 내에서 출근 시각을 선택할 수 있다.
            </Text>
            <Text style={styles.clauseIndent}>
              - 출근 가능 시간: {content.flexibleSchedule.flexStartTime || "07:00"} ~{" "}
              {content.flexibleSchedule.flexEndTime || "11:00"}
            </Text>
            <Text style={styles.clauseIndent}>
              - 퇴근 시간: 출근 시각으로부터 9시간 후 (휴게시간 1시간 포함)
            </Text>
            <Text style={styles.clauseIndent}>
              - 의무 근무 시간(코어타임): {content.flexibleSchedule.coreStartTime || "11:00"} ~{" "}
              {content.flexibleSchedule.coreEndTime || "16:00"}
            </Text>
          </>
        )}

        <Text style={styles.clause}>
          {isRemote && content.remoteWork?.isRemote
            ? "\u2462"
            : content.flexibleSchedule?.useFlexible
              ? "\u2464"
              : "\u2462"}{" "}
          전항의 근로시간, 근로일은 갑의 업무 형편에 따라 변경할 수 있다.
        </Text>

        <Text style={styles.clause}>
          {isRemote && content.remoteWork?.isRemote
            ? "\u2463"
            : content.flexibleSchedule?.useFlexible
              ? "\u2465"
              : "\u2463"}{" "}
          업무의 특성상 연장, 야간, 휴일근로가 발생할 수 있으며, 이에 동의한다.
          {isFixedOT &&
            " 제4조에 명시된 포괄임금 산정 방식에 따라 수당을 지급받기로 한다."}
          {"  "}(서명) __________
        </Text>

        {/* 재택근무 근로기준법 58조 */}
        {isRemote &&
          content.remoteWork?.isRemote &&
          content.remoteWork.article58Applied && (
            <View style={styles.importantBox}>
              <Text style={styles.clause}>
                {"\u2464"} 을은 근로기준법 58조(근로시간의 특례)에 따라
                재택근로자로서 근로시간의 전부 혹은 일부를 사업장 밖에서 근로하는
                근로자임을 확인하며, 근로시간을 산정하기 어려운 경우에는
                소정근로시간을 근로한 것으로 보며, 이에 대해서는 근로자 대표와
                서면합의에 의하며, 이에 동의한다.
              </Text>
              <Text style={styles.signMark}>
                (성명) __________ (인)
              </Text>
            </View>
          )}

        {/* ════ 제3조: 담당업무 및 근무장소 ════ */}
        <Text style={styles.articleTitle}>
          제3조 (담당업무 및 근무장소)
        </Text>
        <Text style={styles.clause}>
          {"\u2460"} 담당업무는 {content.jobDescription}로 한다.
        </Text>
        <Text style={styles.clause}>
          {"\u2461"} 근무장소는 {content.workLocation}로 한다.
        </Text>
        {isRemote && content.remoteWork?.isRemote && (
          <Text style={styles.clauseIndent}>
            재택주소: {employee.address || "(주소 미기재)"}
          </Text>
        )}
        <Text style={styles.clause}>
          {"\u2462"} 담당업무 및 근무장소는 업무상 필요시 변경할 수 있으며, 이에
          동의한다. (서명) __________
        </Text>

        {/* ════ 제4조: 임금 ════ */}
        <Text style={styles.articleTitle}>
          제4조 (임금의 구성항목, 계산방법 및 지급방법)
        </Text>

        {/* 포괄임금제 서명란 */}
        {isFixedOT && content.fixedOT?.useFixedOT && (
          <View style={styles.importantBox}>
            <Text style={styles.importantClause}>
              {"\u2460"} &quot;을&quot;의 임금은 다음과 같이 포괄산정방식에
              의하여 구성하며, &quot;을&quot;은 이에 동의한다. (서명) __________
            </Text>
          </View>
        )}

        {/* 급여 테이블 */}
        <View style={styles.salaryTable}>
          <View style={styles.salaryRow}>
            <View style={styles.salaryHeader}>
              <Text>구분</Text>
            </View>
            <View style={styles.salaryHeader}>
              <Text>기본급</Text>
            </View>
            <View style={styles.salaryHeader}>
              <Text>식대</Text>
            </View>
            {(content.salary.transportAllowance ?? 0) > 0 && (
              <View style={styles.salaryHeader}>
                <Text>교통비</Text>
              </View>
            )}
            {isFixedOT && content.fixedOT?.useFixedOT && (
              <View style={styles.salaryHeader}>
                <Text>고정연장{"\n"}근로수당</Text>
              </View>
            )}
            <View style={styles.salaryHeaderLast}>
              <Text>월지급액</Text>
            </View>
          </View>
          <View style={styles.salaryRowLast}>
            <View style={styles.salaryCell}>
              <Text>단위(원)</Text>
            </View>
            <View style={styles.salaryCell}>
              <Text>{formatCurrency(content.salary.baseSalary)}</Text>
            </View>
            <View style={styles.salaryCell}>
              <Text>{formatCurrency(content.salary.mealAllowance)}</Text>
            </View>
            {(content.salary.transportAllowance ?? 0) > 0 && (
              <View style={styles.salaryCell}>
                <Text>{formatCurrency(content.salary.transportAllowance)}</Text>
              </View>
            )}
            {isFixedOT && content.fixedOT?.useFixedOT && (
              <View style={styles.salaryCell}>
                <Text>
                  {formatCurrency(content.fixedOT.monthlyFixedOTAmount)}
                </Text>
              </View>
            )}
            <View style={styles.salaryCellLast}>
              <Text>{formatCurrency(content.salary.monthlyTotalGross)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.smallText}>
          월통상임금시간: {content.salary.monthlyStandardHours || 209}시간(주휴시간포함)/월
          {isFixedOT &&
            content.fixedOT?.useFixedOT &&
            ` / ${content.fixedOT.monthlyFixedOTHours}시간/월`}
        </Text>

        {/* 포괄임금제 범위 조항 */}
        {isFixedOT && content.fixedOT?.useFixedOT && (
          <View style={styles.importantBox}>
            <Text style={styles.clause}>
              {"\u2461"} [포괄산정 범위] 월지급 합계액에는 월{" "}
              {content.fixedOT.monthlyFixedOTHours}시간의 고정 연장근로수당이
              포함되어 있다.
            </Text>
            <Text style={styles.clause}>
              실제 연장근로시간이 월{" "}
              {content.fixedOT.overtimeThreshold || 30}시간을 초과하는 경우에
              한하여 그 초과분에 대한 법정 수당을 별도로 정산하여 지급한다.
            </Text>
          </View>
        )}

        {/* 급여 공통 조항 */}
        <Text style={styles.clause}>
          {isFixedOT ? "\u2462" : "\u2460"} 기본급에는 주휴수당이 포함되어
          있으며, 다만, 1주동안 소정근로일을 개근한 근로자에 대하여 유급으로
          지급하되, 소정근로일을 개근하지 못한 경우, 무급으로 한다.
        </Text>
        <Text style={styles.clause}>
          {isFixedOT ? "\u2463" : "\u2461"} 회사는 월지급액에서
          공제액(4대보험, 제세공과금 등)을 공제하고 지급한다.
        </Text>
        <Text style={styles.clause}>
          {isFixedOT ? "\u2464" : "\u2462"} 결근 등 을의 귀책 사유로 인해서
          근로를 제공하지 못한 경우에는, 그 일수만큼 공제한다.
        </Text>
        <Text style={styles.clause}>
          {isFixedOT ? "\u2465" : "\u2463"} 임금의 산정기간은 당월{" "}
          {content.salaryPayment.calculationPeriodStart || 1}일부터 기산하여{" "}
          {content.salaryPayment.calculationPeriodEnd || "말일"}까지 마감하여,
          익월{" "}
          {content.salaryPayment.paymentDate === "말일"
            ? "말일"
            : `${content.salaryPayment.paymentDate}일`}
          에 지급하며, 지급일이 공휴일인 경우 전일에, 을이 지정한 금융계좌로 이체
          지급하며, 동의한다.
        </Text>

        {/* ════ 제5조: 휴일 및 휴가 ════ */}
        <Text style={styles.articleTitle}>제5조 (휴일 및 휴가)</Text>
        <Text style={styles.clause}>
          {"\u2460"} 을이 1주간의 소정근로일을 개근한 경우, 주휴일을 부여하며,
          주휴일은 {content.weeklyRestDay || "일요일"}로 하고, 업무상 필요시
          주휴일을 변경할 수 있다.
        </Text>
        <Text style={styles.clause}>
          {"\u2461"} 연차휴가는{" "}
          {content.annualLeavePolicy ||
            "근로기준법에 정하는 바에 따라 부여한다."}
        </Text>
        <Text style={styles.clause}>
          {"\u2462"} 근로자 대표와 합의한 경우, 휴일을 다른 날로 대체할 수 있다.
        </Text>
        <Text style={styles.clause}>
          {"\u2463"} 관공서 공휴일에 대한 휴일은 유급휴일이다.
        </Text>
        <Text style={styles.clause}>
          {"\u2464"}{" "}
          {content.saturdayOffType || "토요일은 무급 휴무일로 한다."}
        </Text>

        {/* ════ 제6조: 근태사항, 중도퇴사자 및 인수인계 ════ */}
        <Text style={styles.articleTitle}>
          제6조 (근태사항, 중도퇴사자 및 인수인계)
        </Text>
        <Text style={styles.clause}>
          {"\u2460"} 중도 퇴사자는 중도 퇴사시 최소한{" "}
          {content.resignationNotice || 30}일 이전에 대표자에게 사전통보하고,
          인수인계서를 작성해야 한다.
        </Text>
        <Text style={styles.clause}>
          {"\u2461"} 퇴직일까지 성실하게 업무에 종사해야 하며, 업무인수인계
          불충분으로 인해 손해가 발생한 경우, 이를 배상해야 한다.
        </Text>

        {/* ════ 제7조: 계약 해지 ════ */}
        <Text style={styles.articleTitle}>제7조 (계약 해지)</Text>
        {terminationReasons.map((reason, index) => (
          <Text key={index} style={styles.clause}>
            {String.fromCharCode(9312 + index)} {reason}
          </Text>
        ))}

        {/* ════ 제8조: 기밀유지 (및 경업금지) ════ */}
        <Text style={styles.articleTitle}>
          제8조 ({isFixedOT ? "기밀유지 및 경업금지" : "기밀유지"})
        </Text>
        <Text style={styles.clause}>
          {"\u2460"}{" "}
          갑의 영업비밀(거래처명, 거래처 개인정보, 거래처별 매출액, 영업
          Know-how, 기술적 Know-how, 작업방법 및 기술에 관련된 모든 사항, 마케팅
          방법, 제품 구조, 특허, 실용신안, 디자인, 상표등 지적재산권의 모든 사항
          및 Know-how, 회사의 모든 정보, 수입처 등 영업비밀은 어떤 형태나 형식에
          국한되지 아니하며, 업무상 관련된 모든 것을 말한다)은 재직 중은 물론,
          퇴직 후에도 갑의 허가 없이 사용하거나, 제3자나 경쟁사에게 누설(어떤
          형태에 국한되지 않는다.)하지 않으며, 이를 어길 경우, 민·형사상 책임을
          부담한다.
        </Text>
        <Text style={styles.signMark}>성명 __________ (인)</Text>

        {isFixedOT && (
          <>
            <Text style={styles.clause}>
              {"\u2461"} 계약종료 내지는 계약의 중도해지 후 만{" "}
              {content.confidentiality?.nonCompetePeriod || 1}년 동안은{" "}
              {content.confidentiality?.nonCompeteScope ||
                "동종업계나 타회사에 전직 또는 창업"}
              (본인 명의나 또는 타인 명의로 하더라도, 본인이 실질적으로
              경영·운영에 참여하는 것을 포함)하지 않겠으며, 이에 동의합니다.
            </Text>
            <Text style={styles.signMark}>(인)</Text>
          </>
        )}

        {/* ════ 제9조 ════ */}
        <Text style={styles.articleTitle}>
          제9조 (
          {isFixedOT ? "경영성과급 특약" : "기타 및 특약사항"})
        </Text>

        {isFixedOT ? (
          <>
            {/* 포괄임금제: 경영성과급 특약 */}
            <Text style={styles.clause}>
              {"\u2460"} [지급 근거] 회사는 경영 실적 및 근로자의 기여도(연장근로
              협조 등)를 고려하여 비정기적 경영성과급을 지급할 수 있다.
            </Text>
            <Text style={styles.clause}>
              {"\u2461"} [은혜적 금원] 본 성과급은 지급 여부, 시기, 금액이
              전적으로 회사의 경영판단 및 재량에 의해 결정되는 은혜적·호의적
              성격의 금원으로 근로기준법상 임금에 해당하지 않는다.
            </Text>
            <Text style={styles.clause}>
              {"\u2462"} [평균임금 제외] 본 성과급은 고정적·일률적 임금이
              아니므로 퇴직금 산정을 위한 평균임금에서 제외하기로 노사 합의한다.
              (인) __________
            </Text>
          </>
        ) : (
          <>
            {/* 재택근무: 기타 및 특약사항 */}
            <Text style={styles.clause}>
              {"\u2460"} 본 계약서에 명시되지 않은 사항은 노동법 관련 법령,
              취업규칙 및 관련규정에서 정하는 바에 따르며, 취업규칙 불이익 변경된
              경우에는 이에 따르며 동의한다.
            </Text>
            <Text style={styles.clause}>
              {"\u2461"} 을은 근로계약서를 작성후에 정히 본 계약서를 교부받음을
              확인합니다.
            </Text>
            <Text style={styles.clauseIndent}>
              {formatDate(content.generatedAt)} (인)
            </Text>
            <Text style={styles.clause}>
              {"\u2462"} 근로자는 상기 계약사항에 대하여 동의하여, 근로계약을
              체결하며, 이와 관련된 일체의 이의를 제기하지 않는다. (인)
            </Text>
            <Text style={styles.clause}>
              {"\u2463"} 기존 근로계약서가 존재하는 경우, 본 계약서로 대체된다.
              (인)
            </Text>
            {isRemote &&
              content.remoteWork?.remoteWorkGuidelinesConfirmed && (
                <Text style={styles.importantClause}>
                  {"\u2464"} 재택근로자의 경우에는 재택근로자 근무수칙을
                  확인하였으며, 이에 따른다. (인)
                </Text>
              )}
          </>
        )}

        {/* ════ 제10조: 기타 및 특약사항 (포괄임금제/촉탁직만) ════ */}
        {isFixedOT && (
          <>
            <Text style={styles.articleTitle}>
              제10조 (기타 및 특약사항)
            </Text>
            <Text style={styles.clause}>
              {"\u2460"} 본 계약서에 명시되지 않은 사항은 노동법 관련 법령,
              취업규칙 및 관련규정에서 정하는 바에 따르며, 취업규칙 불이익 변경된
              경우에는 이에 따르며 동의한다.
            </Text>
            <Text style={styles.clause}>
              {"\u2461"} 을은 근로계약서를 작성후에 정히 본 계약서를 교부받음을
              확인합니다.
            </Text>
            <Text style={styles.clauseIndent}>
              {formatDate(content.generatedAt)} (인)
            </Text>
            <Text style={styles.clause}>
              {"\u2462"} 근로자는 상기 계약사항에 대하여 동의하여, 근로계약을
              체결하며, 이와 관련된 일체의 이의를 제기하지 않는다. (인)
            </Text>
            <Text style={styles.clause}>
              {"\u2463"} 기존 근로계약서가 존재하는 경우, 본 계약서로 대체된다.
              (인)
            </Text>
          </>
        )}

        {/* ════ 서명란 ════ */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureDate}>
            {formatDate(content.generatedAt)}
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>사업주(갑):</Text>
              <Text style={styles.signatureLine}>
                {content.companyName || "프레스코21"} 대표자
              </Text>
              <Text style={styles.signatureSign}>
                {content.representativeName || "이진선"} (서명 또는 인)
              </Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>근로자(을):</Text>
              <Text style={styles.signatureLine}>{employee.name}</Text>
              <Text style={styles.signatureSign}>(서명 또는 인)</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
