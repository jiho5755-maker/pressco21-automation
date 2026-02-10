# Vercel 배포 가이드

이 문서는 Next.js 애플리케이션을 Vercel + Vercel Postgres로 배포하는 방법을 안내합니다.

## 사전 준비

- [Vercel 계정](https://vercel.com/signup) (GitHub 연동 권장)
- GitHub 저장소: https://github.com/jiho5755-maker/pressco21-automation

---

## 1단계: Vercel에 프로젝트 연결

### 1-1. Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. **Add New** → **Project** 클릭

### 1-2. GitHub 저장소 연결
1. **Import Git Repository** 섹션에서 `pressco21-automation` 검색
2. **Import** 버튼 클릭
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값 유지)
   - **Build Command**: `npm run build` (기본값 유지)
   - **Output Directory**: `.next` (기본값 유지)

---

## 2단계: Vercel Postgres 생성

### 2-1. Storage 탭에서 Postgres 생성
1. Vercel 프로젝트 대시보드 → **Storage** 탭
2. **Create Database** → **Postgres** 선택
3. 데이터베이스 이름 입력 (예: `pressco21-db`)
4. 리전 선택: **Washington, D.C., USA (iad1)** (권장)
5. **Create** 클릭

### 2-2. 프로젝트에 연결
1. 생성된 데이터베이스 선택
2. **Connect Project** → `pressco21-automation` 선택
3. **Connect** 클릭
4. → **DATABASE_URL** 환경변수가 자동으로 추가됩니다 ✅

---

## 3단계: 환경변수 설정

### 3-1. Environment Variables 추가
Vercel 프로젝트 → **Settings** → **Environment Variables**에서 다음 변수들을 추가:

#### 필수 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | (자동 설정됨) | Vercel Postgres 연결 URL |
| `AUTH_SECRET` | (생성 필요) | Auth.js 암호화 키 |
| `AUTH_ADMIN_EMAIL` | `admin@company.com` | 관리자 이메일 |
| `AUTH_ADMIN_PASSWORD` | (설정 필요) | 관리자 비밀번호 |
| `NEXT_PUBLIC_APP_NAME` | `사내 자동화 도구` | 앱 이름 |

#### AUTH_SECRET 생성 방법
로컬 터미널에서 실행:
```bash
openssl rand -base64 32
```
출력된 값을 `AUTH_SECRET`에 입력하세요.

### 3-2. 환경변수 적용 범위
- **Production** ✅
- **Preview** ✅
- **Development** (선택)

**Save** 클릭

---

## 4단계: 데이터베이스 마이그레이션

### 4-1. Vercel CLI 설치 (로컬)
```bash
npm i -g vercel
```

### 4-2. Vercel 로그인
```bash
vercel login
```

### 4-3. 프로젝트 연결
```bash
vercel link
```
- Scope: 본인 계정 선택
- Link to existing project: **Yes**
- Project name: `pressco21-automation`

### 4-4. 환경변수 가져오기
```bash
vercel env pull .env.local
```

### 4-5. Prisma 마이그레이션 실행
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 5단계: 배포

### 자동 배포 (권장)
GitHub에 푸시하면 자동으로 Vercel에 배포됩니다:
```bash
git push origin main
```

Vercel 대시보드 → **Deployments** 탭에서 진행 상황 확인 가능

### 수동 배포 (선택)
```bash
vercel --prod
```

---

## 6단계: 배포 확인

### 6-1. 배포 URL 확인
- Vercel 대시보드에서 **Production** 도메인 확인
- 예: `https://pressco21-automation.vercel.app`

### 6-2. 로그인 테스트
1. 배포된 URL 접속
2. 관리자 계정으로 로그인:
   - Email: `AUTH_ADMIN_EMAIL` 값
   - Password: `AUTH_ADMIN_PASSWORD` 값

### 6-3. 기능 테스트
- 대시보드 통계 확인
- 직원 목록 조회
- RBAC 권한 확인 (Admin/Manager/Viewer)

---

## 🎉 배포 완료!

배포가 성공적으로 완료되었습니다.

### 다음 단계
- 커스텀 도메인 연결 (선택)
- 모니터링 설정
- Vercel Analytics 활성화

### 트러블슈팅

#### 빌드 실패 시
1. Vercel 대시보드 → **Deployments** → 실패한 배포 클릭
2. **Build Logs** 확인
3. 오류 메시지 확인 후 수정

#### 데이터베이스 연결 오류 시
1. `DATABASE_URL` 환경변수 확인
2. Vercel Postgres 상태 확인
3. 마이그레이션 재실행: `npx prisma migrate deploy`

#### 로그인 실패 시
1. `AUTH_SECRET` 환경변수 확인
2. `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD` 확인
3. 시드 데이터 확인: `npx prisma db seed`

---

## 참고 자료
- [Vercel 문서](https://vercel.com/docs)
- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Prisma 문서](https://www.prisma.io/docs)
