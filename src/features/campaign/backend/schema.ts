import { z } from "zod";

// 캠페인 생성
export const createCampaignSchema = z.object({
  title: z.string().min(1, "체험단명을 입력해주세요"),
  recruitmentStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
  recruitmentEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
  recruitmentCount: z.number().min(1, "모집인원은 1명 이상이어야 합니다"),
  benefits: z.string().min(1, "제공혜택을 입력해주세요"),
  storeInfo: z.string().min(1, "매장정보를 입력해주세요"),
  mission: z.string().min(1, "미션을 입력해주세요"),
});

// 캠페인 상태 변경
export const updateCampaignStatusSchema = z.object({
  status: z.enum(["recruiting", "closed", "completed"]),
});

// 타입 추출
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignStatusInput = z.infer<typeof updateCampaignStatusSchema>;

