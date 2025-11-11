# ⚡ 빠른 배포 가이드

## 🎯 3단계로 배포하기

---

## 1️⃣ GitHub 저장소 생성 (5분)

### A. GitHub에서

1. https://github.com 접속
2. **New repository** 클릭
3. 이름: `blog-campaign-platform`
4. Public 선택
5. **Create repository** 클릭

### B. PowerShell에서 (프로젝트 루트에서 실행)

```powershell
# Git 초기화 (이미 있다면 스킵)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Blog campaign platform"

# 원격 저장소 연결 (YOUR_USERNAME을 본인 것으로 변경!)
git remote add origin https://github.com/YOUR_USERNAME/blog-campaign-platform.git

# 푸시
git branch -M main
git push -u origin main
```

**성공 메시지:**
```
Enumerating objects: 100, done.
Writing objects: 100% (100/100), done.
```

---

## 2️⃣ Vercel 배포 (3분)

### A. Vercel 가입

1. https://vercel.com 접속
2. **Sign Up with GitHub** 클릭
3. 권한 승인

### B. 프로젝트 Import

1. **Add New... → Project** 클릭
2. `blog-campaign-platform` 선택 → **Import**
3. **환경 변수 추가:**

```
NEXT_PUBLIC_SUPABASE_URL
https://zufbiazdgisxxeytzsim.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZmJpYXpkZ2lzeHhleXR6c2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDMwMTYsImV4cCI6MjA3ODMxOTAxNn0.c6RgDtdi9xJ4Ku_dn2zzJx8XP79cKESnYginjrESG1A

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZmJpYXpkZ2lzeHhleXR6c2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc0MzAxNiwiZXhwIjoyMDc4MzE5MDE2fQ.iHL56azfQ5jCqAx3MiBuiHSiU2bB2WXZKD7lyAcJfTc
```

4. **Deploy** 클릭

### C. 배포 URL 확인

빌드 완료 후 (2-5분):
```
https://blog-campaign-platform-xxxx.vercel.app
```

---

## 3️⃣ Supabase 설정 (2분)

### A. Redirect URL 추가

1. https://app.supabase.com/project/zufbiazdgisxxeytzsim 접속
2. **Settings** → **Authentication**
3. **URL Configuration 섹션:**
   - **Site URL:** `https://YOUR-VERCEL-URL.vercel.app`
   - **Redirect URLs:** `https://YOUR-VERCEL-URL.vercel.app/**`
4. **Save** 클릭

---

## ✅ 완료!

### 배포된 사이트 접속

```
https://your-project.vercel.app
```

### 테스트

- [ ] 홈 페이지 로드
- [ ] 캠페인 목록 표시
- [ ] 회원가입/로그인

---

## 🔄 업데이트 배포

코드 변경 후:

```powershell
git add .
git commit -m "업데이트 내용"
git push
```

→ Vercel이 자동으로 재배포 (2-5분)

---

## 🎉 결과

✅ **GitHub 저장소:** https://github.com/YOUR_USERNAME/blog-campaign-platform
✅ **배포 URL:** https://your-project.vercel.app
✅ **자동 배포:** 코드 푸시하면 자동 반영

---

## 🆘 에러 발생 시

### 빌드 실패

```powershell
# 로컬에서 테스트
npm run build

# 에러 확인 후 수정
```

### 로그인 안 됨

- Supabase Redirect URLs 재확인
- Vercel 환경 변수 재확인
- Vercel에서 **Redeploy** 클릭

---

**문제가 있으면 알려주세요!** 😊

