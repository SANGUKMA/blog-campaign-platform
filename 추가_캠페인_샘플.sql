-- ======================================
-- 캠페인 샘플 데이터 3개 추가
-- Supabase SQL Editor에서 실행하세요
-- ======================================

-- 기존 광고주 ID를 사용하여 새 캠페인 3개 추가
DO $$
DECLARE
  advertiser_id_val UUID;
BEGIN
  -- 첫 번째 광고주 ID 가져오기
  SELECT id INTO advertiser_id_val FROM advertiser_profiles LIMIT 1;

  -- 샘플 4: 프리미엄 커피 체험단
  INSERT INTO campaigns (
    advertiser_id,
    title,
    recruitment_start_date,
    recruitment_end_date,
    recruitment_count,
    benefits,
    store_info,
    mission,
    status
  ) VALUES (
    advertiser_id_val,
    '프리미엄 원두커피 체험단',
    '2025-11-18',
    '2025-12-18',
    15,
    '프리미엄 원두커피 1kg (3만원 상당)',
    '서울/경기 지역 카페',
    '커피 시음 후 블로그 리뷰 작성 (사진 5장 이상)',
    'recruiting'
  );

  -- 샘플 5: 반려동물 사료 체험단
  INSERT INTO campaigns (
    advertiser_id,
    title,
    recruitment_start_date,
    recruitment_end_date,
    recruitment_count,
    benefits,
    store_info,
    mission,
    status
  ) VALUES (
    advertiser_id_val,
    '반려동물 프리미엄 사료 체험단',
    '2025-11-20',
    '2025-12-20',
    25,
    '프리미엄 사료 5kg (5만원 상당)',
    '전국 배송',
    '반려동물 사료 급여 후 SNS 인증샷 3회 + 블로그 후기',
    'recruiting'
  );

  -- 샘플 6: 피트니스 센터 체험단
  INSERT INTO campaigns (
    advertiser_id,
    title,
    recruitment_start_date,
    recruitment_end_date,
    recruitment_count,
    benefits,
    store_info,
    mission,
    status
  ) VALUES (
    advertiser_id_val,
    '프리미엄 피트니스 센터 1개월 무료 체험',
    '2025-11-15',
    '2025-12-01',
    8,
    '1개월 무료 이용권 (10만원 상당) + PT 1회',
    '서울 강남구',
    '주 3회 이상 출석 인증 + 운동 일지 블로그 작성 (주 1회)',
    'recruiting'
  );

  RAISE NOTICE '캠페인 3개가 추가되었습니다!';
END $$;

-- 결과 확인
SELECT 
  id,
  title,
  recruitment_count,
  recruitment_start_date,
  recruitment_end_date,
  status
FROM campaigns
WHERE status = 'recruiting'
ORDER BY created_at DESC;

