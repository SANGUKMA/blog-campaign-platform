# 🚀 Supabase 설정 가이드

현재 **"Failed to fetch"** 에러가 발생하는 이유는 **Supabase 서버가 설정되지 않았기 때문**입니다.

아래 2가지 방법 중 하나를 선택하여 Supabase를 설정하세요.

---

## 📋 목차

1. [옵션 1: Supabase 클라우드 (추천)](#옵션-1-supabase-클라우드-추천) - **5분 소요, 무료**
2. [옵션 2: 로컬 Supabase (Docker 필요)](#옵션-2-로컬-supabase-docker-필요) - **10분 소요**
3. [환경 변수 설정](#환경-변수-설정)
4. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
5. [테스트](#테스트)

---

## 옵션 1: Supabase 클라우드 (추천)

### ✅ 장점
- Docker 불필요
- 무료 플랜 제공
- 빠른 설정 (5분)
- 인터넷만 있으면 어디서든 접속 가능

### 📝 단계별 설정

#### 1단계: Supabase 계정 생성

1. **웹사이트 방문**
   ```
   https://app.supabase.com
   ```

2. **Sign Up** 클릭
   - GitHub 계정으로 가입 (추천)
   - 또는 이메일로 가입

#### 2단계: 프로젝트 생성

1. **New Project** 클릭

2. **프로젝트 정보 입력:**
   - **Name**: `blog-campaign-platform` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (저장해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국)
   - **Pricing Plan**: Free 선택

3. **Create new project** 클릭

4. **대기** (프로젝트 생성에 1-2분 소요)

#### 3단계: API 키 복사

1. 프로젝트 대시보드에서 **Settings** 클릭 (왼쪽 하단 톱니바퀴 아이콘)

2. **API** 메뉴 클릭

3. **다음 정보를 복사:**

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **중요:** `service_role` 키는 **절대 공개하지 마세요!**

#### 4단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성/수정:

**PowerShell에서 실행:**

```powershell
@"
# Supabase 클라우드 설정
NEXT_PUBLIC_SUPABASE_URL=복사한_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_anon_public_키
SUPABASE_SERVICE_ROLE_KEY=복사한_service_role_키
"@ | Out-File -FilePath .env.local -Encoding UTF8 -Force
```

**또는 직접 편집:**

`.env.local` 파일을 열고 다음 내용 입력:

```env
# Supabase 클라우드 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 5단계: 데이터베이스 마이그레이션

1. **SQL Editor 접속**
   - Supabase 대시보드 → **SQL Editor** 메뉴

2. **마이그레이션 파일 복사**
   - 로컬 파일: `supabase/migrations/0002_create_blog_campaign_platform.sql`
   - 파일 내용 전체를 복사

3. **SQL 실행**
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭
   - ✅ "Success" 메시지 확인

4. **테이블 확인**
   - **Table Editor** 메뉴 클릭
   - 다음 테이블이 생성되었는지 확인:
     - `profiles`
     - `influencer_profiles`
     - `advertiser_profiles`
     - `campaigns`
     - `applications`

#### 6단계: 서버 재시작

```bash
# 현재 서버 중지 (Ctrl+C)
npm run dev
```

#### 7단계: 브라우저 새로고침

```
Ctrl + Shift + R
```

---

## 옵션 2: 로컬 Supabase (Docker 필요)

### ✅ 장점
- 완전히 로컬 환경
- 인터넷 없이 개발 가능
- 무료

### ⚠️ 요구사항
- Docker Desktop 설치 필요
- 최소 4GB RAM

### 📝 단계별 설정

#### 1단계: Docker Desktop 설치

1. **Docker Desktop 다운로드**
   ```
   https://www.docker.com/products/docker-desktop
   ```

2. **설치 후 Docker Desktop 실행**

3. **Docker 실행 확인**
   ```bash
   docker --version
   ```
   출력: `Docker version 24.0.0, build ...`

#### 2단계: Supabase CLI 설치

```bash
npm install -g supabase
```

#### 3단계: Supabase 초기화

프로젝트 루트에서:

```bash
supabase init
```

#### 4단계: Supabase 시작

```bash
supabase start
```

⏳ **대기** (첫 실행 시 5-10분 소요, Docker 이미지 다운로드)

#### 5단계: API 키 확인

`supabase start` 완료 후 출력되는 정보:

```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 6단계: 환경 변수 설정

`.env.local` 파일 생성/수정:

```env
# Supabase 로컬 설정
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=출력된_anon_key
SUPABASE_SERVICE_ROLE_KEY=출력된_service_role_key
```

#### 7단계: 마이그레이션 실행

```bash
supabase db push
```

#### 8단계: 서버 재시작

```bash
npm run dev
```

---

## 환경 변수 설정

### 설정 확인

`.env.local` 파일이 다음과 같은지 확인:

```env
# 클라우드 또는 로컬 중 하나
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### ⚠️ 주의사항

1. **파일 위치**: 프로젝트 루트 (package.json과 같은 위치)
2. **파일 이름**: `.env.local` (점으로 시작)
3. **줄바꿈**: 각 변수는 새로운 줄에
4. **공백**: `=` 앞뒤에 공백 없음
5. **따옴표**: 값에 따옴표 불필요

### 설정 후 확인

```bash
# 서버 재시작
npm run dev

# 브라우저에서
http://localhost:3000
```

---

## 데이터베이스 마이그레이션

### 클라우드 Supabase

1. **SQL Editor** 접속
2. `supabase/migrations/0002_create_blog_campaign_platform.sql` 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 클릭

### 로컬 Supabase

```bash
supabase db push
```

### 마이그레이션 파일 위치

```
supabase/
  migrations/
    0002_create_blog_campaign_platform.sql
```

### 테이블 확인

다음 테이블이 생성되어야 함:

- ✅ `profiles` - 사용자 공통 프로필
- ✅ `influencer_profiles` - 인플루언서 정보
- ✅ `advertiser_profiles` - 광고주 정보
- ✅ `campaigns` - 체험단 캠페인
- ✅ `applications` - 체험단 지원

---

## 테스트

### 1단계: 페이지 로드 확인

```
http://localhost:3000
```

- ✅ 홈 페이지가 로드되어야 함
- ❌ "Failed to fetch" 에러 없어야 함

### 2단계: 회원가입 테스트

1. http://localhost:3000/signup 접속
2. 이메일/비밀번호 입력
3. 회원가입 클릭
4. **기대 결과:**
   - ✅ 온보딩 페이지로 이동
   - ✅ 이메일 자동 입력됨

### 3단계: 데이터 확인

**클라우드:**
- Supabase 대시보드 → Table Editor → `profiles` 테이블
- 새로 생성된 사용자 확인

**로컬:**
```bash
supabase db dump
```

---

## 🆘 문제 해결

### 에러 1: "Failed to fetch"

**원인:** Supabase 서버에 연결할 수 없음

**해결:**
1. 클라우드: `.env.local`의 URL 확인
2. 로컬: Docker Desktop 실행 중인지 확인
3. 로컬: `supabase status` 실행

### 에러 2: "relation does not exist"

**원인:** 데이터베이스 테이블이 생성되지 않음

**해결:**
1. 마이그레이션 파일 확인
2. SQL Editor에서 수동 실행
3. 로컬: `supabase db reset`

### 에러 3: "Invalid API key"

**원인:** 환경 변수가 잘못됨

**해결:**
1. `.env.local` 파일 확인
2. API 키 다시 복사
3. 서버 재시작 필수!

### 에러 4: Docker 관련 에러 (로컬)

**원인:** Docker가 실행되지 않음

**해결:**
1. Docker Desktop 실행
2. Docker 상태 확인: `docker ps`
3. Docker 재시작

### 에러 5: 포트 충돌 (로컬)

**원인:** 54321 포트가 이미 사용 중

**해결:**
```bash
# 포트 사용 확인
netstat -ano | findstr :54321

# Supabase 중지 후 재시작
supabase stop
supabase start
```

---

## 💡 추천 설정

### 개발 중
- **로컬 Supabase** (인터넷 없이 개발)
- Docker Desktop 항상 실행

### 테스트/배포
- **클라우드 Supabase** (실제 환경)
- 무료 플랜으로 충분

### 팀 프로젝트
- **클라우드 Supabase** (공유 가능)
- 각자 별도 프로젝트 또는 공유

---

## ✅ 최종 체크리스트

설정 완료 확인:

- [ ] Supabase 프로젝트 생성 (클라우드 또는 로컬)
- [ ] `.env.local` 파일 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 서버 재시작 (`npm run dev`)
- [ ] 브라우저 새로고침
- [ ] 홈 페이지 로드 확인
- [ ] "Failed to fetch" 에러 없음
- [ ] 회원가입 테스트 성공

**모두 체크되면 완료!** 🎉

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🆘 여전히 안 되면?

다음 정보와 함께 질문하세요:

1. **선택한 옵션** (클라우드 또는 로컬)
2. **에러 메시지** (스크린샷 또는 복사)
3. **브라우저 콘솔** 로그 (F12 → Console)
4. **서버 터미널** 로그

빠르게 도와드리겠습니다! 😊

