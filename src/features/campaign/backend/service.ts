import { SupabaseClient } from "@supabase/supabase-js";
import { CreateCampaignInput, UpdateCampaignStatusInput } from "./schema";

export class CampaignService {
  constructor(private supabase: SupabaseClient) {}

  // 광고주 ID 조회
  async getAdvertiserIdByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("advertiser_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (error) throw new Error("광고주 프로필을 찾을 수 없습니다");
    return data.id;
  }

  // 캠페인 생성
  async createCampaign(userId: string, data: CreateCampaignInput) {
    const advertiserId = await this.getAdvertiserIdByUserId(userId);

    const { error } = await this.supabase.from("campaigns").insert({
      advertiser_id: advertiserId,
      title: data.title,
      recruitment_start_date: data.recruitmentStartDate,
      recruitment_end_date: data.recruitmentEndDate,
      recruitment_count: data.recruitmentCount,
      benefits: data.benefits,
      store_info: data.storeInfo,
      mission: data.mission,
      status: "recruiting",
    });

    if (error) throw error;
  }

  // 모집 중인 캠페인 목록
  async getRecruitingCampaigns(limit = 20, offset = 0) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select(
        `
        *,
        advertiser:advertiser_profiles(
          company_name,
          address
        )
      `
      )
      .eq("status", "recruiting")
      .gte("recruitment_end_date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // 캠페인 상세 조회
  async getCampaignById(campaignId: string) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select(
        `
        *,
        advertiser:advertiser_profiles(
          company_name,
          address,
          business_phone
        )
      `
      )
      .eq("id", campaignId)
      .single();

    if (error) throw error;
    return data;
  }

  // 광고주의 캠페인 목록
  async getCampaignsByAdvertiser(userId: string) {
    const advertiserId = await this.getAdvertiserIdByUserId(userId);

    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // 캠페인 상태 변경
  async updateCampaignStatus(
    userId: string,
    campaignId: string,
    statusData: UpdateCampaignStatusInput
  ) {
    const advertiserId = await this.getAdvertiserIdByUserId(userId);

    // 캠페인 소유권 확인
    const { data: campaign, error: checkError } = await this.supabase
      .from("campaigns")
      .select("advertiser_id")
      .eq("id", campaignId)
      .single();

    if (checkError) throw checkError;
    if (campaign.advertiser_id !== advertiserId) {
      throw new Error("권한이 없습니다");
    }

    const { error } = await this.supabase
      .from("campaigns")
      .update({ status: statusData.status })
      .eq("id", campaignId);

    if (error) throw error;
  }

  // 캠페인 지원자 수 조회
  async getApplicationCount(campaignId: string) {
    const { count, error } = await this.supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId);

    if (error) throw error;
    return count || 0;
  }
}

