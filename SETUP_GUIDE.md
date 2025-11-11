# 🚀 빠른 시작 가이드

## ⚠️ 현재 상황
환경 변수가 설정되지 않아 페이지가 로드되지 않는 문제가 발생했습니다.

## 🔧 즉시 해결 방법 (2가지 옵션)

### 옵션 1: Supabase CLI 사용 (권장)

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. 프로젝트 초기화 (이미 되어있을 수 있음)
supabase init

# 3. Supabase 로컬 서버 시작
supabase start

# 4. 출력된 정보를 .env.local에 복사
# API URL: http://localhost:54321
# anon key: eyJhbGc...
# service_role key: eyJhbGc...
```

### 옵션 2: Supabase 클라우드 사용

1. https://app.supabase.com 접속
2. 새 프로젝트 생성
3. **Project Settings** → **API** 이동
4. 다음 값을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 📝 .env.local 파일 설정

프로젝트 루트에 `.env.local` 파일을 열고 다음과 같이 설정:

```env
# Supabase 클라이언트 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_실제_키_입력

# Supabase 백엔드 설정 (API 호출 시 필요)
SUPABASE_SERVICE_ROLE_KEY=여기에_실제_키_입력
```

## 🔄 개발 서버 재시작

환경 변수 변경 후 **반드시** 서버를 재시작해야 합니다:

```bash
# 1. 현재 실행 중인 서버 중지 (터미널에서 Ctrl+C)

# 2. 서버 재시작
npm run dev
```

## 🗄️ 데이터베이스 마이그레이션

Supabase가 실행되면 데이터베이스 스키마를 생성합니다:

```bash
# Supabase CLI 사용 시
supabase db reset

# 또는
supabase migration up
```

## ✅ 확인 사항

서버 재시작 후:
1. ✅ 브라우저에서 http://localhost:3000 접속
2. ✅ "환경 변수를 확인하세요" 에러 사라짐
3. ✅ 홈 페이지 정상 로드
4. ✅ 회원가입/로그인 가능

## 🐛 여전히 문제가 있다면

### 1. 환경 변수 확인
```bash
# PowerShell에서
Get-Content .env.local
```

### 2. 브라우저 캐시 삭제
- Chrome: `Ctrl + Shift + Delete`
- 모든 캐시 삭제

### 3. Next.js 캐시 삭제
```bash
rm -rf .next
npm run dev
```

### 4. Supabase 상태 확인 (CLI 사용 시)
```bash
supabase status
```

## 📚 추가 문서

- `/Docs/IMPLEMENTATION_GUIDE.md` - 전체 구현 가이드
- `/Docs/CRITICAL_BUGFIX.md` - 로그인 버그 수정 상세
- `/Docs/database.md` - 데이터베이스 스키마

## 🆘 도움이 필요하면

1. Supabase가 실행 중인지 확인
2. `.env.local` 파일에 실제 키가 있는지 확인
3. 서버를 재시작했는지 확인
4. 브라우저 콘솔에서 에러 메시지 확인

