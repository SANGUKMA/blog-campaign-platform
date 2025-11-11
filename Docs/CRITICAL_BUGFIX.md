# 🚨 로그인/회원가입 오류 긴급 수정 완료

## 🐛 발견된 문제

### 증상
- 로그인 클릭 시 첫 페이지로 돌아옴
- 회원가입도 동일한 증상
- 콘솔에 `GET /api/profile 401 (Unauthorized)` 에러 반복 발생

### 근본 원인
1. **API 라우트 미등록**: Hono 앱에서 라우트가 잘못 등록됨
2. **userId 컨텍스트 누락**: API에서 사용자 ID를 가져올 수 없음
3. **인증 미들웨어 없음**: 세션에서 userId 추출하는 로직 부재
4. **환경 변수 부족**: 백엔드용 Supabase 환경 변수 누락
5. **응답 형식 불일치**: 프론트엔드가 기대하는 형식과 다름

---

## ✅ 수정 사항

### 1. API 라우트 등록 수정 (`src/backend/hono/app.ts`)

**문제**: `basePath('/api')` 사용으로 경로가 `/api/api/profile`로 중복됨

**수정**:
```typescript
// Before
const api = app.basePath('/api');
api.route('/profile', profileRoute);

// After
app.route('/profile', profileRoute);
```

### 2. userId 컨텍스트 추가 (`src/backend/hono/context.ts`)

**문제**: AppContext에 userId가 없어서 인증 불가

**수정**:
```typescript
export type AppVariables = {
  supabase: SupabaseClient;
  logger: AppLogger;
  config: AppConfig;
  userId?: string;  // ✅ 추가
};
```

### 3. 인증 미들웨어 추가 (`src/backend/middleware/auth.ts`)

**문제**: 세션에서 userId를 추출하는 로직 없음

**수정**: 새로운 미들웨어 생성
```typescript
export const withAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return getCookie(c, name);
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      c.set('userId', user.id);
    }

    await next();
  });
```

### 4. 응답 형식 수정 (`src/backend/http/response.ts`)

**문제**: 프론트엔드가 `data.data` 형식 기대, 백엔드는 `data` 직접 반환

**수정**:
```typescript
// Before
return c.json(result.data, result.status);

// After
return c.json({ data: result.data }, result.status);
```

### 5. 환경 변수 추가 (`.env.local`)

**문제**: 백엔드용 Supabase 환경 변수 누락

**수정**: 다음 변수 추가
```env
# 백엔드용 (새로 추가)
SUPABASE_URL=your-project-url-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 🚀 즉시 실행 필요 사항

### 1. `.env.local` 파일 설정

로컬 개발 환경인 경우:

```bash
# Supabase 로컬 개발 환경 시작
supabase start
```

출력된 정보를 `.env.local`에 입력:

```env
# 클라이언트용
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 백엔드용 (중요!)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 개발 서버 재시작

```bash
# 개발 서버 중지 (Ctrl+C)

# 개발 서버 재시작
npm run dev
```

---

## 🧪 테스트 방법

### 1. 회원가입 테스트
1. http://localhost:3000/signup 접속
2. 이메일/비밀번호 입력 후 "회원가입" 클릭
3. ✅ 온보딩 페이지(`/onboarding`)로 자동 이동해야 함
4. ❌ 첫 페이지로 돌아가면 안됨

### 2. 로그인 테스트
1. 온보딩 완료 후 로그아웃
2. http://localhost:3000/login 접속
3. 이메일/비밀번호 입력 후 "로그인" 클릭
4. ✅ 역할에 맞는 페이지로 자동 이동해야 함
   - 광고주: `/advertiser/dashboard`
   - 인플루언서: 홈(`/`)

### 3. API 테스트
브라우저 콘솔에서 확인:
- ❌ `401 Unauthorized` 에러 없어야 함
- ✅ `/api/profile` 정상 응답

---

## 📊 수정된 파일 목록

1. ✅ `src/backend/hono/app.ts` - 라우트 등록 수정, auth 미들웨어 추가
2. ✅ `src/backend/hono/context.ts` - userId 타입 추가
3. ✅ `src/backend/middleware/auth.ts` - 신규 생성
4. ✅ `src/backend/http/response.ts` - 응답 형식 수정
5. ✅ `.env.local` - 백엔드 환경 변수 추가

---

## 🔍 작동 원리

### 인증 플로우
```
1. 사용자 로그인/회원가입 → Supabase Auth 세션 생성
   ↓
2. API 요청 시 쿠키에 세션 정보 포함
   ↓
3. withAuth 미들웨어가 쿠키에서 세션 추출
   ↓
4. Supabase에서 사용자 정보 확인
   ↓
5. userId를 컨텍스트에 저장
   ↓
6. 각 API 라우트에서 c.get('userId')로 사용자 ID 접근
```

### 응답 형식
```typescript
// Success
{
  "data": {
    // 실제 데이터
  }
}

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  },
  "message": "에러 메시지"
}
```

---

## ⚠️ 주의사항

### 1. Service Role Key 보안
- **절대로 프론트엔드에 노출하지 마세요**
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- 프로덕션에서는 환경 변수로 안전하게 관리

### 2. 로컬 vs 프로덕션
- **로컬**: `http://localhost:54321` + `supabase start`
- **프로덕션**: Supabase 대시보드에서 실제 URL과 키 사용

### 3. 캐시 문제
문제가 계속되면:
```bash
# 브라우저 캐시 완전 삭제
# Chrome: Ctrl+Shift+Delete → 전체 삭제

# Next.js 캐시 삭제
rm -rf .next

# 재시작
npm run dev
```

---

## 🎯 예상 결과

### 수정 전
- ❌ 로그인 후 첫 페이지로 돌아옴
- ❌ 401 에러 반복
- ❌ 온보딩 진행 불가

### 수정 후
- ✅ 로그인 후 역할별 페이지로 자동 이동
- ✅ 401 에러 없음
- ✅ 온보딩 정상 진행
- ✅ 프로필 API 정상 작동
- ✅ 전체 플로우 정상 작동

---

## 📝 다음 단계

1. **환경 변수 설정**: `.env.local` 파일 확인 및 수정
2. **서버 재시작**: `npm run dev` 실행
3. **테스트**: 회원가입 → 온보딩 → 로그인 전체 플로우 테스트
4. **확인**: 콘솔에 401 에러 없는지 확인

---

## 💡 문제 해결

### 여전히 401 에러가 발생하는 경우

1. `.env.local` 파일이 제대로 로드되었는지 확인
2. 개발 서버를 완전히 재시작했는지 확인
3. 브라우저 캐시를 완전히 삭제했는지 확인
4. `supabase start`가 실행 중인지 확인 (로컬 개발 시)

### Supabase 연결 문제

```bash
# Supabase 상태 확인
supabase status

# Supabase 재시작
supabase stop
supabase start
```

---

이제 로그인과 회원가입이 정상적으로 작동할 것입니다! 🎉

