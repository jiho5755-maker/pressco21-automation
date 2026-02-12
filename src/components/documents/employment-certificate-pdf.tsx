import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Employee, Department } from "@prisma/client";
import { calculateTenure } from "@/lib/tenure-calculator";

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
    padding: 60,
    fontFamily: "NotoSansKR",
    fontSize: 11,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 6,
  },
  body: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 2,
  },
  table: {
    marginBottom: 40,
    borderTop: "1.5pt solid #333",
    borderLeft: "1.5pt solid #333",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableLabel: {
    width: "30%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRight: "1.5pt solid #333",
    borderBottom: "1.5pt solid #333",
    fontWeight: 700,
  },
  tableValue: {
    width: "70%",
    padding: 10,
    borderRight: "1.5pt solid #333",
    borderBottom: "1.5pt solid #333",
  },
  footer: {
    marginTop: 60,
    textAlign: "center",
    lineHeight: 2,
  },
  issueDate: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 20,
  },
  company: {
    fontSize: 12,
    marginBottom: 8,
  },
  seal: {
    marginTop: 20,
    fontSize: 10,
    color: "#666",
  },
});

// ── Props 타입 ──
interface EmploymentCertificatePDFProps {
  employee: Employee & {
    department: Department;
  };
  issueDate: Date;
}

// ── 재직증명서 PDF 컴포넌트 ──
export function EmploymentCertificatePDF({
  employee,
  issueDate,
}: EmploymentCertificatePDFProps) {
  const tenure = calculateTenure(employee.joinDate, issueDate);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <Text style={styles.title}>재 직 증 명 서</Text>

        {/* 본문 */}
        <Text style={styles.body}>
          위 사람은 본사에 재직 중임을 증명합니다.
        </Text>

        {/* 정보 테이블 */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>성명</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{employee.name}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>사원번호</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{employee.employeeNo}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>부서</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{employee.department.name}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>직급</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{employee.position}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>입사일</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{format(employee.joinDate, "yyyy년 MM월 dd일")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableLabel}>
              <Text>근속기간</Text>
            </View>
            <View style={styles.tableValue}>
              <Text>{tenure.formatted}</Text>
            </View>
          </View>
        </View>

        {/* 발급 정보 */}
        <View style={styles.footer}>
          <Text style={styles.issueDate}>
            {format(issueDate, "yyyy년 MM월 dd일")}
          </Text>

          <Text style={styles.company}>서울시 송파구 송이동 15길 33(가락동)</Text>
          <Text style={styles.company}>프레스코21</Text>
          <Text style={styles.company}>대표이사 이진선</Text>

          <Text style={styles.seal}>(직인 날인)</Text>
        </View>
      </Page>
    </Document>
  );
}
