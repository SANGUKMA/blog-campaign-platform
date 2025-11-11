import { z } from "zod";

// 공통 프로필 생성
export const createProfileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  role: z.enum(["advertiser", "influencer"], {
    required_error: "역할을 선택해주세요",
  }),
});

// 인플루언서 프로필 생성
export const createInfluencerProfileSchema = z.object({
  channelName: z.string().min(1, "채널명을 입력해주세요"),
  channelUrl: z.string().url("올바른 URL을 입력해주세요"),
  followerCount: z.number().min(0, "팔로워 수는 0 이상이어야 합니다").default(0),
});

// 광고주 프로필 생성
export const createAdvertiserProfileSchema = z.object({
  companyName: z.string().min(1, "업체명을 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  businessPhone: z.string().min(10, "업장 전화번호를 입력해주세요"),
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, "사업자등록번호 형식이 올바르지 않습니다"),
  representativeName: z.string().min(1, "대표자명을 입력해주세요"),
});

// 타입 추출
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type CreateInfluencerProfileInput = z.infer<
  typeof createInfluencerProfileSchema
>;
export type CreateAdvertiserProfileInput = z.infer<
  typeof createAdvertiserProfileSchema
>;

