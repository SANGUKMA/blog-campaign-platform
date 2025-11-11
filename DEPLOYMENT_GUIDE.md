# 🚀 배포 가이드

블로그 체험단 플랫폼을 GitHub와 Vercel에 배포하는 방법입니다.

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [GitHub 저장소 생성 및 푸시](#github-저장소-생성-및-푸시)
3. [Vercel 배포](#vercel-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 확인](#배포-확인)
6. [도메인 설정 (선택)](#도메인-설정-선택)

---

## 1. 사전 준비

### ✅ 필요한 것

- [x] GitHub 계정
- [x] Vercel 계정 (무료)
- [x] Supabase 프로젝트 (이미 있음)
- [x] 로컬 프로젝트 (현재 작업 중인 것)

---

## 2. GitHub 저장소 생성 및 푸시

### 2-1. GitHub에서 새 저장소 생성

1. **GitHub 접속**
   ```
   https://github.com
   ```

2. **New repository 클릭**
   - Repository name: `blog-campaign-platform` (원하는 이름)
   - Description: `블로그 체험단 플랫폼`
   - Public 또는 Private 선택
   - **Do NOT initialize** (README, .gitignore 체크 해제)

3. **Create repository** 클릭

### 2-2. 로컬 프로젝트에서 Git 초기화 및 푸시

**PowerShell에서 프로젝트 루트에서 실행:**

```powershell
# Git 저장소 확인 (이미 있을 수 있음)
git status

# 만약 "not a git repository" 에러가 나면:
git init

# .gitignore 확인 (이미 있어야 함)
# .env.local이 무시되는지 확인
Get-Content .gitignore | Select-String "\.env"

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Blog campaign platform"

# 원격 저장소 연결 (GitHub에서 복사한 URL 사용)
git remote add origin https://github.com/YOUR_USERNAME/blog-campaign-platform.git

# 푸시
git branch -M main
git push -u origin main
```

### 2-3. .gitignore 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인:

```gitignore
# 환경 변수 (절대 커밋하지 않음!)
.env
.env.local
.env*.local

# Next.js
.next/
out/

# Node modules
node_modules/

# 기타
.DS_Store
*.log
```

---

## 3. Vercel 배포

### 3-1. Vercel 계정 생성 및 GitHub 연결

1. **Vercel 접속**
   ```
   https://vercel.com
   ```

2. **Sign Up with GitHub**
   - GitHub 계정으로 로그인

3. **권한 승인**
   - Vercel이 GitHub 저장소에 접근할 수 있도록 허용

### 3-2. 프로젝트 Import

1. **"Add New..." → "Project" 클릭**

2. **Import Git Repository**
   - 방금 생성한 `blog-campaign-platform` 저장소 선택
   - **Import** 클릭

3. **프로젝트 설정**
   - **Framework Preset:** Next.js (자동 감지됨)
   - **Root Directory:** `./` (기본값)
   - **Build Command:** `npm run build` (기본값)
   - **Output Directory:** `.next` (기본값)

4. **환경 변수 추가 (중요!)**
   
   **Environment Variables 섹션에서 추가:**

   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://zufbiazdgisxxeytzsim.supabase.co
   
   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZmJpYXpkZ2lzeHhleXR6c2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDMwMTYsImV4cCI6MjA3ODMxOTAxNn0.c6RgDtdi9xJ4Ku_dn2zzJx8XP79cKESnYginjrESG1A
   
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZmJpYXpkZ2lzeHhleXR6c2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc0MzAxNiwiZXhwIjoyMDc4MzE5MDE2fQ.iHL56azfQ5jCqAx3MiBuiHSiU2bB2WXZKD7lyAcJfTc
   ```

5. **Deploy 클릭**

### 3-3. 배포 대기

- 빌드가 시작됩니다 (약 2-5분 소요)
- 진행 상황을 실시간으로 볼 수 있습니다

---

## 4. 환경 변수 설정

### Supabase 허용 URL 추가

배포가 완료되면 Vercel에서 제공하는 URL을 Supabase에 추가해야 합니다.

1. **Vercel에서 배포 URL 복사**
   ```
   예: https://blog-campaign-platform.vercel.app
   ```

2. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com/project/zufbiazdgisxxeytzsim
   ```

3. **Settings → API → URL Configuration**

4. **Site URL 추가:**
   ```
   https://blog-campaign-platform.vercel.app
   ```

5. **Redirect URLs 추가:**
   ```
   https://blog-campaign-platform.vercel.app/**
   ```

6. **Save** 클릭

---

## 5. 배포 확인

### 5-1. 웹사이트 접속

```
https://your-project.vercel.app
```

### 5-2. 기능 테스트

- [ ] 홈 페이지 로드
- [ ] 캠페인 목록 표시
- [ ] 회원가입
- [ ] 로그인
- [ ] 온보딩
- [ ] 캠페인 지원 (인플루언서)
- [ ] 캠페인 생성 (광고주)

---

## 6. 도메인 설정 (선택)

### 커스텀 도메인 연결

1. **Vercel 프로젝트 대시보드**
   - **Settings** → **Domains**

2. **도메인 추가**
   - 예: `myplatform.com`

3. **DNS 설정**
   - Vercel이 제공하는 DNS 레코드를 도메인 제공업체에 추가

4. **SSL 인증서**
   - Vercel이 자동으로 생성 (Let's Encrypt)

---

## 🔄 업데이트 배포

### 로컬에서 변경 후 배포

```powershell
# 변경 사항 커밋
git add .
git commit -m "기능 추가: 새로운 기능 설명"

# GitHub에 푸시
git push origin main
```

**자동 배포:**
- Vercel이 자동으로 감지하고 재배포합니다
- 약 2-5분 후 변경 사항이 반영됩니다

---

## 📊 배포 환경 정보

### Production 환경

- **플랫폼:** Vercel
- **Node.js 버전:** 18.x (Vercel 기본값)
- **빌드 명령:** `npm run build`
- **시작 명령:** `npm start`

### 데이터베이스

- **플랫폼:** Supabase
- **위치:** Northeast Asia (Seoul)
- **플랜:** Free Tier

---

## 🆘 문제 해결

### 문제 1: 빌드 실패

**확인:**
1. Vercel 빌드 로그 확인
2. 환경 변수가 모두 설정되었는지 확인
3. 로컬에서 `npm run build` 성공하는지 확인

**해결:**
```powershell
# 로컬에서 테스트
npm run build

# 에러 수정 후
git add .
git commit -m "Fix build error"
git push
```

### 문제 2: 배포 후 페이지가 안 보임

**확인:**
1. Vercel 대시보드에서 배포 상태 확인
2. 브라우저 콘솔 (F12) 에러 확인
3. 환경 변수 확인

**해결:**
- Vercel → Settings → Environment Variables 재확인
- Redeploy 버튼 클릭

### 문제 3: 로그인/회원가입이 안 됨

**확인:**
1. Supabase Site URL이 Vercel URL로 설정되었는지
2. Supabase Redirect URLs에 `/**` 추가되었는지

**해결:**
- Supabase Settings → API → URL Configuration 재확인

### 문제 4: API 에러 (500)

**확인:**
1. Vercel 함수 로그 확인 (Functions 탭)
2. Supabase 연결 확인

**해결:**
- 환경 변수 재확인
- Supabase service_role_key 확인

---

## 📈 모니터링

### Vercel 대시보드

- **Analytics:** 방문자 통계
- **Logs:** 서버 로그
- **Functions:** API 함수 실행 로그

### Supabase 대시보드

- **Database:** 데이터베이스 사용량
- **Auth:** 사용자 인증 통계
- **Logs:** API 요청 로그

---

## 💰 비용

### 무료 플랜 제한

**Vercel Free:**
- 대역폭: 100GB/월
- 빌드 시간: 6,000분/월
- 충분한 개인/소규모 프로젝트용

**Supabase Free:**
- 데이터베이스: 500MB
- 대역폭: 2GB
- 일일 활성 사용자: 50,000명

---

## 🎉 완료!

이제 다음을 얻었습니다:

- ✅ **GitHub 저장소:** 코드 버전 관리
- ✅ **배포 URL:** 전 세계 어디서나 접속 가능
- ✅ **자동 배포:** 코드 푸시하면 자동 배포
- ✅ **SSL 인증서:** HTTPS 자동 지원

---

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting/overview)

---

## 📝 체크리스트

배포 전 확인:

- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] 로컬에서 모든 기능 테스트 완료
- [ ] GitHub 저장소 생성
- [ ] 코드 푸시 완료
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 배포 성공
- [ ] Supabase URL 설정
- [ ] 배포된 사이트 테스트 완료

**모두 완료하면 배포 성공!** 🎉

