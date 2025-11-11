import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateProfileInput,
  CreateInfluencerProfileInput,
  CreateAdvertiserProfileInput,
} from "./schema";

export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  // 공통 프로필 생성
  async createProfile(userId: string, data: CreateProfileInput) {
    const { error } = await this.supabase.from("profiles").insert({
      id: userId,
      name: data.name,
      birth_date: data.birthDate,
      phone: data.phone,
      email: data.email,
      role: data.role,
      terms_agreed_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  // 프로필 조회
  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // 프로필이 없으면 null 반환 (에러 던지지 않음)
    if (error && error.code === "PGRST116") {
      return null;
    }
    
    if (error) throw error;
    return data;
  }

  // 인플루언서 프로필 생성
  async createInfluencerProfile(
    userId: string,
    data: CreateInfluencerProfileInput
  ) {
    const { error } = await this.supabase.from("influencer_profiles").insert({
      user_id: userId,
      channel_name: data.channelName,
      channel_url: data.channelUrl,
      follower_count: data.followerCount,
    });

    if (error) throw error;

    // role 업데이트
    await this.supabase
      .from("profiles")
      .update({ role: "influencer" })
      .eq("id", userId);
  }

  // 인플루언서 프로필 조회
  async getInfluencerProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("influencer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  // 광고주 프로필 생성
  async createAdvertiserProfile(
    userId: string,
    data: CreateAdvertiserProfileInput
  ) {
    const { error } = await this.supabase.from("advertiser_profiles").insert({
      user_id: userId,
      company_name: data.companyName,
      address: data.address,
      business_phone: data.businessPhone,
      business_number: data.businessNumber,
      representative_name: data.representativeName,
    });

    if (error) throw error;

    // role 업데이트
    await this.supabase
      .from("profiles")
      .update({ role: "advertiser" })
      .eq("id", userId);
  }

  // 광고주 프로필 조회
  async getAdvertiserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("advertiser_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  // 사용자 전체 정보 조회
  async getFullProfile(userId: string) {
    const profile = await this.getProfile(userId);

    if (!profile) return null;

    let roleProfile = null;
    if (profile.role === "influencer") {
      roleProfile = await this.getInfluencerProfile(userId);
    } else if (profile.role === "advertiser") {
      roleProfile = await this.getAdvertiserProfile(userId);
    }

    return {
      ...profile,
      roleProfile,
    };
  }
}

