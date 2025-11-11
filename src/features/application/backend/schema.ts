import { z } from "zod";

// 지원하기
export const createApplicationSchema = z.object({
  campaignId: z.string().uuid("올바른 체험단 ID가 아닙니다"),
  message: z.string().min(1, "각오 한마디를 입력해주세요"),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
});

// 지원 상태 변경 (광고주용)
export const updateApplicationStatusSchema = z.object({
  status: z.enum(["selected", "rejected"]),
});

// 여러 지원 선정/반려
export const bulkUpdateApplicationsSchema = z.object({
  applicationIds: z.array(z.string().uuid()),
  status: z.enum(["selected", "rejected"]),
});

// 타입 추출
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type BulkUpdateApplicationsInput = z.infer<typeof bulkUpdateApplicationsSchema>;

