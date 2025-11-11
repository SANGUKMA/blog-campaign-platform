-- 블로그 체험단 플랫폼 데이터베이스 스키마 (수정버전)
-- Generated: 2025-11-10

-- ============================================
-- 1. 사용자 관리 테이블
-- ============================================

-- 공통 사용자 프로필
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

COMMENT ON TABLE profiles IS '공통 사용자 프로필 - Supabase Auth 연동';
COMMENT ON COLUMN profiles.role IS '사용자 역할: advertiser(광고주) 또는 influencer(인플루언서)';
COMMENT ON COLUMN profiles.birth_date IS '생년월일 (공통 필수)';

-- 인플루언서 상세 정보
CREATE TABLE influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_influencer_user UNIQUE(user_id)
);

CREATE INDEX idx_influencer_profiles_user_id ON influencer_profiles(user_id);

COMMENT ON TABLE influencer_profiles IS '인플루언서 상세 정보 - SNS 채널 정보';
COMMENT ON COLUMN influencer_profiles.channel_name IS 'SNS 채널명';
COMMENT ON COLUMN influencer_profiles.channel_url IS 'SNS 채널 링크';
COMMENT ON COLUMN influencer_profiles.follower_count IS '팔로워 수';

-- 광고주 상세 정보
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
  CONSTRAINT unique_advertiser_user UNIQUE(user_id),
  CONSTRAINT unique_business_number UNIQUE(business_number)
);

CREATE INDEX idx_advertiser_profiles_user_id ON advertiser_profiles(user_id);
CREATE INDEX idx_advertiser_profiles_business_number ON advertiser_profiles(business_number);

COMMENT ON TABLE advertiser_profiles IS '광고주 상세 정보';
COMMENT ON COLUMN advertiser_profiles.company_name IS '업체명';
COMMENT ON COLUMN advertiser_profiles.address IS '주소';
COMMENT ON COLUMN advertiser_profiles.business_phone IS '업장 전화번호';
COMMENT ON COLUMN advertiser_profiles.business_number IS '사업자등록번호 (중복 불가)';
COMMENT ON COLUMN advertiser_profiles.representative_name IS '대표자명';

-- ============================================
-- 2. 체험단 관리 테이블
-- ============================================

-- 체험단 정보
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

COMMENT ON TABLE campaigns IS '체험단 캠페인 정보';
COMMENT ON COLUMN campaigns.status IS '체험단 상태: recruiting(모집중), closed(모집종료), completed(선정완료)';
COMMENT ON COLUMN campaigns.benefits IS '제공 혜택 설명';
COMMENT ON COLUMN campaigns.mission IS '인플루언서에게 요구되는 미션';

-- ============================================
-- 3. 지원 관리 테이블
-- ============================================

-- 체험단 지원 정보
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_campaign_influencer UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_campaign_influencer ON applications(campaign_id, influencer_id);

COMMENT ON TABLE applications IS '체험단 지원 정보';
COMMENT ON COLUMN applications.message IS '인플루언서의 각오 한마디';
COMMENT ON COLUMN applications.visit_date IS '방문 예정일';
COMMENT ON COLUMN applications.status IS '지원 상태: pending(신청완료), selected(선정), rejected(반려)';

-- ============================================
-- 4. Row Level Security (RLS) 정책
-- ============================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- influencer_profiles: 본인 정보만 조회/수정 가능
CREATE POLICY "Influencers can view own profile" ON influencer_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Influencers can update own profile" ON influencer_profiles
  FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Influencers can insert own profile" ON influencer_profiles
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

-- advertiser_profiles: 본인 정보만 조회/수정 가능
CREATE POLICY "Advertisers can view own profile" ON advertiser_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Advertisers can update own profile" ON advertiser_profiles
  FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Advertisers can insert own profile" ON advertiser_profiles
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
  );

-- campaigns: 모든 사용자가 조회 가능, 광고주만 자신의 캠페인 관리 가능
CREATE POLICY "Anyone can view campaigns" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Advertisers can manage own campaigns" ON campaigns
  FOR ALL USING (
    advertiser_id IN (
      SELECT id FROM advertiser_profiles WHERE user_id IN (
        SELECT id FROM profiles WHERE auth.uid() = id
      )
    )
  );

-- applications: 인플루언서는 본인 지원 내역만, 광고주는 자신의 캠페인 지원자만 조회
CREATE POLICY "Influencers can view own applications" ON applications
  FOR SELECT USING (
    influencer_id IN (
      SELECT id FROM influencer_profiles WHERE user_id IN (
        SELECT id FROM profiles WHERE auth.uid() = id
      )
    )
  );

CREATE POLICY "Advertisers can view campaign applications" ON applications
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN advertiser_profiles ap ON c.advertiser_id = ap.id
      WHERE ap.user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Influencers can insert own applications" ON applications
  FOR INSERT WITH CHECK (
    influencer_id IN (
      SELECT id FROM influencer_profiles WHERE user_id IN (
        SELECT id FROM profiles WHERE auth.uid() = id
      )
    )
  );

CREATE POLICY "Advertisers can update campaign applications" ON applications
  FOR UPDATE USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN advertiser_profiles ap ON c.advertiser_id = ap.id
      WHERE ap.user_id IN (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

-- ============================================
-- 5. 함수 및 트리거
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 설정
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
