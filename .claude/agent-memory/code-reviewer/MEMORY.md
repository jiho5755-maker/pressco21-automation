# Code Reviewer Agent Memory

## 프로젝트 컨벤션

### Server Actions 패턴 (검증 완료 2026-02-11)
- **트랜잭션 + revalidatePath**: 트랜잭션 성공 후 즉시 `revalidatePath()` 호출 (expense-actions.ts, document-actions.ts)
- **RBAC 검증**: Manager는 자기 부서만 접근 가능 → `currentEmployee.departmentId` 비교 필수
- **에러 메시지**: 사용자 친화적 한글 메시지 (예: "이전 순위 결재가 승인되지 않았습니다.")
- **타입 안전성**: `CreateXInput = z.infer<typeof schema>` 패턴으로 Zod-TypeScript 동기화

### PDF 컴포넌트 패턴 (검증 완료 2026-02-11)
- **한글 폰트**: Google Fonts CDN (Noto Sans KR Regular 400 + Bold 700)
- **StyleSheet 구조**: page → table → row → label/value 계층 (payroll-slip-pdf.tsx, employment-contract-pdf.tsx)
- **법정 문구**: 노란색 배경 + 주황색 테두리 박스로 강조
- **서명란**: 2단 레이아웃 (회사/근로자), 직인 공간 포함

### 근로기준법 문서 요구사항 (검증 완료 2026-02-11)
- **필수 15개 항목**: 근로기준법 제17조 준수 (document.ts, employment-contract-pdf.tsx)
- **서면 교부 의무**: 근로계약서 미교부 시 500만원 벌금 (푸터에 경고 명시)
- **법정 문구 포함**: 제15조(즉시 해제권), 최저임금법 준수 (2026년 시급 10,320원)

### 우수 사례
1. **순차 결재 로직**: 이전 단계 승인 확인 + 전체 완료 확인 (document-actions.ts)
2. **트랜잭션 일관성**: Document + Approval 복합 작업 항상 트랜잭션 보호
3. **타입 가드 제안**: DocumentContent union 타입에 런타임 타입 가드 추가 고려

## 향후 리뷰 시 확인 사항
- [ ] Manager 부서 검증 누락 여부
- [ ] 트랜잭션 외부 revalidatePath 배치 확인
- [ ] PDF 한글 폰트 등록 (Regular + Bold 이중 등록)
- [ ] 근로기준법 필수 항목 누락 검증 (15개 항목)
