-- Supabase SQL Editor에서 실행하여 캠페인 확인

-- 1. 모든 캠페인 개수 확인
SELECT 
  COUNT(*) as total_campaigns,
  status
FROM campaigns
GROUP BY status;

-- 2. 모집 중인 캠페인 상세 확인
SELECT 
  id,
  title,
  recruitment_count,
  recruitment_start_date,
  recruitment_end_date,
  status,
  created_at
FROM campaigns
WHERE status = 'recruiting'
ORDER BY created_at DESC;

-- 3. 날짜 필터링 포함 (백엔드와 동일한 조건)
SELECT 
  id,
  title,
  recruitment_count,
  recruitment_end_date,
  status
FROM campaigns
WHERE status = 'recruiting'
  AND recruitment_end_date >= CURRENT_DATE
ORDER BY created_at DESC;

