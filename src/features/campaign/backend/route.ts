import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppEnv } from "@/backend/hono/context";
import { CampaignService } from "./service";
import { createCampaignSchema, updateCampaignStatusSchema } from "./schema";
import { success, failure, respond } from "@/backend/http/response";

const campaignRoute = new Hono<AppEnv>();

// 모집 중인 캠페인 목록
campaignRoute.get("/", async (c) => {
  try {
    const service = new CampaignService(c.get("supabase"));
    const data = await service.getRecruitingCampaigns();

    return respond(c, success(data));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 캠페인 생성
campaignRoute.post("/", zValidator("json", createCampaignSchema), async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
    }

    const data = c.req.valid("json");
    const service = new CampaignService(c.get("supabase"));

    await service.createCampaign(userId, data);

    return respond(c, success({ message: "체험단이 등록되었습니다" }));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 광고주의 캠페인 목록
campaignRoute.get("/my", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
    }

    const service = new CampaignService(c.get("supabase"));
    const data = await service.getCampaignsByAdvertiser(userId);

    return respond(c, success(data));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 캠페인 상세 조회
campaignRoute.get("/:id", async (c) => {
  try {
    const campaignId = c.req.param("id");
    const service = new CampaignService(c.get("supabase"));
    const data = await service.getCampaignById(campaignId);

    return respond(c, success(data));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 캠페인 상태 변경
campaignRoute.patch(
  "/:id/status",
  zValidator("json", updateCampaignStatusSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const campaignId = c.req.param("id");
      const statusData = c.req.valid("json");
      const service = new CampaignService(c.get("supabase"));

      await service.updateCampaignStatus(userId, campaignId, statusData);

      return respond(c, success({ message: "상태가 변경되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);

export default campaignRoute;