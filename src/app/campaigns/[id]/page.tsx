"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Campaign = {
  id: string;
  title: string;
  recruitment_start_date: string;
  recruitment_end_date: string;
  recruitment_count: number;
  benefits: string;
  store_info: string;
  mission: string;
  status: string;
  advertiser: {
    company_name: string;
    address: string;
    business_phone: string;
  };
};

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInfluencerProfile, setHasInfluencerProfile] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCampaign();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setHasInfluencerProfile(
          data.data?.role === "influencer" && !!data.data?.roleProfile
        );
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectedFrom=/campaigns/${params.id}`);
      return;
    }
    if (!hasInfluencerProfile) {
      alert("인플루언서 정보를 등록해야 지원할 수 있습니다.");
      router.push("/onboarding");
      return;
    }
    router.push(`/campaigns/${params.id}/apply`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">체험단을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← 뒤로가기
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary">모집중</Badge>
            <span className="text-sm text-gray-500">
              모집인원: {campaign.recruitment_count}명
            </span>
          </div>
          <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
          <p className="text-gray-600">{campaign.advertiser.company_name}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 모집 기간 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">모집 기간</h3>
            <p className="text-gray-700">
              {formatDate(campaign.recruitment_start_date)} ~{" "}
              {formatDate(campaign.recruitment_end_date)}
            </p>
          </div>

          {/* 제공 혜택 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">제공 혜택</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {campaign.benefits}
            </p>
          </div>

          {/* 미션 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">미션</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {campaign.mission}
            </p>
          </div>

          {/* 매장 정보 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">매장 정보</h3>
            <div className="space-y-1 text-gray-700">
              <p>{campaign.store_info}</p>
              <p>{campaign.advertiser.address}</p>
              <p>{campaign.advertiser.business_phone}</p>
            </div>
          </div>

          {/* 지원하기 버튼 */}
          <div className="pt-4">
            {campaign.status === "recruiting" ? (
              <Button onClick={handleApply} className="w-full" size="lg">
                지원하기
              </Button>
            ) : (
              <Button disabled className="w-full" size="lg">
                모집 종료
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

