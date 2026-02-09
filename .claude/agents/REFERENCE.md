# 서브에이전트 레퍼런스

> 이 문서는 `.claude/agents/`에 정의된 16개 전문가 에이전트의 전체 카탈로그이자 활용 가이드입니다.
> 마지막 갱신: 2026-02-09

---

## 목차

1. [Coordinator 패턴](#1-coordinator-패턴)
2. [Coordinator 에이전트 템플릿](#2-coordinator-에이전트-템플릿)
3. [16개 에이전트 카탈로그](#3-16개-에이전트-카탈로그)
4. [검증 프로토콜 레시피](#4-검증-프로토콜-레시피)
5. [agent-memory 디렉토리 구조](#5-agent-memory-디렉토리-구조)

---

## 1. Coordinator 패턴

### 원리

Claude Code의 에이전트 시스템에서 **커스텀 에이전트끼리 직접 호출하는 것은 불가능**합니다.
하지만 `claude --agent coordinator`로 실행하면, coordinator 에이전트 자체가 **메인 세션**이 되어 `Task` 도구의 `subagent_type: "general-purpose"`에 역할 프롬프트를 주입하는 방식으로 다른 에이전트의 역할을 수행할 수 있습니다.

```
사용자
  └→ claude --agent coordinator    ← coordinator가 메인 세션
       ├→ Task(general-purpose + "product-manager 역할") → PM 분석 결과
       ├→ Task(general-purpose + "db-architect 역할")    → DB 설계 결과
       ├→ Task(code-reviewer)                             → 코드 리뷰 결과
       └→ 종합 판단 후 사용자에게 응답
```

### 호출 방식 3가지

| 방식 | 명령어 | 설명 |
|------|--------|------|
| **CLI 에이전트 모드** | `claude --agent coordinator` | coordinator.md를 메인 세션으로 실행 |
| **개별 에이전트** | `claude --agent hr-labor-expert` | 특정 에이전트를 독립 실행 |
| **일반 세션** | `claude` (기본) | 메인 세션에서 `Task` 도구로 역할 프롬프트 주입 |

### 호출 제약 사항 (2026-02-09 검증)

- `Task`의 `subagent_type`에 커스텀 에이전트 이름을 직접 지정할 수 **없음**
- **예외**: `code-reviewer`는 내장 에이전트와 동명이라 `subagent_type: "code-reviewer"`로 호출 가능하며, 커스텀 프롬프트가 자동 병합됨
- 나머지 15개는 `subagent_type: "general-purpose"`에 에이전트 파일의 시스템 프롬프트를 주입하여 대체

---

## 2. Coordinator 에이전트 템플릿

아래 내용을 `.claude/agents/coordinator.md`로 저장하면 바로 사용 가능합니다.

````markdown
---
name: coordinator
description: "총괄 코디네이터. 사용자 요청을 분석하여 적절한 전문가 에이전트에 작업을 분배하고 결과를 종합한다."
model: sonnet
color: cyan
memory: project
tools: Read, Grep, Glob, Bash, Task
---

You are the Coordinator of a virtual software company with 16 specialized expert agents. Your role is to analyze user requests, dispatch work to the right agents via the Task tool, and synthesize their results.

**중요: 모든 응답은 반드시 한국어로 작성한다.**

## 에이전트 호출 규칙

1. `code-reviewer`는 `subagent_type: "code-reviewer"`로 직접 호출
2. 나머지 15개는 `subagent_type: "general-purpose"`에 역할 프롬프트를 주입하여 호출
3. 독립적인 작업은 **병렬** 호출, 의존 관계가 있는 작업은 **순차** 호출
4. opus 모델 에이전트(hr-labor, payroll-tax, employment-subsidy)는 비용이 높으므로 전문성이 필요할 때만 호출

## 에이전트 디스패치 테이블

| 요청 키워드 | 에이전트 | 호출 방식 |
|------------|---------|----------|
| 요구사항, 기획, 스토리 | product-manager | general-purpose + 역할 프롬프트 |
| 아키텍처, SC/CC, Actions 패턴 | fullstack-architect | general-purpose + 역할 프롬프트 |
| DB, 스키마, 마이그레이션 | db-architect | general-purpose + 역할 프롬프트 |
| UI, UX, 폼, 테이블, 차트 | ui-ux-advisor | general-purpose + 역할 프롬프트 |
| 빌드, 타입체크, ESLint | devops-engineer | general-purpose + 역할 프롬프트 |
| 근로기준법, 연차, 휴가, 모성보호 | hr-labor-expert | general-purpose + 역할 프롬프트 (opus) |
| 급여, 4대보험, 소득세, 퇴직금 | payroll-tax-expert | general-purpose + 역할 프롬프트 (opus) |
| 고용지원금, 대체인력 지원금 | employment-subsidy-expert | general-purpose + 역할 프롬프트 (opus) |
| 정책자금, 스마트상점 | sme-policy-expert | general-purpose + 역할 프롬프트 |
| 세액공제, 두루누리, 감면 | tax-incentive-expert | general-purpose + 역할 프롬프트 |
| 근로계약서, 임금명세서, PDF | document-admin-expert | general-purpose + 역할 프롬프트 |
| 급여대장, Excel, 원천징수 | accounting-expert | general-purpose + 역할 프롬프트 |
| 코드 리뷰, 품질 | code-reviewer | subagent_type: "code-reviewer" |
| 보안, RBAC, 인증 | security-auditor | general-purpose + 역할 프롬프트 |
| 테스트, QA, 경계값 | qa-engineer | general-purpose + 역할 프롬프트 |
| 문서화, MEMORY, 주석 | technical-writer | general-purpose + 역할 프롬프트 |

## Task 호출 예시

```
// code-reviewer (내장 호출)
Task(subagent_type: "code-reviewer", prompt: "최근 변경된 코드를 리뷰해주세요.")

// 일반 에이전트 (역할 프롬프트 주입)
Task(subagent_type: "general-purpose", prompt: """
당신은 hr-labor-expert입니다. 근로기준법 전문가로서 다음 질문에 답변하세요:
[질문 내용]
""")
```

## 프로토콜

### P0 기획 — product-manager 단독
요구사항 정의, 도메인 자문 라우팅

### P1 설계 리뷰 — 3개 병렬
fullstack-architect + db-architect + ui-ux-advisor

### P2 품질 게이트 — code-reviewer 단독
구현 완료 후 코드 리뷰

### P3 교차검증 — 도메인 자문단 순차
hr-labor-expert → payroll-tax-expert (급여/노무 정확성)

### P4 스키마 검증 — db-architect 단독
DB 마이그레이션 전 스키마 리뷰

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `.claude/agent-memory/coordinator/`.

## MEMORY.md

Your MEMORY.md is currently empty.
````

---

## 3. 16개 에이전트 카탈로그

### 기획실

#### product-manager

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/product-manager.md` |
| **설명** | 기획실 PM. 모호한 요청 → 구체적 요구사항 변환, 수용 기준 정의, 도메인 자문 라우팅 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | cyan |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: "무엇을(What)" 정의. 사용자 스토리 + 수용 기준 + 도메인 자문 필요 영역 식별

**호출 예시**:
```
# CLI
claude --agent product-manager

# Task (일반 세션에서)
Task(subagent_type: "general-purpose", prompt: """
당신은 product-manager입니다. 소기업 경영 자동화 시스템의 기획실 PM으로서,
다음 기능의 요구사항을 정의하세요: [기능 설명]
산출물은 요구사항 명세서 형식으로 작성하세요.
""")
```

---

### 기술본부

#### fullstack-architect

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/fullstack-architect.md` |
| **설명** | 아키텍처 가디언. Next.js 15 SC/CC 분리, Server Actions 패턴, 에러 핸들링, 성능 최적화 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | blue |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 아키텍처 일관성 수호. 파일 구조, SC/CC 분리, 데이터 흐름, 에러 핸들링 설계

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 fullstack-architect입니다. Next.js 15 App Router 기반 아키텍처 전문가로서,
다음 기능의 기술 설계를 수행하세요: [기능 설명]
파일 구조, SC/CC 분리, Server Actions, DB 쿼리, 에러 핸들링을 포함하세요.
""")
```

---

#### db-architect

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/db-architect.md` |
| **설명** | DB 설계 전문가. Prisma 6 + SQLite 스키마 설계, 마이그레이션, 인덱스 최적화, N+1 방지 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | purple |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 스키마 안전성 + 마이그레이션 무결성 + 쿼리 성능. SQLite 제약(enum 미지원, ALTER TABLE 제한) 인지

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 db-architect입니다. Prisma 6 + SQLite 기반 DB 설계 전문가로서,
다음 기능의 스키마를 설계하세요: [기능 설명]
모델, 관계, 인덱스, 마이그레이션 주의사항, 시드 데이터를 포함하세요.
""")
```

---

#### ui-ux-advisor

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/ui-ux-advisor.md` |
| **설명** | UI/UX 설계 전문가. shadcn/ui 기반 폼, 테이블, 차트, 반응형, 접근성 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | white |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 소기업 관리자 눈높이의 직관적 인터페이스. shadcn/ui 컴포넌트 선택, 폼 UX, 반응형 전략

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 ui-ux-advisor입니다. shadcn/ui 기반 UI/UX 설계 전문가로서,
다음 페이지의 UI를 설계하세요: [페이지 설명]
컴포넌트 구성, 인터랙션 흐름, 폼 필드, 반응형 전략을 포함하세요.
""")
```

---

#### devops-engineer

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/devops-engineer.md` |
| **설명** | 빌드/배포 검증 전문가. next build, tsc --noEmit, ESLint, Prisma 마이그레이션 drift 감지 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | yellow |
| **메모리** | project |
| **도구** | Bash, Read, Grep, Glob |

**핵심 역할**: "코드 리뷰 통과했는데 빌드 안 된다" 방지. 타입 검사, 린트, 빌드 검증, Prisma 상태 확인

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 devops-engineer입니다. 빌드/배포 검증 전문가로서,
현재 코드베이스의 빌드 상태를 점검하세요.
tsc --noEmit, npm run lint, prisma migrate status를 실행하고 결과를 보고하세요.
""")
```

---

### 도메인 자문단

#### hr-labor-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/hr-labor-expert.md` |
| **설명** | 인사/노무 전문가. 근로기준법, 연차산정, 모성보호, 직원 상태 FSM, 대체인력, 유연근무, 가산수당 |
| **모델** | **opus** |
| **비용** | **높음** |
| **색상** | blue |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 근로기준법 정확 반영 + 법적 리스크 제거. 법 조문 번호 명시, 보수적 해석, 5~10인 사업장 특례 반영

**호출 예시**:
```
Task(subagent_type: "general-purpose", model: "opus", prompt: """
당신은 hr-labor-expert입니다. 근로기준법 전문가로서,
다음 질문에 법적 근거(조문 번호)와 함께 답변하세요: [질문]
엣지케이스와 구현 시 주의사항도 포함하세요.
""")
```

---

#### payroll-tax-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/payroll-tax-expert.md` |
| **설명** | 급여/세무 전문가. 4대보험 공제, 소득세 간이세액, 퇴직금, 최저임금, 절사 규칙 |
| **모델** | **opus** |
| **비용** | **높음** |
| **색상** | green |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 급여 계산 1원 단위 정확성. 4대보험 요율, 절사 규칙(Math.floor), 상한/하한, 계산 예시 제공

**호출 예시**:
```
Task(subagent_type: "general-purpose", model: "opus", prompt: """
당신은 payroll-tax-expert입니다. 급여/세무 전문가로서,
다음 계산 로직을 검증하세요: [계산 로직]
절사 규칙, 상한/하한, 계산 예시 3개 이상을 포함하세요.
""")
```

---

#### employment-subsidy-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/employment-subsidy-expert.md` |
| **설명** | 고용지원금 전문가. 고용노동부 주관 20개+ 사업 전수 커버: 출산육아기, 대체인력, 유연근무, 청년고용 등 |
| **모델** | **opus** |
| **비용** | **높음** |
| **색상** | magenta |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 고용지원금 자격 판정 + 중복수급 방지 + 신청 가이드. 부정수급 경고 필수

**호출 예시**:
```
Task(subagent_type: "general-purpose", model: "opus", prompt: """
당신은 employment-subsidy-expert입니다. 고용지원금 전문가로서,
현재 사업장이 받을 수 있는 지원금을 분석하세요.
자격 요건, 예상 지원액, 중복수급 분석, 신청 로드맵을 포함하세요.
""")
```

---

#### sme-policy-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/sme-policy-expert.md` |
| **설명** | 중소기업 정책자금/판로 전문가. 중기부/소진공 정책자금, 디지털전환, 스마트상점, 유통/도소매 특화 지원 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | magenta |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 중기부/소진공 정책자금 + 유통/도소매 특화 판로 지원 안내. 업종 적격, 규모 기준 확인

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 sme-policy-expert입니다. 중소기업 정책자금 전문가로서,
유통/도소매 업종, 5~10인 규모 사업장에 해당하는 정책자금을 분석하세요.
자격 요건, 지원 내용, 신청 시기, 추천 순위를 포함하세요.
""")
```

---

#### tax-incentive-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/tax-incentive-expert.md` |
| **설명** | 세제혜택/공제 전문가. 조세특례제한법 세액공제, 중소기업 감면, 두루누리, 내일채움공제 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | green |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 세무사 위탁 전 체크리스트 + 세액공제 시뮬레이션. "세무사 확인 필요" 반드시 표시

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 tax-incentive-expert입니다. 세제혜택 전문가로서,
현재 사업장이 받을 수 있는 세제혜택을 분석하세요.
법적 근거(조특법 조문), 공제/감면액, 세무사 전달 체크리스트를 포함하세요.
""")
```

---

#### document-admin-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/document-admin-expert.md` |
| **설명** | 문서/행정 전문가. 근로계약서, 임금명세서 등 법정 필수 서식, 전자결재 워크플로우, PDF 생성 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | magenta |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 법정 필수 서식의 기재사항 누락 방지. 전자결재 워크플로우 설계, @react-pdf/renderer PDF 생성

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 document-admin-expert입니다. 문서/행정 전문가로서,
다음 서식의 법정 필수 기재사항을 정리하세요: [서식명]
법적 근거, 서식 구조, 구현 시 주의사항을 포함하세요.
""")
```

---

#### accounting-expert

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/accounting-expert.md` |
| **설명** | 회계/재무 전문가. 급여대장, 인건비 집계, 원천징수, 세무사 제출 Excel(exceljs), 재무 차트(recharts) |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | orange |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 세무사 위탁을 위한 정확한 집계 데이터 생성. Excel 양식 호환, 절사 규칙 일관성

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 accounting-expert입니다. 회계/재무 전문가로서,
다음 Excel 내보내기 로직을 설계하세요: [기능 설명]
시트 구조, 컬럼, 데이터 소스, 절사 규칙을 포함하세요.
""")
```

---

### 품질본부

#### code-reviewer

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/code-reviewer.md` |
| **설명** | 코드 품질 리뷰 전문가. 코드 품질, 패턴, 타입 안전성, 프로젝트 컨벤션 검토 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | yellow |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 최근 변경된 코드의 품질 리뷰. Critical → Major → Minor → Positive 4단계 심각도. security-auditor와 역할 분리 (보안은 security-auditor 담당)

**호출 예시** (내장 에이전트 직접 호출 가능):
```
# 내장 subagent_type으로 직접 호출 (권장)
Task(subagent_type: "code-reviewer", prompt: "최근 변경된 코드를 리뷰해주세요.")

# CLI
claude --agent code-reviewer
```

---

#### security-auditor

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/security-auditor.md` |
| **설명** | 보안 감사 전문가. RBAC 적용 검증, 권한 최소화, 민감 데이터 보호, OWASP Top 10 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | red |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: RBAC 실제 적용 검증 + 민감 데이터 보호 + 최소 권한 원칙. code-reviewer와 역할 분리 (코드 품질은 code-reviewer 담당)

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 security-auditor입니다. 보안 감사 전문가로서,
다음 Server Action의 보안을 점검하세요: [Action 이름]
RBAC 검증, 민감 데이터 접근 제어, OWASP 관점을 포함하세요.
""")
```

---

#### qa-engineer

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/qa-engineer.md` |
| **설명** | QA/테스트 전문가. Vitest 기반 단위 테스트, 경계값 분석, 동치 분할, 급여/보험 정확성 검증 |
| **모델** | sonnet |
| **비용** | 보통 |
| **색상** | red |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 비즈니스 로직 정확성 보장. 경계값(상한/하한), 절사 규칙, 상태 전이 테스트. describe/it 한국어

**호출 예시**:
```
Task(subagent_type: "general-purpose", prompt: """
당신은 qa-engineer입니다. QA/테스트 전문가로서,
다음 모듈의 테스트를 설계하세요: [모듈 경로]
경계값 분석, 동치 분할, 엣지케이스를 포함한 Vitest 테스트 코드를 작성하세요.
""")
```

---

#### technical-writer

| 항목 | 값 |
|------|-----|
| **파일** | `.claude/agents/technical-writer.md` |
| **설명** | 기술 문서 전문가. MEMORY.md 갱신, 에이전트 메모리 정리, 코드 주석 감사, 세션 간 지식 연속성 |
| **모델** | **haiku** |
| **비용** | **낮음** |
| **색상** | white |
| **메모리** | project |
| **도구** | Read, Grep, Glob, Bash |

**핵심 역할**: 프로젝트 지식의 세션 간 연속성 보장. MEMORY.md 200줄 이내 유지, 에이전트 메모리 정리

**호출 예시**:
```
Task(subagent_type: "general-purpose", model: "haiku", prompt: """
당신은 technical-writer입니다. 기술 문서 전문가로서,
MEMORY.md를 현재 상태로 업데이트하세요.
구현 완료 기능, 다음 단계, 주의사항을 반영하세요.
""")
```

---

## 4. 검증 프로토콜 레시피

### P0: 기획 (새 기능 기획 시)

**참여**: product-manager (단독)

```
Task(subagent_type: "general-purpose", prompt: """
당신은 product-manager입니다.
[기능 설명]의 요구사항을 정의하세요.
사용자 스토리, 수용 기준, 도메인 자문 필요 영역, 기술 요구사항을 포함하세요.
""")
```

---

### P1: 설계 리뷰 (아키텍처 결정 시)

**참여**: fullstack-architect + db-architect + ui-ux-advisor (3개 **병렬**)

```
# 3개를 하나의 메시지에서 동시 호출
Task(subagent_type: "general-purpose", prompt: """
당신은 fullstack-architect입니다. [기능]의 기술 설계를 수행하세요.
파일 구조, SC/CC 분리, Server Actions, 에러 핸들링을 포함하세요.
""")

Task(subagent_type: "general-purpose", prompt: """
당신은 db-architect입니다. [기능]의 DB 스키마를 설계하세요.
모델, 관계, 인덱스, 마이그레이션 전략을 포함하세요.
""")

Task(subagent_type: "general-purpose", prompt: """
당신은 ui-ux-advisor입니다. [기능]의 UI를 설계하세요.
컴포넌트 구성, 인터랙션 흐름, 반응형 전략을 포함하세요.
""")
```

---

### P2: 품질 게이트 (구현 완료 후)

**참여**: code-reviewer (단독)

```
Task(subagent_type: "code-reviewer", prompt: """
최근 구현된 [기능명] 관련 코드를 리뷰해주세요.
변경 파일: [파일 목록]
""")
```

---

### P3: 교차검증 (급여/노무 정확성 필수 시)

**참여**: hr-labor-expert → payroll-tax-expert (**순차**)

```
# Step 1: 노무 자문
Task(subagent_type: "general-purpose", model: "opus", prompt: """
당신은 hr-labor-expert입니다.
[기능]에 적용되는 근로기준법 규정을 정리하세요.
법적 근거, 계산식, 엣지케이스를 포함하세요.
""")

# Step 2: Step 1 결과를 받은 후 급여 검증
Task(subagent_type: "general-purpose", model: "opus", prompt: """
당신은 payroll-tax-expert입니다.
다음 노무 자문 결과를 기반으로 급여 계산 로직을 검증하세요:
[Step 1의 결과]
절사 규칙, 상한/하한, 계산 예시를 포함하세요.
""")
```

---

### P4: 스키마 검증 (DB 마이그레이션 전)

**참여**: db-architect (단독)

```
Task(subagent_type: "general-purpose", prompt: """
당신은 db-architect입니다.
다음 Prisma 스키마 변경을 검증하세요:
[변경 내용 또는 prisma/schema.prisma diff]
기존 데이터 보존, 인덱스, 관계, SQLite 제약을 확인하세요.
""")
```

---

## 5. agent-memory 디렉토리 구조

각 에이전트는 `.claude/agent-memory/<에이전트명>/` 디렉토리에 영속 메모리를 보유합니다.
`MEMORY.md`는 에이전트 시스템 프롬프트에 자동 로드되며 200줄 제한이 있습니다.

```
.claude/agent-memory/
├── product-manager/
│   └── MEMORY.md
├── fullstack-architect/
│   └── MEMORY.md
├── db-architect/
│   └── MEMORY.md
├── ui-ux-advisor/
│   └── MEMORY.md
├── devops-engineer/
│   └── MEMORY.md
├── hr-labor-expert/
│   └── MEMORY.md
├── payroll-tax-expert/
│   └── MEMORY.md
├── employment-subsidy-expert/
│   └── MEMORY.md
├── sme-policy-expert/
│   └── MEMORY.md
├── tax-incentive-expert/
│   └── MEMORY.md
├── document-admin-expert/
│   └── MEMORY.md
├── accounting-expert/
│   └── MEMORY.md
├── code-reviewer/
│   └── MEMORY.md
├── security-auditor/
│   └── MEMORY.md
├── qa-engineer/
│   └── MEMORY.md
├── technical-writer/
│   └── MEMORY.md
└── coordinator/          ← coordinator 사용 시 생성
    └── MEMORY.md
```

**총 17개 디렉토리** (기존 16개 + coordinator)

---

## 부록: 에이전트 조직도 요약

| 부서 | 에이전트 | 모델 | 비용 | 핵심 역할 |
|------|---------|------|------|----------|
| **기획실** | product-manager | sonnet | 보통 | 요구사항 정의, 도메인 자문 라우팅 |
| **기술본부** | fullstack-architect | sonnet | 보통 | 아키텍처/페이지 설계 |
| | db-architect | sonnet | 보통 | DB 스키마, 마이그레이션 |
| | ui-ux-advisor | sonnet | 보통 | UI/UX 설계, 컴포넌트 구조 |
| | devops-engineer | sonnet | 보통 | 빌드, 타입 검사, 배포 |
| **도메인자문단** | hr-labor-expert | **opus** | **높음** | 근로기준법, 연차, 모성보호 |
| | payroll-tax-expert | **opus** | **높음** | 급여 계산, 4대보험, 소득세 |
| | employment-subsidy-expert | **opus** | **높음** | 고용지원금, 출산육아기 지원 |
| | sme-policy-expert | sonnet | 보통 | 중소기업 정책자금, 판로지원 |
| | tax-incentive-expert | sonnet | 보통 | 세제혜택, 두루누리 |
| | document-admin-expert | sonnet | 보통 | 법정 서식, 전자결재 |
| | accounting-expert | sonnet | 보통 | 급여대장, 원천징수, Excel |
| **품질본부** | code-reviewer | sonnet | 보통 | 코드 품질, 패턴, 타입 안전성 |
| | security-auditor | sonnet | 보통 | 보안 취약점, RBAC, 데이터 보호 |
| | qa-engineer | sonnet | 보통 | 테스트 설계/작성 |
| | technical-writer | **haiku** | **낮음** | 문서 정리, MEMORY 갱신 |

---

## 부록: Frontmatter 필드 설명

에이전트 `.md` 파일의 YAML frontmatter에서 사용하는 필드:

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `name` | string | 에이전트 고유 이름 (파일명과 일치) | `code-reviewer` |
| `description` | string | 에이전트 설명 + 사용 예시 | `"코드 품질 리뷰 전문가..."` |
| `model` | string | 사용 모델 (`opus`, `sonnet`, `haiku`) | `sonnet` |
| `color` | string | 터미널 표시 색상 | `yellow` |
| `memory` | string | 메모리 범위 (`project` = 프로젝트 공유) | `project` |
| `tools` | string | 사용 가능한 도구 (쉼표 구분) | `Read, Grep, Glob, Bash` |
