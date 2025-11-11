import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppContext } from "@/backend/hono/context";
import { ApplicationService } from "./service";
import { createApplicationSchema, bulkUpdateApplicationsSchema } from "./schema";
import { success, failure, respond } from "@/backend/http/response";

const application = new Hono<AppContext>();

// 지원하기
application.post(
  "/",
  zValidator("json", createApplicationSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const data = c.req.valid("json");
      const service = new ApplicationService(c.get("supabase"));

      await service.createApplication(userId, data);

      return respond(c, success({ message: "지원이 완료되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);

// 내 지원 목록
application.get("/my", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
    }

    const status = c.req.query("status");
    const service = new ApplicationService(c.get("supabase"));
    const data = await service.getMyApplications(userId, status);

    return respond(c, success(data));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 캠페인 지원자 목록 (광고주용)
application.get("/campaign/:campaignId", async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
    }

    const campaignId = c.req.param("campaignId");
    const service = new ApplicationService(c.get("supabase"));
    const data = await service.getApplicationsByCampaign(userId, campaignId);

    return respond(c, success(data));
  } catch (error: any) {
    return respond(c, failure(500, "INTERNAL_ERROR", error.message));
  }
});

// 지원 선정/반려 (일괄)
application.patch(
  "/campaign/:campaignId/bulk",
  zValidator("json", bulkUpdateApplicationsSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return respond(c, failure(401, "UNAUTHORIZED", "인증이 필요합니다"));
      }

      const campaignId = c.req.param("campaignId");
      const data = c.req.valid("json");
      const service = new ApplicationService(c.get("supabase"));

      await service.bulkUpdateApplications(userId, campaignId, data);

      return respond(c, success({ message: "처리가 완료되었습니다" }));
    } catch (error: any) {
      return respond(c, failure(500, "INTERNAL_ERROR", error.message));
    }
  }
);

export default application;