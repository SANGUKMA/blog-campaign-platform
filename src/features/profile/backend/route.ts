import type { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/backend/hono/context";
import { ProfileService } from "./service";
import {
  createProfileSchema,
  createInfluencerProfileSchema,
  createAdvertiserProfileSchema,
} from "./schema";
import { success, failure, respond } from "@/backend/http/response";

export const registerProfileRoutes = (app: Hono<AppEnv>) => {
  // 공통 프로필 생성
  app.post(
  "/",
  zValidator("json", createProfileSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const data = c.req.valid("json");
      const service = new ProfileService(c.get("supabase"));

      await service.createProfile(userId, data);

      return respond(c, success({ message: "프로필이 생성되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);

// 프로필 조회
app.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      // 로그인하지 않은 경우 null 반환 (에러가 아님)
      return respond(c, success(null));
    }

    const service = new ProfileService(c.get("supabase"));
    const data = await service.getFullProfile(userId);

    return respond(c, success(data));
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 인플루언서 프로필 생성
app.post(
  "/influencer",
  zValidator("json", createInfluencerProfileSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const data = c.req.valid("json");
      const service = new ProfileService(c.get("supabase"));

      await service.createInfluencerProfile(userId, data);

      return respond(c, success({ message: "인플루언서 프로필이 생성되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);

// 광고주 프로필 생성
app.post(
  "/advertiser",
  zValidator("json", createAdvertiserProfileSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const data = c.req.valid("json");
      const service = new ProfileService(c.get("supabase"));

      await service.createAdvertiserProfile(userId, data);

      return respond(c, success({ message: "광고주 프로필이 생성되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);
};