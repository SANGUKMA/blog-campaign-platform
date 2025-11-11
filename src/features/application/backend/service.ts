import { SupabaseClient } from "@supabase/supabase-js";
import { CreateApplicationInput, BulkUpdateApplicationsInput } from "./schema";

export class ApplicationService {
  constructor(private supabase: SupabaseClient) {}

  // 인플루언서 ID 조회
  async getInfluencerIdByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("influencer_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (error) throw new Error("인플루언서 프로필을 찾을 수 없습니다");
    return data.id;
  }

  // 지원하기
  async createApplication(userId: string, data: CreateApplicationInput) {
    const influencerId = await this.getInfluencerIdByUserId(userId);

    // 모집 기간 확인
    const { data: campaign, error: campaignError } = await this.supabase
      .from("campaigns")
      .select("recruitment_end_date, status")
      .eq("id", data.campaignId)
      .single();

    if (campaignError) throw new Error("체험단을 찾을 수 없습니다");
    
    if (campaign.status !== "recruiting") {
      throw new Error("모집 중인 체험단이 아닙니다");
    }

    const today = new Date().toISOString().split("T")[0];
    if (campaign.recruitment_end_date < today) {
      throw new Error("모집 기간이 종료되었습니다");
    }

    const { error } = await this.supabase.from("applications").insert({
      campaign_id: data.campaignId,
      influencer_id: influencerId,
      message: data.message,
      visit_date: data.visitDate,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error("이미 지원한 체험단입니다");
      }
      throw error;
    }
  }

  // 내 지원 목록
  async getMyApplications(userId: string, status?: string) {
    const influencerId = await this.getInfluencerIdByUserId(userId);

    let query = this.supabase
      .from("applications")
      .select(
        `
        *,
        campaign:campaigns(
          title,
          benefits,
          recruitment_end_date,
          status
        )
      `
      )
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // 캠페인 지원자 목록 (광고주용)
  async getApplicationsByCampaign(userId: string, campaignId: string) {
    // 광고주 확인
    const { data: advertiser, error: advError } = await this.supabase
      .from("advertiser_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (advError) throw new Error("광고주 프로필을 찾을 수 없습니다");

    // 캠페인 소유권 확인
    const { data: campaign, error: campError } = await this.supabase
      .from("campaigns")
      .select("advertiser_id")
      .eq("id", campaignId)
      .single();

    if (campError) throw new Error("체험단을 찾을 수 없습니다");
    if (campaign.advertiser_id !== advertiser.id) {
      throw new Error("권한이 없습니다");
    }

    const { data, error } = await this.supabase
      .from("applications")
      .select(
        `
        *,
        influencer:influencer_profiles(
          channel_name,
          channel_url,
          follower_count,
          profile:profiles(
            name,
            phone,
            email,
            birth_date
          )
        )
      `
      )
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  // 지원 선정/반려 (일괄 처리)
  async bulkUpdateApplications(
    userId: string,
    campaignId: string,
    data: BulkUpdateApplicationsInput
  ) {
    // 권한 확인
    const { data: advertiser, error: advError } = await this.supabase
      .from("advertiser_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (advError) throw new Error("광고주 프로필을 찾을 수 없습니다");

    const { data: campaign, error: campError } = await this.supabase
      .from("campaigns")
      .select("advertiser_id")
      .eq("id", campaignId)
      .single();

    if (campError) throw new Error("체험단을 찾을 수 없습니다");
    if (campaign.advertiser_id !== advertiser.id) {
      throw new Error("권한이 없습니다");
    }

    // 일괄 업데이트
    const { error } = await this.supabase
      .from("applications")
      .update({ status: data.status })
      .in("id", data.applicationIds)
      .eq("campaign_id", campaignId);

    if (error) throw error;

    // 선정 완료 시 캠페인 상태 업데이트
    if (data.status === "selected") {
      await this.supabase
        .from("campaigns")
        .update({ status: "completed" })
        .eq("id", campaignId);
    }
  }
}

