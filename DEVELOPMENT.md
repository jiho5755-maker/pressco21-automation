# 개발 환경 설정 가이드

소기업 경영 자동화 시스템의 로컬 개발 및 프로덕션 배포 가이드입니다.

## 목차

- [환경 구성](#환경-구성)
- [로컬 개발](#로컬-개발)
- [프로덕션 배포](#프로덕션-배포)
- [데이터베이스 관리](#데이터베이스-관리)
- [문제 해결](#문제-해결)

---

## 환경 구성

### 필수 도구

- Node.js 20+ 
- npm 또는 pnpm
- Git

### 초기 설정

1. **환경변수 파일 생성**

   ```bash
   cp .env.example .env.local
   ```

2. **환경변수 수정** (`.env.local`)

   ```bash
   # 로컬 개발용 SQLite (기본값)
   DATABASE_URL="file:./dev.db"
   
   # Auth.js 키 생성 (32자 이상)
   AUTH_SECRET="$(openssl rand -base64 32)"
   
   # 관리자 계정
   AUTH_ADMIN_EMAIL="admin@company.com"
   AUTH_ADMIN_PASSWORD="admin1234"
   ```

3. **의존성 설치**

   ```bash
   npm install
   ```

4. **데이터베이스 초기화**

   ```bash
   # Prisma Client 생성 + DB 스키마 동기화
   npm run postinstall
   
   # 시드 데이터 삽입 (관리자 + 샘플 데이터)
   npm run db:seed
   ```

5. **개발 서버 실행**

   ```bash
   npm run dev
   ```

   → http://localhost:3000

---

## 로컬 개발

### 개발 워크플로우

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 코드 수정 후 타입 체크
npm run type-check

# 3. 린트 검사
npm run lint

# 4. 프로덕션 빌드 테스트
npm run build
```

### 데이터베이스 작업

#### 스키마 변경 후 동기화

```bash
# schema.prisma 수정 후
npm run db:push
```

**중요**: `prisma migrate dev`는 사용하지 마세요!
- 로컬은 SQLite, 프로덕션은 PostgreSQL이므로 마이그레이션 파일이 호환되지 않습니다.
- 대신 `prisma db push`를 사용하여 스키마를 직접 동기화합니다.

#### Prisma Studio 실행

```bash
npm run db:studio
```

→ http://localhost:5555

#### 데이터베이스 초기화

```bash
# ⚠️ 모든 데이터 삭제 후 재생성
npm run db:reset
```

---

## 프로덕션 배포

### 배포 전 체크리스트

1. **schema.prisma 확인**
   
   ```prisma
   datasource db {
     provider = "postgresql"  // ✅ 반드시 PostgreSQL
     url      = env("DATABASE_URL")
   }
   ```

2. **타입 검사**

   ```bash
   npm run type-check
   ```

3. **프로덕션 빌드 테스트**

   ```bash
   npm run build
   ```

4. **커밋 및 푸시**

   ```bash
   git add -A
   git commit -m "feat: 새 기능 추가"
   git push origin main
   ```

### Vercel 자동 배포

1. **push 후 자동 배포 시작** (2-3분 소요)
2. **배포 상태 확인**
   - Vercel 대시보드 → Deployments 탭
3. **프로덕션 URL 확인**
   - https://pressco21-automation.vercel.app

### Vercel 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables:

| 변수명 | 값 | 환경 | 민감도 |
|--------|-----|------|--------|
| `DATABASE_URL` | Neon PostgreSQL 연결 문자열 | Production, Preview | Sensitive |
| `AUTH_SECRET` | JWT 서명 키 (로컬과 다른 값) | Production, Preview | Sensitive |
| `AUTH_ADMIN_EMAIL` | 관리자 이메일 | All | - |
| `AUTH_ADMIN_PASSWORD` | 관리자 비밀번호 | Production, Preview | Sensitive |
| `NEXT_PUBLIC_APP_NAME` | 앱 이름 | All | - |

---

## 데이터베이스 관리

### 로컬 환경 (SQLite)

**특징**:
- 파일 기반 (`prisma/dev.db`)
- 빠른 개발 및 테스트
- Git에서 제외됨 (`.gitignore`)

**명령어**:

```bash
# 스키마 동기화
npm run db:push

# 시드 데이터 삽입
npm run db:seed

# Prisma Studio
npm run db:studio

# 초기화
npm run db:reset
```

### 프로덕션 환경 (PostgreSQL)

**특징**:
- Neon PostgreSQL (Vercel Integration)
- 3GB 무료 티어
- 자동 백업 및 스케일링

**배포 프로세스**:

1. `git push origin main`
2. Vercel이 자동으로:
   - `postinstall` 스크립트 실행
   - `prisma generate` (Prisma Client 생성)
   - `prisma db push` (스키마 동기화)
3. Next.js 빌드 및 배포

---

## 문제 해결

### 배포 실패 - "provider 'sqlite' is not supported"

**원인**: `schema.prisma`의 provider가 SQLite로 되어 있음

**해결**:

```bash
# schema.prisma 수정
datasource db {
  provider = "postgresql"  # sqlite → postgresql
  url      = env("DATABASE_URL")
}

# 커밋 및 푸시
git add prisma/schema.prisma
git commit -m "fix(prisma): PostgreSQL provider로 복원"
git push origin main
```

### 로컬에서 타입 오류

**원인**: Prisma Client가 최신 스키마를 반영하지 않음

**해결**:

```bash
npx prisma generate
npm run type-check
```

### 데이터베이스 스키마 불일치

**원인**: schema.prisma와 실제 DB가 동기화되지 않음

**해결**:

```bash
# 로컬
npm run db:push

# 프로덕션 (Vercel 재배포)
git push origin main
```

### Prisma Studio 연결 실패

**원인**: DATABASE_URL이 올바르지 않음

**해결**:

```bash
# .env.local 확인
cat .env.local | grep DATABASE_URL

# 로컬: file:./dev.db
# 프로덕션: postgresql://...
```

---

## 개발 팁

### 빠른 개발 사이클

```bash
# 1. schema.prisma 수정
# 2. DB 동기화 (자동으로 Prisma Client 재생성)
npm run db:push

# 3. 타입 체크 (백그라운드)
npm run type-check &

# 4. 개발 서버는 자동 재시작됨
```

### Git 커밋 전 체크

```bash
# 타입 체크 + 린트 + 빌드 (일괄)
npm run type-check && npm run lint && npm run build
```

### 프로덕션 환경 테스트

```bash
# 로컬에서 프로덕션 빌드 실행
npm run build
npm start
```

→ http://localhost:3000

---

## 핵심 원칙

1. **schema.prisma는 항상 PostgreSQL로 유지**
   - 로컬에서 임시로 SQLite로 변경하지 마세요
   - `.env.local`의 `DATABASE_URL`만 변경

2. **마이그레이션 파일은 생성하지 않음**
   - `prisma migrate dev` 사용 금지
   - `prisma db push`만 사용

3. **시드 데이터는 Git에 포함**
   - `prisma/seed.ts`는 버전 관리
   - DB 파일(`dev.db`)은 제외

4. **환경변수는 절대 커밋하지 않음**
   - `.env.local`은 `.gitignore`에 포함
   - `.env.example`만 커밋

---

## 추가 리소스

- [Next.js 15 문서](https://nextjs.org/docs)
- [Prisma 6 문서](https://www.prisma.io/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Neon PostgreSQL](https://neon.tech/docs)

