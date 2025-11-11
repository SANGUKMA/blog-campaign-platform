# 블로그 체험단 플랫폼 - 데이터베이스 설계

## 1. 데이터 플로우 개요

### 1.1 사용자 온보딩 플로우
```
회원가입 → Supabase Auth (auth.users)
    ↓
공통 프로필 생성 (profiles)
    ↓
역할 분기
    ├─ 인플루언서 → influencer_profiles + influencer_channels
    └─ 광고주 → advertiser_profiles
```

### 1.2 체험단 운영 플로우 (광고주)
```
광고주 로그인
    ↓
체험단 등록 (campaigns) [상태: recruiting]
    ↓
지원자 확인 (applications 조회)
    ↓
모집 종료 (campaigns.status → closed)
    ↓
선정 처리 (applications.status → selected/rejected)
    ↓
선정 완료 (campaigns.status → completed)
```

### 1.3 체험단 지원 플로우 (인플루언서)
```
인플루언서 로그인
    ↓
홈 페이지 (campaigns 목록 조회: status=recruiting)
    ↓
체험단 상세 (campaigns 단일 조회)
    ↓
지원하기 (applications 생성) [상태: pending]
    ↓
내 지원 목록 (applications 조회)
    ↓
선정 결과 확인 (applications.status: pending/selected/rejected)
```

---

## 2. 데이터베이스 스키마

### 2.1 사용자 관리

#### `profiles` - 공통 사용자 프로필
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('advertiser', 'influencer')),
  terms_agreed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

#### `influencer_profiles` - 인플루언서 상세 정보
```sql
CREATE TABLE influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_influencer_profiles_user_id ON influencer_profiles(user_id);
```

#### `advertiser_profiles` - 광고주 상세 정보
```sql
CREATE TABLE advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  business_phone VARCHAR(20) NOT NULL,
  business_number VARCHAR(50) NOT NULL,
  representative_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(business_number)
);

CREATE INDEX idx_advertiser_profiles_user_id ON advertiser_profiles(user_id);
CREATE INDEX idx_advertiser_profiles_business_number ON advertiser_profiles(business_number);
```

---

### 2.2 체험단 관리

#### `campaigns` - 체험단 정보
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES advertiser_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  recruitment_start_date DATE NOT NULL,
  recruitment_end_date DATE NOT NULL,
  recruitment_count INTEGER NOT NULL CHECK (recruitment_count > 0),
  benefits TEXT NOT NULL,
  store_info TEXT NOT NULL,
  mission TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_recruitment_dates ON campaigns(recruitment_start_date, recruitment_end_date);
```

---

### 2.3 지원 관리

#### `applications` - 체험단 지원 정보
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_applications_campaign_id ON campaigns(id);
CREATE INDEX idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_campaign_influencer ON applications(campaign_id, influencer_id);
```

---

## 3. 주요 쿼리 패턴

### 3.1 홈 페이지 - 모집 중인 체험단 목록
```sql
SELECT 
  c.id,
  c.title,
  c.recruitment_start_date,
  c.recruitment_end_date,
  c.recruitment_count,
  c.benefits,
  a.company_name
FROM campaigns c
JOIN advertiser_profiles a ON c.advertiser_id = a.id
WHERE c.status = 'recruiting'
  AND c.recruitment_end_date >= CURRENT_DATE
ORDER BY c.created_at DESC;
```

### 3.2 내 지원 목록 (인플루언서)
```sql
SELECT 
  app.id,
  app.status,
  app.message,
  app.visit_date,
  app.created_at,
  c.title,
  c.benefits,
  c.recruitment_end_date
FROM applications app
JOIN campaigns c ON app.campaign_id = c.id
WHERE app.influencer_id = $1
ORDER BY app.created_at DESC;
```

### 3.3 체험단 지원자 목록 (광고주)
```sql
SELECT 
  app.id,
  app.status,
  app.message,
  app.visit_date,
  app.created_at,
  p.name,
  p.phone,
  p.email,
  p.birth_date,
  inf.channel_name,
  inf.channel_url,
  inf.follower_count
FROM applications app
JOIN influencer_profiles inf ON app.influencer_id = inf.id
JOIN profiles p ON inf.user_id = p.id
WHERE app.campaign_id = $1
ORDER BY app.created_at ASC;
```

### 3.4 체험단 지원 (중복 방지)
```sql
INSERT INTO applications (
  campaign_id,
  influencer_id,
  message,
  visit_date,
  status
) VALUES ($1, $2, $3, $4, 'pending')
ON CONFLICT (campaign_id, influencer_id) DO NOTHING;
```

---

## 4. 데이터 무결성 규칙

### 4.1 제약 조건
- `profiles.role`: 'advertiser' 또는 'influencer'만 허용
- `campaigns.status`: 'recruiting', 'closed', 'completed'만 허용
- `applications.status`: 'pending', 'selected', 'rejected'만 허용
- `applications`: 동일 인플루언서가 동일 체험단에 중복 지원 불가
- `advertiser_profiles.business_number`: 유일성 보장 (중복 등록 방지)

### 4.2 연쇄 작업
- 사용자 삭제 시 관련 프로필, 체험단, 지원 정보 모두 삭제 (CASCADE)
- 체험단 삭제 시 관련 지원 정보 모두 삭제 (CASCADE)

---

## 5. 추가 고려사항

### 5.1 성능 최적화
- 자주 조회되는 컬럼에 인덱스 생성 (status, 날짜 범위 등)
- 복합 인덱스 활용 (campaign_id + influencer_id)

### 5.2 확장 가능성
- 배너 관리 테이블 (향후 추가 가능)
- 리뷰/리포트 테이블 (체험단 종료 후 활동 결과 수집)
- 알림 테이블 (선정/반려 알림)

### 5.3 보안
- Row Level Security (RLS) 적용 권장
  - 인플루언서는 자신의 지원 정보만 조회
  - 광고주는 자신이 등록한 체험단의 지원 정보만 조회
  - Supabase의 RLS 정책 활용

### 5.4 감사 로그
- `created_at`, `updated_at` 필드로 기본 추적
- 필요시 별도 audit_logs 테이블 추가 검토

