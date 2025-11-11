# ⚡ 즉시 수정 가이드

## 🔴 현재 문제
**"Error: 환경 변수를 확인하세요"** 페이지 로드 실패

## ✅ 해결 방법 (3단계)

### 1️⃣ 환경 변수 설정 완료
✅ `.env.local` 파일이 생성되었습니다.

### 2️⃣ 개발 서버 재시작 (필수!)

**현재 터미널에서:**
1. `Ctrl + C` 눌러서 서버 중지
2. 다음 명령 실행:

```bash
npm run dev
```

### 3️⃣ 브라우저 새로고침
- `Ctrl + Shift + R` (강력 새로고침)

---

## 🎯 예상 결과

✅ **성공**: 홈 페이지가 정상적으로 로드됨
❌ **실패**: 여전히 에러 발생

---

## ❌ 여전히 에러가 나면

### A. Supabase CLI 설치 (추천)

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. Docker Desktop이 실행 중인지 확인
# Docker Desktop을 설치하지 않았다면:
# https://www.docker.com/products/docker-desktop/ 에서 다운로드

# 3. Supabase 시작
supabase start
```

출력된 정보를 복사:
```
API URL: http://localhost:54321
anon key: eyJhbG...
service_role key: eyJhbG...
```

### B. `.env.local` 업데이트

위에서 복사한 값으로 업데이트:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_anon_key
SUPABASE_SERVICE_ROLE_KEY=복사한_service_role_key
```

### C. 서버 재시작

```bash
# Ctrl+C로 중지 후
npm run dev
```

---

## 🔍 Docker가 없다면?

### Supabase 클라우드 사용 (무료)

1. https://app.supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호 설정
4. 생성 완료 후: **Settings** → **API**
5. 다음 값 복사:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

6. `.env.local` 파일에 붙여넣기
7. 서버 재시작

---

## 📊 현재 상태 체크

현재 터미널에서 서버가 **실행 중**이면:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

아직 **에러**가 나면:
```
Error: 환경 변수를 확인하세요
```
→ 위의 A, B, C 단계 진행

---

## 💡 핵심 포인트

1. **환경 변수 변경 후 반드시 서버 재시작**
2. **Supabase가 실행 중이어야 함** (로컬 또는 클라우드)
3. **브라우저 캐시 삭제** (Ctrl+Shift+R)

---

## 🆘 긴급 우회

테스트만 하려면 (DB 없이):
1. 위에서 설정한 기본값 그대로 사용
2. 서버 재시작
3. 페이지는 로드되지만 로그인/회원가입은 작동 안함
4. 나중에 Supabase 설정 후 재시작하면 정상 작동

