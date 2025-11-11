-- 캠페인 날짜 업데이트 (Supabase SQL Editor에서 실행)

-- 모든 모집 중인 캠페인의 종료 날짜를 2025년 12월 31일로 업데이트
UPDATE campaigns 
SET 
  recruitment_end_date = '2025-12-31',
  recruitment_start_date = '2025-11-10'
WHERE status = 'recruiting';

-- 결과 확인
SELECT 
  id,
  title,
  recruitment_start_date,
  recruitment_end_date,
  status
FROM campaigns
WHERE status = 'recruiting';

